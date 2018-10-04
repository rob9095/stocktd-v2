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

const updateMath = (current, update, poType) => {
  const c = parseInt(current)
  const u = parseInt(update)
  return poType === 'outbound' ? c - u : c + u
}

exports.handlePOImport = async (req, res, next) => {
  try{
    const company = req.body.company
    let poData = req.body.json.map((po,i)=>({
      name: po['po name'],
      type: po['po type'],
      status: po['status'] ? po['status'] : 'complete',
      sku: po['sku'],
      quantity: po['quantity'],
      company: company,
      skuCompany: `${po['sku']}-${company}`,
      poRef: `${company}-${po['po name']}-${po['po type']}-${po['po status']}`,
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
    					filter: { poRef, },
    					update: {
                name: poArr[0].name,
                type: poArr[0].type,
                status: poArr[0].status,
                poRef,
                company: poArr[0].company,
                quantity: sum,
                $setOnInsert: { createdOn: new Date() }
              },
    					upsert: true,
    				}
          })
      for (let skuRef of Object.entries(poProductsObj)) {
        let skuArr = skuRef[1]
        let currentSku = skuRef[0]
        let skuQtyArr = skuArr.map(sku => parseInt(sku.quantity))
        let skuSum = skuQtyArr.reduce((acc, cv) => (acc + cv), 0)
        let product = skuArr[0]
        poProductUpdates.push({
    				updateOne: {
    					filter: { skuCompany: currentSku, poRef},
    					update: {...product, quantity: skuSum},
    					upsert: true,
    				}
    			})
        productUpdates.push({
          updateOne: {
            filter: {skuCompany: currentSku},
            update: {
              company,
              sku: product.sku,
              skuCompany: currentSku,
              $setOnInsert: { createdOn: new Date(), quantityToShip: 0, },
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
    let updatedPOs = await db.PurchaseOrder.bulkWrite(poUpdates)
    let updatedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
    let updatedProducts = await db.Product.bulkWrite(productUpdates)
    //need to really loop through each updateResponse and for any inserted Docs go and add default values with more bulk writes...
    return res.status(200).json({
      updatedPOs,
      updatedPoProducts,
      updatedProducts,
    })
  } catch(err) {
    return next(err)
  }
}

exports.processPurchaseOrderImport = async (req, res, next) => {
	try {
    let addedPOs = [];
    let addedProducts = [];
    let poData = req.body.json.map((po,i)=>({
      name: po['po name'],
      type: po['po type'],
      status: po['po status'] ? po['po status'] : 'complete',
      sku: po['sku'],
      quantity: po['quantity'],
      company: req.body.company,
      skuCompany: `${po['sku']}-${req.body.company}`,
      poRef: `${req.body.company}-${po['po name']}-${po['po type']}-${po['po status']}-${Date.now()}`,
    }))
    // group the po's by their unique ref, combined "-" seperate string of company name, po name, po type, po status, current date obj
    let groupedPOs = groupBy(poData, 'poRef');
    // loop each po by it's unique ref to create it
    for (let ref of Object.keys(groupedPOs)) {
      // create the main po from the first array item for the matching poRef
      let mainPO = await db.PurchaseOrder.create({
        name: groupedPOs[ref][0].name,
        type: groupedPOs[ref][0].type,
        isComplete: groupedPOs[ref][0].isComplete,
        poRef: groupedPOs[ref][0].poRef,
        company: groupedPOs[ref][0].company,
      })
      addedPOs.push(mainPO)
      // loop the array for each po ref and create the poProducts
      let poProducts = groupedPOs[ref].map(poLine => ({
				updateOne: {
					filter: { skuCompany: poLine.skuCompany, poRef: poLine.poRef},
					update: {...poLine, poId: mainPO._id},
					upsert: true,
				}
			}))
			let addedPoProducts = await db.PoProduct.bulkWrite(poProducts)
      // update quantities in main products table
      // find all company products
      let companyProducts = await db.Product.find({company: req.body.company})
      // loop over all products and create array of updates to bulk write
      let productUpdates = groupedPOs[ref].map(poLine => {
        // find the related product and update interval
        let foundProduct = companyProducts.find(product => product.skuCompany === poLine.skuCompany)
        if (foundProduct) {
          console.log('found product qty is')
          console.log(foundProduct.quantity + poLine.quantity + poLine.type)
          return {
            updateOne: {
              filter: { skuCompany: `${poLine.sku}-${req.body.company}`},
              update: { quantity: updateMath(foundProduct.quantity, poLine.quantity, poLine.type) },
            }
          }
        } else {
          // otherwise insert it with inital qty of 0
          console.log('inserting product')
          return {
            insertOne: {
              document: {
                sku: poLine.sku,
                skuCompany: poLine.skuCompany,
                company: poLine.company,
                quantity: updateMath(0, poLine.quantity, poLine.type),
              }
            }
          }
        }
      })
      let updatedProducts = await db.Product.bulkWrite(productUpdates)
      addedProducts.push(updatedProducts)
    }
    let poProducts = await db.PoProduct.find({company: req.body.company})
    return res.status(200).json({addedPOs, addedProducts, poProducts})
	} catch(err) {
		return next({
      err,
      message: [...err.message],
    });
	}
}

exports.getCompanyPurchaseOrders = async (req, res, next) => {
  try {
    let purchaseOrders = await db.PurchaseOrder.find({company: req.body.company})
    return res.status(200).json(purchaseOrders)
  } catch(err) {
    return next(err)
  }
}

exports.getPoProducts = async (req, res, next) => {
  try {
    let products = await db.PoProduct.find({poId: req.body.po_id})
    console.log(products)
    return res.status(200).json({products})
  } catch(err) {
    return next(err)
  }
}

exports.getCompanyPoProducts = async (req, res, next) => {
  try {
    let poProducts = await db.PoProduct.find({company: req.body.company})
    if (req.body.filter) {
      for (let val of filter) {
        poProducts = poProducts.filter(poP=>poP.poId === val[1])
      }
    }
    return res.status(200).json({poProducts})
  } catch(err) {
    return next(err)
  }
}


exports.updatePurchaseOrder = async (req, res, next) => {
  try {
    let poUpdates = req.body.purchaseOrders.map(po=>{
      return {
        updateOne: {
          filter: { _id: po._id},
          update: {...po},
        }
      }
    })
    let poProductUpdates = req.body.poProducts.map(poLine => ({
      updateOne: {
        filter: { skuCompany: poLine.skuCompany, poRef: poLine.poRef},
        update: {...poLine},
        upsert: true,
      }
    }))
    let updatedPurchaseOrders = await db.PurchaseOrder.bulkWrite(poUpdates)
    let updatedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
    return res.status(200).json({
      updatedPurchaseOrders,
      updatedPoProducts,
    })
  } catch(err) {
    return next(err)
  }
}
