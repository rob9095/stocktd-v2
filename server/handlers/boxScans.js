const db = require('../models');

//accepts string array and upserts locations based on filterRef which is name by default 
const upsertScanLocation = (upsertData) => {
  let { company, locations, filterRef } = upsertData
  return new Promise( async (resolve,reject) => {
    try {
      locations = Array.isArray(locations) ? locations : [locations]
      if (locations.filter(l => typeof l !== 'string').length > 0) {
        throw 'Invalid locations array, please provide string array'
      }
      filterRef = filterRef || 'name'
      let updates = locations.map(name => ({
        updateOne: {
          filter: { 
            [filterRef]: { $regex: new RegExp(["^", name, "$"].join(""), "i") },
            company,
          },
          update: {
            name,
            company,
          },
          upsert: true,
        }
      }))
      await db.Location.bulkWrite(updates)
      //find the locations just upserted
      let foundLocations = await db.Location.find({$and: [{ $or: locations.map(name=>({name,company})) }]})
      resolve(foundLocations)
    } catch(err) {
      reject(err)
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
      //upsert the locations if neccessary
      if (boxScan.locations && boxScan.locations.length > 0) {
        let locations = await upsertScanLocation({ ...boxScan, filterRef: 'name' })
        boxScan.locations = locations.length > 0 ? locations.map(l=>l._id) : []
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
      let poId = updatedPo.upserted ? updatedPo.upserted[0]._id : foundPo._id
      let foundBoxScan = await db.BoxScan.findOne({ skuCompany: boxScan.skuCompany, name: boxScan.name, po: poId })
      if (foundBoxScan) {
        foundBoxScan.quantity += scanQty
        foundBoxScan.lastScan = new Date()
        foundBoxScan.save()
        updatedBoxScan = foundBoxScan
      } else {
        updatedBoxScan = await db.BoxScan.create({
          ...boxScan,
          poRef: foundPo.poRef,
          po: poId,
          createdOn: new Date(),
        })
      }
      resolve({
        updatedPoProduct,
        updatedProduct,
        updatedPo,
        updatedBoxScan,
        scanQty,
      })
    } catch(err) {
      reject(err)
    }
  })
}

const scanFromPO = (scan, scanQty, product) => {
  return new Promise( async (resolve,reject) => {
    try {
      let updatedPoProduct = {};
      let updatedBoxScan = {};
      let completedPoProducts = {};
      let updatedPo = {};
      let andQuery = scan.currentPOs.map(p => ({ poRef: p.poRef }))
      let poProducts = await db.PoProduct.find({
        $and: [{ $or: andQuery }],
      })
      let poIndex = 0
      for (let po of scan.currentPOs) {
        let poProduct = poProducts.find(p => p.skuCompany === product.skuCompany && po.poRef === p.poRef)
        if (poProduct) {
          // product found
          updatedPo = po
          //update locations if neccesary
          if (scan.locations && scan.locations.length > 0) {
            let locations = await upsertScanLocation({ ...scan, filterRef: 'name' })
            scan.locations = locations.length > 0 ? locations.map(l => l._id) : []
          }
          //find the poProduct and throw error if we overscanned and allowExcess is not enabled for po
          updatedPoProduct = await db.PoProduct.findOne({_id: poProduct._id})
          if (updatedPoProduct.scannedQuantity + scanQty > updatedPoProduct.quantity && !po.allowExcess) {
            // if there are more POs to check skip this iteration and continue, otherwise throw overscan error
            if (poIndex + 1 < scan.currentPOs.length) {
              continue
            }
            resolve({
              error: {
                message: 'Scanned Quantity exceeds PO Product Quantity',
                options: ['Add Quantity', 'Allow Excess', 'Remove PO'],
                poProduct: updatedPoProduct,
                barcode: product.barcode,
                po,
              }
            })
          }
          //update scanQty on poProduct
          updatedPoProduct.scannedQuantity += scanQty
          updatedPoProduct.save()
          let markComplete = updatedPoProduct.scannedQuantity >= updatedPoProduct.quantity
          if (markComplete) {
            let notComplete = poProducts.filter(p => p.poRef === po.poRef && p.quantity > p.scannedQuantity && p.skuCompany !== updatedPoProduct.skuCompany)
            if (notComplete.length === 0) {
              // find and update the po status
              updatedPo = await db.PurchaseOrder.findOne({ poRef: po.poRef })
              updatedPo.status = 'complete'
              updatedPo.save()
              // update all poProducts
              let poProductUpdates = poProducts.filter(p => p.poRef === po.poRef).map(p => ({
                updateOne: {
                  filter: { _id: p._id },
                  update: { status: 'complete' }
                }
              }))
              completedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
            }
          }
          let boxScan = {
            ...scan,
            poRef: po.poRef,
            po: po._id,
            createdOn: new Date(),
            scanToPo: false,
          }
          let foundBoxScan = await db.BoxScan.findOne({ skuCompany: boxScan.skuCompany, name: boxScan.name, po: po._id })
          if (foundBoxScan) {
            foundBoxScan.quantity += scanQty
            foundBoxScan.lastScan = new Date()
            foundBoxScan.save()
            updatedBoxScan = foundBoxScan
          } else {
            updatedBoxScan = await db.BoxScan.create(boxScan)
          }
          break;
        }
        poIndex++
      }
      //if we looped all current POs and didn't find a PO to update in the result
      if (!updatedPo._id) {
        resolve({
          error: {
            message: "Product not found on provided POs",
            options: ["Add PO"],
            product,
            barcode: product.barcode,
          }
        });
      }
      resolve({
        updatedPoProduct,
        updatedPo,
        updatedBoxScan,
        completedPoProducts,
        scanQty,
      })
    }  catch(err) {
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
      lastScan: new Date(),
      product: product._id,
    }
    const scanQty = parseInt(req.body.scan.quantity);
    // add the scanned product to PO instead of scan from PO
    if (req.body.scan.scanToPo === true) {
      let result = await scanToPO(boxScan, scanQty)
      return res.status(200).json({
        ...result
      })
    }

    //scan from the PO
    let result = await scanFromPO(boxScan, scanQty, product)
    if (result.error) {
      return next({
        status: 400,
        ...result.error
      }) 
    }
    return res.status(200).json({
      ...result
    })
    
  } catch(message) {
    console.log(message)
    return next({
      status: 404,
      message: message.toString(),
    })
  }
}