const db = require('../models');

//accepts string array and upserts locations based on filterRef which is name by default 
const upsertScanLocation = (scan, filterRef) => {
  return new Promise( async (resolve,reject) => {
    try {
      const locations = Array.isArray(scan.locations) ? scan.locations : [scan.locations]
      if (locations.filter(l => typeof l === 'string').length > 0) {
        throw 'Invalid locations array, please provide string array'
      }
      filterRef = filterRef || 'name'
      let updates = locations.map(l => ({
        updateOne: {
          filter: { 
            [filterRef]: { $regex: new RegExp(["^", l, "$"].join(""), "i") },
            company: scan.company
          },
          update: {
            name: l,
            boxId: scan._id,
            company: scan.company,
          },
          upsert: true,
        }
      }))
      let result = await db.Location.bulkWrite(updates)
      resolve({ result })
    } catch(err) {
      reject({ err })
    }
  })
}

const scanToPO = (boxScan,scanQty) => {
  return new Promise( async (resolve,reject) => {
    try {
      let updatedPoProduct,
        updatedProduct,
        updatedPo,
        updatedBoxScan = {};
      const genericInboundPo = await db.PurchaseOrder.findOne({ poRef: `${boxScan.company}-genericInbound` }) || {
        name: 'Generic Inbound',
        type: 'inbound',
        status: 'processing',
        poRef: `${boxScan.company}-genericInbound`,
        company: boxScan.company,
      }
      //define the current po, first array item if array, otherwise find in boxScan, if undefined in boxScan set to generic inbound po
      const currentPO = Array.isArray(boxScan.currentPOs) ? boxScan.currentPOs[0] : boxScan.currentPOs || genericInboundPo
      // find the po, otherwise set it to generic inbound defaults above to upsert
      let foundPo = await db.PurchaseOrder.findOne({ poRef: currentPO.poRef }) || genericInboundPo
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
      updatedPo = await db.PurchaseOrder.update({ poRef: foundPo.poRef }, {
        $setOnInsert: {
          createdOn: new Date(),
          name: foundPo.name,
          type: foundPo.type,
          status: foundPo.status,
          poRef: foundPo.poRef,
          company: boxScan.company,
        },
        $inc: { quantity: scanQty },
      }, { upsert: true });
      let foundBoxScan = await db.BoxScan.findOne({ skuCompany: boxScan.skuCompany, name: boxScan.name })
      if (foundBoxScan) {
        foundBoxScan.quantity += scanQty
        foundBoxScan.save()
        updatedBoxScan = foundBoxScan
      } else {
        updatedBoxScan = await db.BoxScan.create({
          ...boxScan,
          poRef: foundPo.poRef,
          createdOn: new Date(),
        })
      }
      resolve({
        updatedPoProduct,
        updatedProduct,
        updatedPo,
        updatedBoxScan,
      })
    } catch(err) {
      reject(err)
    }
  })
}

/*
* UPDATE/UPSERT Box Scan
rew.body.scan has user, quantity, barcode, name
*/
exports.upsertBoxScan = async (req,res,next) => {
  try {
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
      updatedPo,
      updatedBoxScan,
      completedPoProducts = {};
    // add the scanned product to PO instead of scan from PO
    if (req.body.scan.scanToPo === true) {
      let result = await scanToPO(boxScan, scanQty)
      if (boxScan.locations) {
        //upsert the locations
        await upsertScanLocation({ ...result.updatedBoxScan, locations: boxScan.locations }, 'name')
      }
      return res.status(200).json({
        ...result
      })
    }
    // otherwise continue to scan from currentPOs, make sure currentPOs is array
    if (!Array.isArray(req.body.scan.currentPOs)) {
      return next({
        status: 400,
        message: 'Please provide a PO or change scan type to inbound',
      })
    }
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
        if (boxScan.locations) {
          //upsert the locations
          await upsertScanLocation({ ...updatedBoxScan, locations: boxScan.locations },'name')
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
    console.log('final catch hit')
    return next(err);
  }
}