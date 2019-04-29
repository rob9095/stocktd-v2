import React, { Component } from 'react'
import StkdTable from './StkdTable';
import { connect } from "react-redux";
import { Radio, Tooltip, Icon, Button } from 'antd'
import * as scanHandlers from "../store/actions/boxScans";
import { importProducts } from "../store/actions/products";


class ProductTableNew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filters: []
    }
  }

  handleDelete = (ids) => {
    return new Promise(async(resolve,reject) => {
      await scanHandlers.deleteBoxScans(ids,this.props.currentUser.user.company)
      .then(res=>{
        console.log(res)
        resolve(res)
      })
      .catch(err=>{
        console.log(err)
        reject(err)
      })
    })
  }

  handleRowEditSave = (updates, id) => {
    return new Promise(async (resolve,reject) => {
      await scanHandlers.updateBoxScans(updates,this.props.currentUser.user)
      .then(res=>{
        console.log(res)
        resolve(res)
      })
      .catch(err=>{
        console.log(err)
        reject(err)
      })
    })
  }

  handleImport = (data) => {
    return new Promise((resolve, reject) => {
      this.props.importProducts(data, this.props.currentUser)
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
    let foundFilter = filters.find(f=>f[0] === key)
    if (foundFilter) {
      filters = filters.filter(f => f[0] !== key)
    }
    filters = value === "" ? filters : [[key, value, operator], ...filters]
    this.setState({filters})
  }

  render() {
    return(
      <div>
        <StkdTable
          queryModel="Product"
          populateArray={[{ path: 'boxscans', populate: [{path: 'locations'}] }]}
          filters={this.state.filters}
          title={"Products New"}
          onRowEditSave={this.handleRowEditSave}
          onImport={this.handleImport}
          showScannerForm
          importHeaders={[
            { value: 'sku', required: true },
            { value: 'title' },
            { value: 'barcode' },
            { value: 'quantity' },
            { value: 'price' },
            { value: 'supplier' },
            { value: 'brand' },
            { value: 'weight' },
            { value: 'action' },
          ]}
          importValidValues={[
            { value: 'sku', required: true },
            { value: 'title' },
            { value: 'barcode' },
            { value: 'quantity', type: 'number' },
            { value: 'price', type: 'number' },
            { value: 'supplier' },
            { value: 'brand' },
            { value: 'weight', type: 'number' },
            { value: 'action', type: 'array', validValues: ['update', 'delete'] },
          ]}
          bulkMenuOptions={[
            { name: 'Add to Order', key: 'add-order' },
            { name: 'Add to PO', key: 'add-po' },
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
            { id: 'sku', text: 'SKU', width: 175, span: 8, className: 'no-wrap' },
            { id: 'title', text: 'Title', width: 800, span: 8, className: 'lg-cell' },
            { id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 4, className: 'no-wrap' },
            { id: 'quantityToShip', text: 'To Ship', width: 175, type: 'number', span: 4, className: 'no-wrap' },
            { id: 'price', text: 'Price', width: 75, type: 'number', span: 4, className: 'no-wrap' },
            { id: 'weight', text: 'Weight', width: 75, type: 'number', span: 4, className: 'no-wrap' },
            { id: 'brand', text: 'Brand', width: 100, span: 8 },
            { id: 'supplier', text: 'Supplier', width: 100, span: 8 },
            // { id: 'scanToPo', text: 'Scan Type', width: 175, span: 6, className: 'no-wrap', disabled: true, render: (val)=>(val === true ? 'Scan To' : 'Scan From'), noFilter: true},
            // { id: 'po', nestedKey: 'type', text: 'PO Type', width: 175, span: 8, className: 'no-wrap', disabled: true },
            // { id: 'locations', type: 'autoComplete', autoCompleteMode: 'tags', nestedKey: 'name', refModel: 'BoxScan', queryModel: 'Location', text: 'Location', width: 175, span: 8, className: 'no-wrap', },
            { id: 'boxscans', type: 'autoComplete', autoCompleteMode: 'default', nestedKey: 'name', queryModel: 'Location', text: 'Location', width: 175, span: 8, className: 'no-wrap', },
            { id: 'actions', text: 'Actions', width: 100, noSort: true, actionOptions: [{ name: 'Add to Order', key: 'add-to-order', },{ name: 'Copy', key: 'copy', },{ name: 'Delete', key: 'delete', }] },
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


export default connect(mapStateToProps, { importProducts })(ProductTableNew);