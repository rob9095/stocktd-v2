const db = require('../models');
const { upsertPurchaseOrders } = require('./purchaseOrders')

/*
* UPDATE PoProducts and associated Purchase Order and Products
* Accepted Values: updates obj array in req.body
* Returns: bulkWrite array result
*/
exports.updatePoProducts = async (req, res, next) => {
  try {
    if (req.body.updates.length > 7000) {
      return next({
        status: 404,
        message: ['Request to large'],
      })      
    }
    if (!Array.isArray(req.body.updates) || req.body.updates.filter(p=>!p.id || !p.quantity).length > 0) {
      return next({
        status: 404,
        message: ['Please provide update array with id and quantity']
      })
    }
    let data = await db.PoProduct.find({ company: req.body.company, $and: [{ $or: req.body.updates.map(p => ({ _id: p.id })) }]})
    data = data.map(doc=>{
      let update = req.body.updates.find(u=>u.id == doc._id)
      return({
        ...doc,
        quantity: parseInt(update.quantity) - parseInt(doc.quantity),
        ...update.scannedQuantity && {scannedQuantity: parseInt(update.scannedQuantity) - parseInt(doc.scannedQuantity)}
      })
    })

    //upsert the pos, also upserts poProducts & products
    let poResult = await upsertPurchaseOrders({
      company: req.body.company,
      data: data.map(doc => ({
        name: doc.name,
        type: doc.type,
        poRef: doc.poRef,
        sku: doc.sku,
        quantity: doc.quantity,
        ...doc.scannedQuantity && { scannedQuantity: doc.scannedQuantity }
      }))
    })
    
    //old update approach
    // let poProductUpdates = req.body.updates.map(p=>{
    //   let quantity
    //   return ({
    //     updateOne: {
    //       filter: {_id: p.id},
    //       update: {
    //         quantity:,
    //       },
    //     }
    //     })
    // })
    // let productUpdates = req.body.updates.map(p => {
    //   let qty = parseInt(p.quantity) - parseInt(p.oldQty)
    //   return({
    //     updateOne: {
    //       filter: {skuCompany: p.sku+"-"+req.body.company},
    //       update: {
    //         $inc: { quantity: parseInt(qty) },
    //       }
    //     }
    //   })
    // })
    // let poUpdates = req.body.updates.map(p => {
    //   let qty = parseInt(p.quantity) - parseInt(p.oldQty)
    //   return ({
    //     updateOne: {
    //       filter: {poRef: p.poRef, company: req.body.company},
    //       update: {
    //         $inc: { quantity: parseInt(qty) },
    //       }
    //     }
    //   })
    // })
    // let updatedPos = await db.PurchaseOrder.bulkWrite(poUpdates)
    // let updatedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
    // let updatedProducts = await db.Product.bulkWrite(productUpdates)
    // let emptyPOs = await db.PurchaseOrder.find({company: req.body.company, quantity: 0})
    // let poRemovals = emptyPOs.map(po=>({
    //   deleteOne: {
    //     filter: {_id: po.id}
    //   }
    // }))
    // let removedPos = []
    // if (poRemovals.length > 0) {
    //   removedPos = await db.PurchaseOrder.bulkWrite(poRemovals)
    // }
    // return res.status(200).json({
    //   poRemovals,
    //   updatedPos,
    //   updatedProducts,
    //   updatedPoProducts,
    // })
    return res.status(200).json({
      poResult,
    })
  } catch(err) {
    return next(err);
  }
}

/*
* DELETE PoProducts and update associated Purchase Orders and Products
* Accepted Values: data obj array in req.body.
* Returns: bulkWrite array result
*/
exports.removePoProducts = async (req, res, next) => {
  try {
    let poProductRemovals = req.body.data.map(p=>{
      return ({
        deleteOne: {
          filter: {_id: p._id},
        }
      })
    })
    let productUpdates = req.body.data.map(p => {
      return({
        updateOne: {
          filter: {skuCompany: p.sku+"-"+req.body.company},
          update: {
            $inc: p.type === 'outbound' ?
              { quantity: parseInt(p.quantity) }
              :
              { quantity: parseInt(-p.quantity) },
          }
        }
      })
    })
    let poUpdates = req.body.data.map(p => {
      return ({
        updateOne: {
          filter: {poRef: p.poRef, company: req.body.company},
          update: {
            $inc: { quantity: parseInt(-p.quantity) }
          }
        }
      })
    })
    let updatedPos = await db.PurchaseOrder.bulkWrite(poUpdates)
    let removedPoProducts = await db.PoProduct.bulkWrite(poProductRemovals)
    let updatedProducts = await db.Product.bulkWrite(productUpdates)
    let emptyPOs = await db.PurchaseOrder.find({company: req.body.company, quantity: 0})
    let poRemovals = emptyPOs.map(po=>({
      deleteOne: {
        filter: {_id: po.id}
      }
    }))
    let removedPos = []
    if (poRemovals.length > 0) {
      removedPos = await db.PurchaseOrder.bulkWrite(poRemovals)
    }
    return res.status(200).json({
      removedPos,
      updatedPos,
      removedPoProducts,
      updatedProducts,
    })
  } catch(err) {
    return next(err);
  }
}
