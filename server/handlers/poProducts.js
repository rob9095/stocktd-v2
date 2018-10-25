const db = require('../models');

/*
* UPDATE PoProducts and associated Purchase Order and Products
* Accepted Values: updates obj array in req.body
* Returns: bulkWrite array result
*/
exports.updatePoProducts = async (req, res, next) => {
  try {
    let poProductUpdates = req.body.updates.map(p=>{
      return ({
        updateOne: {
          filter: {_id: p._id},
          update: {...p},
        }
        })
    })
    let productUpdates = req.body.updates.map(p => {
      let qty = parseInt(p.quantity) - parseInt(p.oldQty)
      return({
        updateOne: {
          filter: {skuCompany: p.sku+"-"+req.body.company},
          update: {
            $inc: { quantity: parseInt(qty) },
          }
        }
      })
    })
    let poUpdates = req.body.updates.map(p => {
      let qty = parseInt(p.quantity) - parseInt(p.oldQty)
      return ({
        updateOne: {
          filter: {poRef: p.poRef, company: req.body.company},
          update: {
            $inc: { quantity: parseInt(qty) },
          }
        }
      })
    })
    let updatedPos = await db.PurchaseOrder.bulkWrite(poUpdates)
    let updatedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
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
      poRemovals,
      updatedPos,
      updatedProducts,
      updatedPoProducts,
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
