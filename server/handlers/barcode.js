const db = require('../models');

exports.upsertBarcode = (config) => {
  const { products, company } = config
  return new Promise( async (resolve,reject) => {
    try {
      if (!company) {
        reject('Please provide a company to update barcode')
      }
      let productBarcodes = products.filter(p => p.barcode !== undefined && p.barcode !== null)
      let barcodeUpdates = []
      if (productBarcodes.length > 0) {
        barcodeUpdates = productBarcodes.map(p => ({
          updateOne: {
            filter: { sku: p.sku, company },
            update: {
              sku: p.sku,
              barcode: p.barcode,
              company,
            },
            upsert: true,
          },
        }))
        await db.Barcode.bulkWrite(barcodeUpdates)
      }
      resolve({
        barcodeUpdates
      })
    } catch(error) {
      reject({error})
    }
  })
}


