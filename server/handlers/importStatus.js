const db = require('../models');

const handleBulkWrite = async (type,data,id) => {
  try {
    let time = 0;
    setInterval(function () {
    time = time + 1;
    }, 1000);
    let update = await db[type].bulkWrite(data)
    let foundImport = await db.ImportStatus.findOne({_id: id})
    foundImport.status = 'complete'
    foundImport.result = `${data.length} records updated`
    foundImport.time = time
    foundImport.save();
  } catch(err) {
    let foundImport = await db.ImportStatus.findOne({_id: id})
    foundImport.status = 'error'
    foundImport.result = 'Unable to process import, please try again'
    foundImport.time = time
    foundImport.save();
  }
}

exports.createImportStatus = (type,company,data) => {
  return new Promise(async (resolve,reject) => {
    try {
      let newImport = await db.ImportStatus.create({
        type,
        company,
        status: 'processing',
      })
      handleBulkWrite(type,data,newImport._id)
      resolve(newImport)
    } catch(err) {
      reject(err)
    }
  })
}
