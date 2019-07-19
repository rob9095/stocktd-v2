const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'complete',
  },
  scanned: {
    type: Boolean,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  // poRef: {
  //   type: 'String',
  //   required: true,
  //   unique: true,
  // },
  defaultInbound: {
    type: Boolean,
    default: false,
  },
  defaultOutbound: {
    type: Boolean,
    default: false,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  company: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  allowExcess: {
    type: Boolean,
    default: false,
  },
}, { toJSON: { virtuals: true } })

purchaseOrderSchema.virtual('boxscans', {
  ref: 'BoxScan', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'po', // is equal to `foreignField`
  options: {} // Query options, see http://bit.ly/mongoose-query-options
});

purchaseOrderSchema.virtual('poRef').get(function(){
  return `${this.company}-${this.name}-${this.type}`
})

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

module.exports = PurchaseOrder;
