const db = require('../models');

/*
* UPDATE/UPSERT Box Scan
rew.body.scan has user, quantity, barcode, name
*/

exports.upsertBoxScan = async (req,res,next) => {
  try {
    let [product,...products] = await db.Product.find({
      company: req.body.company,
      barcode: { $regex : new RegExp(req.body.scan.barcode, "i") }
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
      skuCompany: product.skuCompany,
      $and: [{$or: andQuery}],
    })
    let updatedPoProduct = {}
    let updatedPoRef = ''
    let boxScan = {
      ...req.body.scan,
      skuCompany: product.skuCompany,
      sku: product.sku,
      company: req.body.company,
    }
    let updatedBoxScan = {}
    for (let poRef of req.body.poRefs) {
      console.log(poProducts)
      console.log(poRef)
      let poProduct = poProducts.find(p=>p.skuCompany === product.skuCompany && poRef === p.poRef)
      console.log(poProduct)
      if (poProduct) {
        // product found
        updatedPoRef = poRef
        let markComplete =  poProduct.scannedQuantity + req.body.scan.quantity >= poProduct.quantity ? true : false
        await db.PoProduct.findByIdAndUpdate(poProduct._id,{
          $inc: { scannedQuantity: parseInt(req.body.scan.quantity) },
          status: markComplete ? 'complete' : 'processing',
        })
        updatedPoProduct = await db.PoProduct.findOne({_id: poProduct._id})
        if (markComplete) {
          let notComplete = poProducts.filter(p=>p.poRef === poRef && p.quantity === scannedQuantity)
          if (notComplete.length === 0) {
            let updatedPo = await db.PurchaseOrder.find({poRef: poRef})
            updatedPo.status = 'complete'
            updatedPo.scanned = true
            updatedPo.save();
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
        message: 'Item not found on current POs',
      }) 
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