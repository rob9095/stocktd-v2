const db = require('../models');
const { validateHeaders, validateInputs } = require('../services/validateArray')
const { upsertPurchaseOrders } = require('./purchaseOrders')

const boxImportHeaders = [
  { value: 'sku', required: true },
  { value: 'box name', required: true },
  { value: 'locations'},
  { value: 'barcode' },
  { value: 'quantity', required: true },
  { value: 'scan from', type: 'controlled', validValues: ['yes']},
  { value: 'prefix' },
];
const boxValidInputs = [
  { value: 'sku', required: true },
  { value: 'name', required: true },
  { value: 'locations', type: 'array' },
  { value: 'barcode', },
  { value: 'quantity', required: true, type: 'number' },
  { value: 'prefix' },
];


//accepts string array and upserts locations based on filterRef which is name by default 
const upsertScanLocation = (upsertData) => {
  let { company, locations, filterRef } = upsertData
  return new Promise( async (resolve,reject) => {
    try {
      locations = Array.isArray(locations) ? locations : [locations]
      if (locations.filter(l => typeof l !== 'string').length > 0) {
        throw 'Invalid locations array, please provide string array'
      }
      let updates = locations.map(name => ({
        updateOne: {
          filter: { 
            [filterRef || 'name']: name,
            company,
          },
          update: {
            name,
            company,
          },
          upsert: true,
        }
      }))
      updates.length > 0 && await db.Location.bulkWrite(updates)
      //find the locations just upserted
      let foundLocations = updates.length > 0 ? await db.Location.find({$and: [{ $or: locations.map(name=>({name,company})) }]}) : []
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
      //define the current po, first array item if array, otherwise set to generic inbound po
      const currentPO = Array.isArray(boxScan.currentPOs) ? boxScan.currentPOs[0] : genericInboundPo
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

      updatedProduct = await db.Product.findOneAndUpdate({ skuCompany: boxScan.skuCompany, _id: boxScan.product }, {
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
      delete boxScan.quantity
      await db.BoxScan.update({
        skuCompany: { $regex: new RegExp(boxScan.skuCompany, "i") },
        name: { $regex: new RegExp(boxScan.name, "i") },
        po: poId,
        poProduct: updatedPoProduct._id,
        scanToPo: boxScan.scanToPo,
      },
        {
          lastScan: new Date(),
          $setOnInsert: {
            ...boxScan,
          },
          $inc: { quantity: scanQty },
        },
        { upsert: true }
      );
      updatedBoxScan = await db.BoxScan.findOne({
        skuCompany: { $regex: new RegExp(boxScan.skuCompany, "i") },
        name: { $regex: new RegExp(boxScan.name, "i") },
        po: poId
      })
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
      let andQuery = scan.currentPOs.map(p => ({ poRef: p.poRef, company: scan.company }))
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
            poProduct: updatedPoProduct._id,
          }
          delete boxScan.quantity
          await db.BoxScan.update({
              skuCompany: { $regex: new RegExp(boxScan.skuCompany, "i") },
              name: { $regex: new RegExp(boxScan.name, "i") },
              po: po._id,
              scanToPo: boxScan.scanToPo,
            },
            {
              lastScan: new Date(),
              $setOnInsert: {
                ...boxScan,
              },
              $inc: { quantity: scanQty },
            },
            { upsert: true }
            );
          updatedBoxScan = await db.BoxScan.findOne({
            skuCompany: { $regex: new RegExp(boxScan.skuCompany, "i") },
            name: { $regex: new RegExp(boxScan.name, "i") },
            po: po._id
          })
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

//Delete BoxScan - legacay
// exports.deleteBoxScans = async (req,res,next) => {
//   try {
//     if (!Array.isArray(req.body.data) || req.body.data.filter(id=>typeof id !== 'string').length>0) {
//       return next({
//         status: 404,
//         message: ['Please provide array of box ids in string format']
//       })
//     }
//     let foundBoxes = await db.BoxScan.find({company: req.body.company, $and: [{ $or: req.body.data.map(_id=>({_id})) }]})
//     console.log(foundBoxes)
//     // delete the boxes
// 		let deletes = foundBoxes.map(box => ({
//       deleteOne: {
//         filter: { _id: box._id }
//       }
//     }));
//     let productUpdates = []
//     let poProductUpdates = []
//     let foundBoxesScannedTo = foundBoxes.filter(box=>box.scanToPo===true)
//     if (foundBoxesScannedTo.length > 0) {
//       //remove box quantity from product
//       productUpdates = foundBoxesScannedTo.map(box => ({
//         updateOne: {
//           filter: { _id: box.product },
//           update: {
//             $inc: { quantity: parseInt(-box.quantity) },
//           }
//         }
//       }));
//       //remove box quantity from poProduct
//       poProductUpdates = foundBoxesScannedTo.map(box => ({
//         updateOne: {
//           filter: { _id: box.poProduct },
//           update: {
//             $inc: { quantity: parseInt(-box.quantity) },
//           }
//         }
//       }))
//     } else {
//       //remove box.quantity from scannedQuantity on the poProducts for boxes that were scanned to the po
//       poProductUpdates = foundBoxes.filter(box => box.scanToPo === false).map(box => ({
//         updateOne: {
//           filter: { _id: box.poProduct },
//           update: {
//             $inc: { scannedQuantity: parseInt(-box.quantity) },
//           }
//         }
//       }))
//     }
//     let deletedBoxes = deletes.length > 0 && await db.BoxScan.bulkWrite(deletes);
//     let updatedProducts = productUpdates.length > 0 && await db.Product.bulkWrite(productUpdates)
//     let updatedPoProducts = poProductUpdates.length > 0 && await db.PoProduct.bulkWrite(productUpdates)
//     return res.status(200).json({ deletedBoxes, updatedProducts, updatedPoProducts });
//   } catch(err) {
//     return next(err);
//   }
// }

// only support updates for box quantity, locations, name, prefix, and delete box
const updateBoxScans = (config) => {
  let { boxes, company, user } = config
  return new Promise( async (resolve, reject) => {
    try {
      if (!Array.isArray(boxes) || boxes.filter(box => typeof box.id !== 'string').length > 0) {
        reject({
          message: ['Please provide array of box ids in string format']
        })
      }
      //find the boxes to update
      let foundBoxes = await db.BoxScan.find({ company, $and: [{ $or: boxes.map(box => ({ _id: box.id })) }] })
      //update/remove the boxes
      let boxUpdates = []
      let productUpdates = []
      let poUpdates = []
      let poProductUpdates = []
      for (let box of foundBoxes) {
        let update = boxes.find(b=>b.id == box._id)
        let quantity = parseInt(update.quantity)
        let boxQty = parseInt(box.quantity)
        if (update.deleteDoc) {
          //push delete box update (delete box)
          boxUpdates.push({
            deleteOne: {
              filter: { _id: box._id }
            }
          })
          //push product update if scanToPo was true (remove box qty)
          box.scanToPo && productUpdates.push({
            updateOne: {
              filter: { _id: box.product },
              update: {
                $inc: { quantity: -boxQty },
              }
            }
          })
          //push poProduct update (remove box qty from qty or scannedQty depending on scanToPo)
          poProductUpdates.push({
            updateOne: {
              filter: { _id: box.poProduct },
              update: {
                $inc: { ...box.scanToPo ? { quantity: -boxQty } : { scannedQuantity: -boxQty} },
              }
            }
          })
          //push po update (remove box qty from quantity if scanToPo was true on box)
          box.scanToPo && poUpdates.push({
            updateOne: {
              filter: { _id: box.po },
              update: {
                $inc: { quantity: -boxQty },
              }
            }
          })
          // move to next iteration(box)
          continue
        }
        if (update.quantity) {
          let difference = quantity - boxQty
          //push box updates with new qty
          boxUpdates.push({
            updateOne: {
              filter: {_id: box._id},
              update: {
                quantity,
              }
            }
          })
          //push product updates with old/new qty difference if scanToPo is true
          box.scanToPo && productUpdates.push({
            updateOne: {
              filter: { _id: box.product },
              update: {
                $inc: { quantity: difference },
              }
            }
          })
          //push product updates with old/new qty difference, update quantity if scanToPo is true and scannedQuantity if false
          poProductUpdates.push({
            updateOne: {
              filter: { _id: box.poProduct },
              update: {
                $inc: { ...box.scanToPo ? { quantity: difference } : { scannedQuantity: difference } },
              }
            }
          })
          //push po quantity update if scanToPo is true
          box.scanToPo && poUpdates.push({
            updateOne: {
              filter: { _id: box.po },
              update: {
                $inc: { quantity: difference },
              }
            }
          })
        }
        if (update.locations) {
          //upate locations
          let locations = update.locations.length > 0 ? await upsertScanLocation({ company, locations: update.locations, filterRef: 'name' }) : []
          locations = locations.length > 0 ? locations.map(l=>l._id) : []
          //push the updated refs array to the box
          boxUpdates.push({
            updateOne: {
              filter: {_id: box._id},
              update: {
                locations,
              }
            }
          })
          delete update.locations
        }
        //check for any other generic updates, only name or prefix allowed currently
        if (update.name || update.prefix) {
          const { name, prefix } = update
          console.log({
            name,
            prefix
          })
          if (prefix) {
            //create the prefix
            await db.BoxPrefix.update({ name: prefix, company, user }, { name: prefix, company, user},{upsert: true})
          }
          //update box
          boxUpdates.push({
            updateOne: {
              filter: { _id: box._id },
              update: {
                ...name && { name },
                ...prefix && { prefix },
              }
            }
          })
        }
      }
      let updatedProducts = productUpdates.length > 0 && await db.Product.bulkWrite(productUpdates)
      let updatedPoProducts = poProductUpdates.length > 0 && await db.PoProduct.bulkWrite(poProductUpdates)
      let updatedPos = poUpdates.length > 0 && await db.PurchaseOrder.bulkWrite(poUpdates)
      let updatedBoxes = boxUpdates.length > 0 && await db.BoxScan.bulkWrite(boxUpdates)
      resolve({
        updatedProducts,
        updatedPoProducts,
        updatedPos,
        updatedBoxes,
      })
    } catch(err) {
      reject({
        ...err,
        message: err.toString()
      })
    }
  })
}

/*
* UPSERT Box Scan
rew.body.scan has user, quantity, barcode, name
*/
exports.upsertBoxScan = async (req, res, next) => {
  try {
    let [product, ...products] = await db.Product.find({
      company: req.body.company,
      ...req.body.scan.barcode && {barcode: { $regex: new RegExp(req.body.scan.barcode, "i") }},
      ...req.body.scan.sku && { sku: { $regex: new RegExp(req.body.scan.sku, "i") } }
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

  } catch (message) {
    console.log(message)
    return next({
      status: 404,
      message: message.toString(),
    })
  }
}

exports.deleteBoxScans = async (req, res, next) => {
  try {
    let result = await updateBoxScans({
      boxes: req.body.data.map(id => ({ id, deleteDoc: true })),
      company: req.body.company,
      user: req.body.user,
    })
    return res.status(200).json({ ...result });
  } catch (err) {
    return next(err);
  }
}

exports.handleBoxUpdates = async (req, res, next) => {
  try {
    let result = await updateBoxScans({
      boxes: req.body.data,
      company: req.body.company,
      user: req.body.user,
    })
    return res.status(200).json({ ...result });
  } catch (err) {
    console.log({err})
    return next(err);
  }
}

const bulkUpsertBoxScans = (config) => {
  let { data, company, user } = config
  return new Promise(async (resolve,reject) =>{
    try {
      //get existing values
      let purchaseOrders = await db.PurchaseOrder.find({ $and: [{ $or: data.map(row => ({ company: row.company, poRef: row.poRef })) }] })
      let poProducts = await db.PoProduct.find({ $and: [{ $or: data.map(row => ({ company: row.company, poRef: row.poRef, sku: row.sku })) }] })
      let products = await db.Product.find({ $and: [{ $or: data.map(row => ({ company: row.company, sku: row.sku })) }] })
      //get the first user's prefix for now
      let [prefix, ...others] = await db.BoxPrefix.find(({user: user}))
      //upsert the locations with unique set
      let locations = Array.from(new Set(data.filter(row => row.locations).map(row => row.locations.split(',')).reduce((acc, val) => acc.concat(val), [])))
      if (locations.length > 0) {
        locations = await upsertScanLocation({ locations, company, filterRef: 'name' })
      }
      let boxUpserts = data.map(box => {
        let po = purchaseOrders.find(po => po.poRef === box.poRef)
        let poProduct = poProducts.find(p => p.poRef === box.poRef && p.sku === box.sku)
        let product = products.find(p => p.sku === box.sku)
        if (!po || !poProduct || !product) {
          return({updateOne: false, data: { po, poProduct, product}})
        }
        let rowLocations = box.locations.split(',')
        let foundLocations = locations.filter(l=>rowLocations.includes(l.name))
        return({
          updateOne: {
            filter: {
              name: { $regex: new RegExp(box.name, "i") },
              company,
              product: product._id,
              po: po._id,
            },
            update: {
              ...foundLocations.length > 0 && { locations: foundLocations.map(l=>l._id) },
              $inc: {quantity: parseInt(box.quantity)},
              $setOnInsert: {
                name: box.name,
                sku: product.sku,
                skuCompany: product.skuCompany,
                company,
                scanToPo: box.scanToPo,
                poRef: po.poRef,
                po: po._id,
                poProduct: poProduct._id,
                product: product._id,
                user,
                prefix: box.prefix || prefix.name,
                createdOn: new Date(),
              }
            },
            upsert: true,
          }
        })
      })
      //get first value from missing data array
      let missing = boxUpserts.filter(u => u.updateOne === false)
      if (missing.length > 0){
        reject({
          missing: missing.map(m=>m.data),
          message: 'Import Failed: Missing purchase order or product data, please try again.',
        })
        return
      }
      let upsertedBoxScans = boxUpserts.length > 0 && await db.BoxScan.bulkWrite(boxUpserts)
      resolve({
        upsertedBoxScans,
      })
    } catch(err) {
      reject({
        ...err,
        message: err.toString()
      })
    }
  })
}

exports.importBoxScans = async (req, res, next) => {
  try {
    if (req.body.data.length > 7000) {
      return next({
        status: 404,
        message: ['Request to large'],
      })
    }
    let data = req.body.data.map(row => {
      const inputs = { sku, name, quantity, locations, barcode, prefix } = row
      return({
        ...inputs,
        //if scan from value in row is yes use quantity as scannedQuantity and set scanToPo to false
        ...row['scan from'] === 'yes' ? {scannedQuantity: quantity, scanToPo: false} : {scanToPo: true},
        //if we got didn't get a po name and po type set to generic inbound
        ...row['po name'] && row['po type'] ?
          { poRef: req.body.company + "-" + row['po name'] + "-" + row['po type'], poName: row['po name'], poType: row['po type'] }
          :
          { poRef: req.body.company +'-genericInbound', poName: 'Generic Inbound', poType: 'inbound'},
        name: row['box name'],
        company: req.body.company,
      })
    })
    //validate inputs will go here

    //upsert the pos, also upserts poProducts & products
    let poResult = await upsertPurchaseOrders({
      company: req.body.company,
      data: data.map(row => ({
        name: row.poName,
        type: row.poType,
        poRef: row.poRef,
        sku: row.sku,
        quantity: row.quantity,
        ...row.scannedQuantity && { scannedQuantity: row.scannedQuantity }
      }))
    })

    //upsert the boxScans
    let boxScanResult = await bulkUpsertBoxScans({
      data,
      company: req.body.company,
      user: req.body.user,
    })
    return res.status(200).json({ ...poResult, ...boxScanResult });
  } catch(err){
    return next(err)
  }
}