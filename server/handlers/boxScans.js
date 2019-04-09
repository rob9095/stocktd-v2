const db = require('../models');

/*
* UPDATE/UPSERT Box Scan
rew.body.scan has user, quantity, barcode, name
*/
exports.upsertBoxScan = async (req,res,next) => {
  try {
    // if no po os provided or we are not scanning to a po
    if (req.body.scan.currentPOs.length === 0 && req.body.scan.scanToPo === false) {
      return next({
        status: 400,
        message: "No Purchase Order Provided"
      });
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
    let boxScan = {
      ...req.body.scan,
      skuCompany: product.skuCompany,
      sku: product.sku,
      company: req.body.company,
    }
    const scanQty = parseInt(req.body.scan.quantity)
    let updatedPoProduct,
      updatedProduct,
      updatedPo,
      updatedBoxScan,
      completedPoProducts = {};
    // add the scanned product to PO instead of scan from PO
    if (req.body.scan.scanToPo === true) {
      const genericInboundPo = await db.PurchaseOrder.findOne({ poRef: `${boxScan.company}-genericReceiving` }) || {
        name: 'Scanned Inventory Received',
        type: 'inbound',
        status: 'processing',
        poRef: `${boxScan.company}-genericReceiving`,
        company: boxScan.company,
      }
      //check if a po was provided as first po in poRefs array
      let foundPo = await db.PurchaseOrder.findOne({poRef: req.body.scan.currentPOs[0].poRef}) || genericInboundPo
      //upsert poProduct, update Product, upsert Purchase Order, upsert boxScan
      await db.PoProduct.update({ poRef: foundPo.poRef, skuCompany: boxScan.skuCompany }, {
        $setOnInsert: {
          createdOn: new Date(),
          scannedQuantity: 0,
          name: foundPo.name,
          sku: boxScan.sku,
          skuCompany: boxScan.skuCompany,
          type: foundPo.type,
          status: foundPo.status,
          poRef: foundPo.poRef,
          company: boxScan.company,
        },
        $inc: { quantity: scanQty },
      }, { upsert: true });
      updatedPoProduct = await db.PoProduct.findOne({ poRef: foundPo.poRef, skuCompany: boxScan.skuCompany })

      updatedProduct = await db.Product.findOneAndUpdate({ skuCompany: boxScan.skuCompany }, {
        $inc: { quantity: scanQty }
      });
      updatedPo = await db.PurchaseOrder.update({poRef: foundPo.poRef}, {
        $setOnInsert: {
          createdOn: new Date(),
          name: foundPo.name,
          type: foundPo.type,
          status: foundPo.status,
          poRef: foundPo.poRef,
          company: boxScan.company,
        },
        $inc: { quantity: scanQty },
      }, {upsert: true});
      delete boxScan.quantity
      updatedBoxScan = await db.BoxScan.update({ skuCompany: boxScan.skuCompany, name: boxScan.name }, {
        ...boxScan,
        poRef: foundPo.poRef,
        createdOn: new Date(),
        $inc: { quantity: scanQty },
      }, { upsert: true });
      return res.status(200).json({
        updatedPoProduct,
        updatedProduct,
        updatedPo,
        updatedBoxScan,
      })
    }
    // continue to scan from PO
    let andQuery = req.body.scan.currentPOs.map(p=>({poRef: p.poRef}))
    let poProducts = await db.PoProduct.find({
      $and: [{$or: andQuery}],
    })
    for (let po of req.body.scan.currentPOs) {
      let poProduct = poProducts.find(p=>p.skuCompany === product.skuCompany && po.poRef === p.poRef)
      if (poProduct) {
        // product found
        updatedPo = po
        await db.PoProduct.findByIdAndUpdate(poProduct._id,{
          $inc: { scannedQuantity: scanQty },
        })
        updatedPoProduct = await db.PoProduct.findOne({_id: poProduct._id})
        let markComplete = updatedPoProduct.scannedQuantity >= updatedPoProduct.quantity 
        if (markComplete) {
          let notComplete = poProducts.filter(p=>p.poRef === po.poRef && p.quantity > p.scannedQuantity && p.skuCompany !== updatedPoProduct.skuCompany)
          if (notComplete.length === 0) {
            updatedPoProduct.status = 'complete'
            // find and update the po status
            let updatedPo = await db.PurchaseOrder.findOne({poRef: po.poRef})
            updatedPo.status = 'complete'
            updatedPo.save()
            // update all poProducts
            let poProductUpdates = poProducts.filter(p=>p.poRef === po.poRef).map(p=>({
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
          poRef: po.poRef,
          createdOn: new Date(),
          scanToPo: false,
        }
        let foundBoxScan = await db.BoxScan.findOne({skuCompany: boxScan.skuCompany, name: boxScan.name})
        if (foundBoxScan) {
          foundBoxScan.quantity += scanQty
          foundBoxScan.save()
          updatedBoxScan = foundBoxScan
        } else {
          updatedBoxScan = await db.BoxScan.create(boxScan)
        }
        break;
      }
    }
    if (!updatedPo._id) {
      return next({
        status: 400,
        message: 'Product not found on PO',
        product,
      }) 
    }
    return res.status(200).json({
      updatedPoProduct,
      updatedPo,
      updatedBoxScan,
      completedPoProducts,
    })
  } catch(err) {
    return next(err);
  }
}