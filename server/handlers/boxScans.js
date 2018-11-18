const db = require('../models');

/*
* UPDATE/UPSERT Box Scan
rew.body.scan has user, quantity, barcode, name
*/

exports.upsertBoxScan = async (req,res,next) => {
  try {
    let product = await db.Product.find({barcode: { $regex : new RegExp(req.body.scan.barcode, "i") }})
    if (!product) {
      return next({
        status: 400,
        message: ['Barcode not found']
      })
    }
    let andQuery = req.body.poRefs.map(poRef=>({poRef}))
    let poProducts = await db.PoProduct.find({
      skuCompany: product.skuCompany,
      $and: [{$or: andQuery}],
    })
    let updatedPoProduct = {}
    let updatedPoRef = ''
    let boxScan = {
      ...req.body.scan,
      sku: product.skuCompany,
      company: req.body.company,
    }
    let updatedBoxScan = {}
    for (let poRef of req.body.poRefs) {
      let poProduct = poProducts.find(p=>p.skuCompany === product.skuCompany && poRef === p.poRef)
      if (poProduct) {
        updatedPoRef = poRef
        let markComplete = poProduct.complete ? true : poProduct.scannedQuantity + req.body.scan.quantity === poProduct.quantity ? true : false
        updatedPoProduct = await db.findByIdAndUpdate(poProduct._id,{
          $inc: { scannedQuantity: parseInt(req.body.scan.quantity) },
          status: markComplete ? 'complete' : 'processing',
        })
        if (markComplete) {
          let notComplete = poProducts.filter(p=>p.poRef === poRef && poProduct._id !== p._id && p.status === 'processing')
          if (notComplete.length === 0) {
            let updatedPo = await db.PurchaseOrder.find({poRef: poRef})
            updatedPo.status = 'complete'
            updatedPo.save();
          }
        }
        boxScan = {
          ...boxScan,
          poRef,
          createdOn: new Date(),
        }
        updatedBoxScan = await db.BoxScan.findOneAndUpdate(
          {sku: boxScan.sku, name: boxScan.name},
          {...boxScan, $inc: { quantity: parseInt(boxScan.quantity) }},
          {upsert: true},
        )
        break;
      }
    }
    return res.status(200).json({
      updatedPoProduct,
      updatedPoRef,
      updatedBoxScan,
    })
  } catch(err) {
    return next(err);
  }
}