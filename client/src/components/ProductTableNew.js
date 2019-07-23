import React, { Component } from 'react'
import StkdTable from './StkdTable';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { Empty } from 'antd';
import { importProducts } from "../store/actions/products";
import { addBoxScan } from '../store/actions/boxScans';


class ProductTableNew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filters: [],
      fetchData: 0,
    }
  }

  handleDelete = ({data}) => {
    return new Promise((resolve,reject) => {
      const updates = data.map(id=>({id, action: 'delete'}))
      return this.handleImport(updates)
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
    return new Promise((resolve,reject) => {
      return this.handleImport(updates)
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

  handleCascaderUpdate = (data) => {
    return new Promise((resolve,reject) => {
      let [location={},box={}, ...rest] = data.clicked.options
      let update = [{
        id: data.rowId,
        defaultLocation: location.id || null,
        defaultBox: box.id || null,
      }]
      console.log({update})
      this.handleImport(update).then(res=>resolve(res)).catch(err=>reject(err))
    })
  }

  onInsertDataSave = (data) => {
    console.log({data})
    return new Promise((resolve,reject) => {
      resolve({text: 'Sucess', status:'success'})
    })
  }

  getInsertDataConfig = (items,insertType) => {
    switch (insertType) {
      case 'addNewBox' :
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
        default :
          console.log('unknown insertType '+ insertType)
          return({})
    }
  }

  handleNewBoxScan = (data) => {
    return new Promise((resolve,reject) => {
      let scan = {
        ...data,
        currentPOs: Array.isArray(data.currentPOs) ? data.currentPOs : [],
        scanToPo: true,
      }
      addBoxScan(scan, this.props.currentUser.user.company)
      .then(res => {
        this.setState({ fetchData: this.state.fetchData + 1 })
        resolve({text: 'Box Added', status: 'success' })
      })
      .catch(err => {
        reject({ text: 'Failed to Add Box', status: 'error' });
      })
    })
  }

  render() {
    return(
      <div style={{height: '100%'}}>
        <StkdTable
          queryModel="Product"
          editTitle="Product"
          populateArray={[{ path: 'boxscans', populate: [{path: 'locations'},{path: 'po'}] }]}
          filters={this.state.filters}
          additionalSearchInputs={[
            {
              id: 'boxscans',
              text: 'Box Name',
              width: 175,
              span: 8,
              className: 'no-wrap',
              nestedKey: 'name',
              defaultQuery: [['scanToPo', 'true', '=']],
            },
            {
              id: 'locations',
              text: 'Location',
              width: 175,
              span: 8,
              className: 'no-wrap',
              nestedKey: 'name',
              populatePath: 'boxscans',
              defaultPopulateArray: [{ path: 'po' }],
              defaultQuery: [['scanToPo', 'true', '=']],
            }
          ]}
          title={"Products"}
          fetchData={this.state.fetchData}
          onRowEditSave={this.handleRowEditSave}
          onImport={this.handleImport}
          onInsertDataSave={this.onInsertDataSave}
          onGetInsertDataConfig={this.getInsertDataConfig}
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
            { id: 'sku', text: 'SKU', width: 175, span: 8, className: 'no-wrap', noBulkEdit: true, },
            { id: 'barcode', text: 'Barcode', width: 175, span: 8, className: 'no-wrap', noBulkEdit: true, },
            { id: 'title', text: 'Title', width: 800, span: 8, className: 'lg-cell' },
            { id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 4, className: 'no-wrap', render: (p={})=>p.quantity || 0, },
            { id: 'quantityToShip', text: 'To Ship', width: 175, type: 'number', span: 4, className: 'no-wrap', render: (p={}) => p.quantityToShip || 0, noBulkEdit: true, noEdit: 'hide' },
            { id: 'price', text: 'Price', width: 75, type: 'number', span: 4, className: 'no-wrap', render: (p={}) =>  p.price || 0, },
            { id: 'weight', text: 'Weight', width: 75, type: 'number', span: 4, className: 'no-wrap', render: (p={}) => p.weight || 0, },
            { id: 'brand', text: 'Brand', width: 100, span: 8 },
            { id: 'supplier', text: 'Supplier', width: 100, span: 8 },
            // { id: 'scanToPo', text: 'Scan Type', width: 175, span: 6, className: 'no-wrap', disabled: true, render: (val)=>(val === true ? 'Scan To' : 'Scan From'), noFilter: true},
            // { id: 'po', nestedKey: 'type', text: 'PO Type', width: 175, span: 8, className: 'no-wrap', disabled: true },
            // { id: 'boxscans',
            //   type: 'treeSelect',
            //   text: 'Locations New',
            //   width: 175,
            //   span: 8,
            //   className: 'no-wrap',
            //   filter: (arr) => arr.filter(item => item.scanToPo === true),
            //   mapReduce: {
            //     parents: (r)=> {
            //       let children = Array.isArray(r.boxscans) ? r.boxscans.filter(box => box.scanToPo === true).map(box => [...box.locations.map((l) => ({ title: l.name, value: l._id + "-" + box.po._id + "-" + box._id, childValue: box._id+"-"+box.po._id, disableCheckbox: true, selectable: false }))]).flat().reduce((acc,cv)=>acc.filter(v=>cv.title === v.title).length > 0 ? [...acc] : [...acc,cv],[])
            //       : []
            //       return children
            //     },
            //     childOptions: (r) => Array.isArray(r.boxscans) ? 
            //       r.boxscans.filter(box=>box.scanToPo === true)
            //       .map(box=>({po: box.po, title: box.name, value: box._id+"-"+box.po._id, parentTitles: box.locations.map(({name})=>name)}))
            //       .reduce((acc,cv,i,a)=>{
            //         let foundChild = acc.find(v => cv.name === v.name)
            //         let newAcc = acc.filter(v => foundChild.name !== v.name)
            //         let children = a.filter(box => box.name === cv.name).map(box=>({parentTitles: [box.title],title: box.po.name, value: box.po._id+"-"+box._id+"-sc"}))
            //         r.boxscans.length > 0 && console.log({ foundChild, newAcc, children })
            //         return foundChild ? [...newAcc,{...foundChild, children}] : [...acc,cv]
            //         },[])
            //      : []
            //   },
            // },
            { id: 'boxscans',
              type: 'cascader',
              autoCompleteMode: 'default',
              text: 'Locations',
              width: 175,
              span: 8,
              className: 'no-wrap',
              reverseData: true,
              nestedKey: 'name',
              noFilter: true,
              noBulkEdit: true,
              filter: (arr)=>arr.filter(item=>item.scanToPo === true),
              parent: {
                label: 'name',
                value: 'name',
                defaultKey: 'defaultBox',
                sortKey: 'quantity',
                subChild: {
                  key: 'po',
                  label: 'name',
                  value: 'name',
                  defaultKey: 'po'
                }
              },
              child: {
                label: 'name',
                value: 'name',
                arrayKey: 'locations',
                defaultKey: 'defaultLocation'
              },
              handler: this.handleCascaderUpdate,
            },
            { id: 'actions', width: 100, noSort: true, actionOptions: [{name: 'Edit', key: 'edit'},{ name: 'Add to Order', key: 'add-to-order', },{ name: 'Copy', key: 'copy', },{ name: 'Delete', key: 'delete', }] },
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