const db = require('../models');

exports.updatePoProducts = async (req, res, next) => {
  try {
    let poProductUpdates = req.body.updates.map(p=>{
      return ({
        updateOne: {
          filter: {_id: p.id},
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
          filter: {poRef: p.poRef},
          update: {
            $inc: { quantity: parseInt(qty) },
          }
        }
      })
    })
    let updatedPos = await db.PurchaseOrder.bulkWrite(poUpdates)
    let updatedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
    let updatedProducts = await db.Product.bulkWrite(productUpdates)
    return res.status(200).json({
      updatedPos,
      updatedProducts,
      updatedPoProducts,
    })
  } catch(err) {
    return next(err);
  }
}
