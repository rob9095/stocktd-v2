import React, { Component } from 'react'
import StkdTable from './StkdTable';
import { connect } from "react-redux";
import { Link, Redirect } from 'react-router-dom';
import { Empty } from 'antd';
import { importPurchaseOrder, updatePurchaseOrders, removePurchaseOrders } from '../store/actions/purchaseOrders';
import { addBoxScan } from '../store/actions/boxScans';


class PoTableNew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filters: [],
      fetchData: 0,
    }
  }

  handleDelete = ({data}) => {
    return new Promise((resolve, reject) => {
      let updates = data.map(id=>({id}))
      return this.props.removePurchaseOrders(updates, this.props.currentUser)
        .then(res => {
          console.log(res)
          resolve(res)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  }

  handleRowEditSave = (updates, id) => {
    return new Promise((resolve, reject) => {
      return this.props.updatePurchaseOrders(updates, this.props.currentUser)
        .then(res => {
          console.log(res)
          resolve(res)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  }

  handleImport = (data) => {
    return new Promise((resolve, reject) => {
      this.props.importPurchaseOrder(data, this.props.currentUser)
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  updateFilters = (key, value, operator) => {
    let filters = this.state.filters || []
    let foundFilter = filters.find(f => f[0] === key)
    if (foundFilter) {
      filters = filters.filter(f => f[0] !== key)
    }
    filters = value === "" ? filters : [[key, value, operator], ...filters]
    this.setState({ filters })
  }

  handleCascaderUpdate = (data) => {
    return new Promise((resolve, reject) => {
      let [location = {}, box = {}, ...rest] = data.clicked.options
      let update = [{
        id: data.rowId,
        defaultLocation: location.id || null,
        defaultBox: box.id || null,
      }]
      console.log({ update })
      this.handleImport(update).then(res => resolve(res)).catch(err => reject(err))
    })
  }

  onInsertDataSave = (data) => {
    console.log({ data })
    return new Promise((resolve, reject) => {
      resolve({ text: 'Sucess', status: 'success' })
    })
  }

  getInsertDataConfig = (items, insertType) => {
    switch (insertType) {
      case 'addNewBox':
        return ({
          title: "Add New Box",
          inputs: [
            {
              span: 24,
              id: "sku",
              text: "SKU",
              required: true,
              message: "SKU is required",
              type: 'autoComplete',
              queryModel: "Product",
              selected: items,
            },
            {
              span: 24,
              id: "quantity",
              text: "Quantity",
              required: true,
              message: "Quantity is required",
              type: 'number',
            },
            {
              span: 24,
              id: "currentPOs",
              queryModel: "PurchaseOrder",
              searchKey: "name",
              text: "Purchase Order",
              type: 'autoComplete',
              selected: [],
              renderOption: item => (
                <div style={{ maxHeight: 40, overflow: "hidden" }}>
                  <div style={{ fontSize: "small" }}>
                    {item["name"]}
                  </div>
                  <div style={{ fontSize: 10, color: "grey" }}>
                    {item["type"]}
                  </div>
                </div>
              ),
              notFound: (
                <Empty
                  imageStyle={{ height: 20 }}
                  description={(
                    <span>
                      <Link to="/app/purchase-orders" style={{ fontSize: 'small', opacity: '.8' }}>Add Purchase Order</Link>
                    </span>
                  )}
                />
              )
            },
            {
              span: 24,
              id: "prefix",
              searchKey: "name",
              text: "Prefix",
              required: true,
              type: 'autoComplete',
              queryModel: "BoxPrefix",
              showAddOption: true,
            },
            {
              span: 24,
              id: "name",
              searchKey: "name",
              text: "Box Name",
              required: true,
              type: 'autoComplete',
              queryModel: 'BoxScan',
              message: "Box name is required",
              showAddOption: true,
            },
            {
              span: 24,
              id: "locations",
              searchKey: "name",
              text: "Location",
              required: false,
              type: 'autoComplete',
              queryModel: "Location",
              mode: 'tags',
            },
          ],
          okText: "Save",
          cancelText: "Cancel",
          onSave: this.handleNewBoxScan,
        })
      default:
        console.log('unknown insertType ' + insertType)
        return ({})
    }
  }

  handleNewBoxScan = (data) => {
    return new Promise((resolve, reject) => {
      let scan = {
        ...data,
        currentPOs: Array.isArray(data.currentPOs) ? data.currentPOs : [],
        scanToPo: true,
      }
      addBoxScan(scan, this.props.currentUser.user.company)
        .then(res => {
          this.setState({ fetchData: this.state.fetchData + 1 })
          resolve({ text: 'Box Added', status: 'success' })
        })
        .catch(err => {
          reject({ text: 'Failed to Add Box', status: 'error' });
        })
    })
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <StkdTable
          queryModel="PurchaseOrder"
          editTitle="Purchase Order"
          filters={this.state.filters}
          title={"Purchase Orders"}
          fetchData={this.state.fetchData}
          onRowEditSave={this.handleRowEditSave}
          onImport={this.handleImport}
          onInsertDataSave={this.onInsertDataSave}
          onGetInsertDataConfig={this.getInsertDataConfig}
          importHeaders={[
            { value: 'sku', required: true },
            { value: 'type', required: true },
            { value: 'name', required: true },
            { value: 'quantity', required: true },
            { value: 'status' },
            { value: 'title' },
            { value: 'barcode' },
            { value: 'price' },
            { value: 'supplier' },
            { value: 'brand' },
            { value: 'weight' },
          ]}
          importValidValues={[
            { value: 'sku', required: true },
            { value: 'name', required: true },
            { value: 'type', required: true, type: 'array', validValues: ['inbound', 'outbound'] },
            { value: 'quantity', type: 'number', required: true },
            { value: 'status', type: 'array', validValues: ['complete', 'processing'] },
            { value: 'title' },
            { value: 'barcode' },
            { value: 'price', type: 'number' },
            { value: 'supplier' },
            { value: 'brand' },
            { value: 'weight', type: 'number' },
          ]}
          bulkMenuOptions={[
            { name: 'View', key: 'view', handler: ({ selected }) => this.props.history.push('/app/po-products/'+selected.join())},
            { name: 'Scan', key: 'scan' },
            { name: 'Copy', key: 'copy' },
            { name: 'Print Labels', key: 'print-label' },
            { name: 'Bulk Edit', key: 'bulk-edit' },
            { name: 'Delete', key: 'delete', handler: this.handleDelete },
          ]}
          tableMenuOptions={[
            { name: 'Import', key: 'import', },
            { name: 'Add One', key: 'add', },
            { name: 'Display Options', key: 'display-options' },
          ]}
          headers={[
            { id: 'select-all', text: '', width: 75, noSort: true },
            {
              id: 'name', text: 'Name', width: 400, span: 6, className: 'no-wrap',
              render: (po={},action) =>
                action === 'edit' ? 
                  po.name
                :
                  <Link to={{
                    pathname: '/app/po-products/'+po._id,
                    poRefs: [{ ...po }],
                  }}
                  >
                    {po.name}
                  </Link>,
            },
            { id: 'type', text: 'Type', type: 'select', options: [{id: 'Inbound'},{id: 'Outbound'}], width: 250, span: 6, className: 'no-wrap' },
            { id: 'status', text: 'Status', width: 250, span: 6, className: 'no-wrap', options: [{ id: 'Complete' }, { id: 'Processing' }], type: 'select', },
            { id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 6, className: 'no-wrap', render: ((p={})=>p.quantity || 0) },
            { id: 'createdOn', text: 'Date Created', width: 100, type: 'date', span: 8, className: 'no-wrap' },
            { id: 'actions', width: 100, noSort: true, actionOptions: [{ name: 'Edit', key: 'edit' }, { name: 'View', key: 'view', }, { name: 'Scan', key: 'scan', }, { name: 'Copy', key: 'copy', }, { name: 'Print Labels', key: 'print-label' }, { name: 'Delete', key: 'delete', }] },
          ]}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors
  };
}


export default connect(mapStateToProps, { importPurchaseOrder, updatePurchaseOrders, removePurchaseOrders })(PoTableNew);