const db = require('../models');

/*
* UPDATE/UPSERT Box Scan
rew.body.scan has user, quantity, barcode, name
*/

exports.upsertBoxScan = async (req,res,next) => {
  try {
    if (req.body.poRefs.length === 0) {
      return next({
        status: 400,
        message:  'No Purchase Order Provided'
      })
    }
    let [product,...products] = await db.Product.find({
      company: req.body.company,
      barcode: { $regex : new RegExp(["^", req.body.scan.barcode, "$"].join(""), "i") }
    })
    if (!product) {
      return next({
        status: 400,
        message: 'Barcode not found',
      })
    }
    let andQuery = req.body.poRefs.map(poRef=>({poRef}))
    console.log(andQuery)
    let poProducts = await db.PoProduct.find({
      $and: [{$or: andQuery}],
    })
    console.log(poProducts)
    let updatedPoProduct = {}
    let updatedPoRef = ''
    let boxScan = {
      ...req.body.scan,
      skuCompany: product.skuCompany,
      sku: product.sku,
      company: req.body.company,
    }
    let updatedBoxScan = {}
    let completedPoProducts = {}
    for (let poRef of req.body.poRefs) {
      let poProduct = poProducts.find(p=>p.skuCompany === product.skuCompany && poRef === p.poRef)
      console.log(poProduct)
      if (poProduct) {
        // product found
        updatedPoRef = poRef
        await db.PoProduct.findByIdAndUpdate(poProduct._id,{
          $inc: { scannedQuantity: parseInt(req.body.scan.quantity) },
        })
        updatedPoProduct = await db.PoProduct.findOne({_id: poProduct._id})
        let markComplete = updatedPoProduct.scannedQuantity >= updatedPoProduct.quantity 
        console.log(updatedPoProduct)
        console.log(markComplete)
        if (markComplete) {
          let notComplete = poProducts.filter(p=>p.poRef === poRef && p.quantity > p.scannedQuantity && p.skuCompany !== updatedPoProduct.skuCompany)
          console.log(notComplete)
          if (notComplete.length === 0) {
            updatedPoProduct.status = 'complete'
            // find and update the po status
            let updatedPo = await db.PurchaseOrder.findOne({poRef})
            updatedPo.status = 'complete'
            updatedPo.save()
            // update all poProducts
            let poProductUpdates = poProducts.filter(p=>p.poRef === poRef).map(p=>({
              updateOne: {
                filter: {_id: p._id},
                update: {status: 'complete'}
              }
            }))
            completedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
          }
        }
        boxScan = {
          ...boxScan,
          poRef,
          createdOn: new Date(),
        }
        let foundBoxScan = await db.BoxScan.findOne({skuCompany: boxScan.skuCompany, name: boxScan.name})
        if (foundBoxScan) {
          foundBoxScan.quantity += parseInt(boxScan.quantity)
          foundBoxScan.save()
          updatedBoxScan = foundBoxScan
        } else {
          updatedBoxScan = await db.BoxScan.create(boxScan)
        }
        break;
      }
    }
    if (!updatedPoRef) {
      return next({
        status: 400,
        message: 'Product not found on current POs',
      }) 
    }
    return res.status(200).json({
      updatedPoProduct,
      updatedPoRef,
      updatedBoxScan,
      completedPoProducts,
    })
  } catch(err) {
    return next(err);
  }
}