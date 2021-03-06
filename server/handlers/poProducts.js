const db = require('../models');
const { upsertPurchaseOrders } = require('./purchaseOrders')
const { validateSchema } = require('../middleware/validator');

/*
* UPDATE PoProducts and associated Purchase Order and Products
* Accepted Values: updates obj array in req.body
* Returns: bulkWrite array result
*/
exports.updatePoProducts = async (req, res, next) => {
  try {
    if (req.body.updates.length > 7000) {
      return next({
        status: 400,
        message: ['Request to large'],
      })      
    }
    if (!Array.isArray(req.body.updates) || req.body.updates.filter(p=>!p.id).length > 0) {
      return next({
        status: 400,
        message: ['Please provide update array with id']
      })
    }
    let data = await db.PoProduct.find({ company: req.body.company, $and: [{ $or: req.body.updates.map(p => ({ _id: p.id })) }]})
    data = data.map(doc=>{
      let update = req.body.updates.find(u=>u.id == doc._id)
      return({
        ...doc,
        ...update.quantity && {quantity: parseInt(update.quantity) - parseInt(doc.quantity)},
        ...update.scannedQuantity && {scannedQuantity: parseInt(update.scannedQuantity) - parseInt(doc.scannedQuantity)},
        //allow nested updates for product barcode
        ...update.productbarcode && { barcode: update.productbarcode },
        name: doc.name,
        type: doc.type,
        status: doc.status,
        //poRef: doc.poRef,
        sku: doc.sku,
      })
    })

    //upsert the pos, also upserts poProducts & products
    let schemaData = {
      company: req.body.company,
      json: data,
    }
    let validData = validateSchema({data: schemaData, schema: '/api/purchase-orders/import-csv'})
    if (validData.error) {
      return next({
        status: 400,
        message: validData.error.details.map(d => d.message),
      })
    }
    let poResult = await upsertPurchaseOrders({data:validData.value.json, company: req.body.company,})

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
    let { data, company } = req.body
    //find the poProducts
    let poProducts = await db.PoProduct.find({company, $and: [{$or: data.map(_id=>({_id}))}]})
    if (!poProducts.length){
      return next({
        status: 400,
        message: 'No purchase order products found',
      })
    }
    let poProductRemovals = poProducts.map(p=>{
      return ({
        deleteOne: {
          filter: {_id: p._id},
        }
      })
    })
    let productUpdates = poProducts.map(p => {
      return({
        updateOne: {
          filter: {_id: p.product},
          update: {
            $inc: p.type === 'outbound' ?
              { quantity: parseInt(p.quantity) }
              :
              { quantity: parseInt(-p.quantity) },
          }
        }
      })
    })
    let poUpdates = poProducts.map(p => {
      return ({
        updateOne: {
          filter: {_id: p.po, company},
          update: {
            $inc: { quantity: parseInt(-p.quantity) }
          }
        }
      })
    })
    // need to either delete boxes scannedTo and scannedFrom this po or move to generic pos
    // just delete boxes for now..
    let boxRemovals = poProducts.map(p => {
      return({
        deleteOne: {
          filter: {po: p.po, poProduct: p._id},
        }
      })
    })
    let updatedPos = await db.PurchaseOrder.bulkWrite(poUpdates)
    let removedPoProducts = await db.PoProduct.bulkWrite(poProductRemovals)
    let updatedProducts = await db.Product.bulkWrite(productUpdates)
    let removedBoxes = await db.BoxScan.bulkWrite(boxRemovals)
    //define the updated poIds
    let poIds = data.map(p=>({_id: p.po})).reduce((acc,cv)=>acc.map(po => po._id).indexOf(cv._id) !== -1 ? [...acc] : [...acc, cv], [])
    //find any remaining poProducts on po's
    let foundPoProducts = await db.PoProduct.find({company, quantity: { $lte: 0 }, $and: [{$or: poIds}] })
    let removedPos = []
    //loop the poIds and check if there are any remaining poProducts, delete the po if there isn't any remaining poProducts
    let poRemovals = poIds.filter(po => !foundPoProducts.map(p => p.po).includes(po._id)).map(po => ({
      deleteOne: {
        filter: { _id: po._id }
      }
    }))
    removedPos = poRemovals.length > 0 && await db.PurchaseOrder.bulkWrite(poRemovals)
    return res.status(200).json({
      removedBoxes,
      removedPos,
      updatedPos,
      removedPoProducts,
      updatedProducts,
    })
  } catch(err) {
    return next(err);
  }
}
