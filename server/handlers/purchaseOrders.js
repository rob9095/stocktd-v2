const db = require('../models');

function groupBy(objectArray, property) {
 return objectArray.reduce(function (acc, obj) {
   var key = obj[property];
   if (!acc[key]) {
     acc[key] = [];
   }
   acc[key].push(obj);
   return acc;
 }, {});
}

/*
* UPDATE/UPSERT Purchase Order, associated PoProducts, and associated Products
* Accepted Values: name, type, status, sku, quantity, company, skuCompany, poRef
* Returns: bulkWrite array result
*/
exports.handlePOImport = async (req, res, next) => {
  try{
    if (req.body.json.length > 7000) {
			return next({
				status: 404,
				message: ['Request to large']
			})
		}
    const company = req.body.company
    let poData = req.body.json.map((po,i)=>({
      name: po['name'],
      type: po['type'],
      status: po['status'] || 'complete',
      sku: po['sku'],
      quantity: po['quantity'] || 0,
      company: company,
      skuCompany: `${po['sku']}-${company}`,
      poRef: `${company}-${po['name']}-${po['type']}}`,
    }))
    let groupedPOs = groupBy(poData, 'poRef');
    let poUpdates = [];
    let poProductUpdates = [];
    let productUpdates = [];
    for (let po of Object.entries(groupedPOs)) {
      let poRef = po[0]
      let poArr = po[1]
      let qtyArr = poArr.map(line => parseInt(line.quantity))
      let sum = qtyArr.reduce((acc, cv) => (acc + cv), 0)
      let poProductsObj = groupBy(poArr, 'skuCompany')
      poUpdates.push({
        updateOne: {
          filter: { poRef },
          update: {
            name: poArr[0].name,
            type: poArr[0].type,
            status: poArr[0].status,
            poRef,
            company: poArr[0].company,
            $inc: { quantity: parseInt(sum) },
            $setOnInsert: { createdOn: new Date() }
          },
          upsert: true
        }
      });
      for (let skuRef of Object.entries(poProductsObj)) {
        let skuArr = skuRef[1]
        let currentSku = skuRef[0]
        let skuQtyArr = skuArr.map(sku => parseInt(sku.quantity))
        let skuSum = skuQtyArr.reduce((acc, cv) => (acc + cv), 0)
        let product = skuArr[0]
        delete product.quantity
        if (product.sku) {
          poProductUpdates.push({
            updateOne: {
              filter: { skuCompany: currentSku, poRef },
              update: {
                ...product,
                $inc: { quantity: parseInt(skuSum) },
                $setOnInsert: {
                  createdOn: new Date(),
                  scannedQuantity: 0
                }
              },
              upsert: true
            }
          });
          productUpdates.push({
            updateOne: {
              filter: { skuCompany: currentSku },
              update: {
                company,
                sku: product.sku,
                barcodeCompany: product.barcode ? product.barcode : product.sku + "-" + company,
                skuCompany: currentSku,
                $setOnInsert: { createdOn: new Date(), quantityToShip: 0 },
                $inc: product.type === 'outbound' ?
                  { quantity: parseInt(-skuSum) }
                  :
                  { quantity: parseInt(skuSum) }
              },
              upsert: true,
            }
          })
        }
      }
    }
    let updatedPOs = await db.PurchaseOrder.bulkWrite(poUpdates)
    let updatedPoProducts = poProductUpdates.length > 0 && await db.PoProduct.bulkWrite(poProductUpdates)
    let updatedProducts = productUpdates.length > 0 && await db.Product.bulkWrite(productUpdates)
    return res.status(200).json({
      updatedPOs,
      updatedPoProducts,
      updatedProducts,
    })
  } catch(err) {
    return next(err)
  }
}

/*
* UPDATE Purchase Order and associated PoProducts
* Accepted Values: updates obj array in req.body. ex:  [{name, createdOn, type, status}]
* Returns: bulkWrite array result
*/
exports.updatePurchaseOrder = async (req, res, next) => {
  try {
    //basic update for each po
    let poUpdates = req.body.updates.map(po=>{
      delete po.oldQty, po.selectType;
      return ({
        updateOne: {
          filter: { _id: po.id},
          update: {
            ...po
          },
        }
      })
    })
    let poProductUpdates = []
    let productUpdates = []
    //loop each po and find poProducts for po
    for (let po of req.body.updates) {
      delete po.oldQty, po.selectType;
      let products = await db.PoProduct.find({poRef: po.poRef})
      //poProduct updates
      let ppUpdates = products.map(poLine => ({
        updateOne: {
          filter: { skuCompany: poLine.skuCompany, poRef: poLine.poRef},
          update: {...po},
        }
      }))
      poProductUpdates.push(...ppUpdates);
      //update quantity on main product if new po.type is different than current poProduct type
      let pUpdates = products.filter(p=>p.type !== po.type).map(poLine => ({
        updateOne: {
          filter: {skuCompany: poLine.skuCompany},
          update: {
            $inc: po.type === 'outbound' ?
              { quantity: parseInt(-poLine.quantity) }
              :
              { quantity: parseInt(poLine.quantity) }
            }
          }
        })
      )
      productUpdates.push(...pUpdates)
    }
    let updatedPurchaseOrders = await db.PurchaseOrder.bulkWrite(poUpdates)
    let updatedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
    let updatedProducts = productUpdates.length > 0 && await db.Product.bulkWrite(productUpdates);
    return res.status(200).json({
      updatedPurchaseOrders,
      updatedPoProducts,
      updatedProducts,
    });
  } catch(err) {
    return next(err)
  }
}

/*
* DELETE Purchase Order and associated PoProducts, update assocaited Products
* Accepted Values: data obj array in req.body. ex:  [{_id,poRef}]
* Returns: bulkWrite array result
*/
exports.removePurchaseOrder = async (req, res, next) => {
  try {
    let poRemovals = req.body.data.map(po => ({
      deleteOne: {
        filter: {_id: po.id}
      }
    }))
    let andQuery = req.body.data.map(po=>({poRef: po.poRef}))
    console.log(andQuery)
    let poProducts = await db.PoProduct.find({company: req.body.company, $and: [{$or: andQuery}]})
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
    let removedPos = await db.PurchaseOrder.bulkWrite(poRemovals)
    let removedPoProducts = await db.PoProduct.bulkWrite(poProductRemovals)
    let updatedProducts = await db.Product.bulkWrite(productUpdates)
    return res.status(200).json({
      removedPos,
      removedPoProducts,
      updatedProducts,
    })
  } catch(err) {
    return next(err)
  }
}
