import React, { Component } from 'react'
import StkdTable from './StkdTable';
import { connect } from "react-redux";
import { Radio, Tooltip, Icon, Button, Divider, Popover } from 'antd'
import * as scanHandlers from "../store/actions/boxScans";


class ScanTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filters: [['scanToPo', true, '=']]
    }
  }

  handleDelete = ({data}) => {
    return new Promise(async(resolve,reject) => {
      await scanHandlers.deleteBoxScans(data,this.props.currentUser.user.company)
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
    return new Promise( async (resolve,reject) =>{
      await scanHandlers.importBoxScans(data, this.props.currentUser.user)
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
      <div style={{height: '100%'}}>
        <StkdTable
          queryModel="BoxScan"
          editTitle={"Scan"}
          extraTopContent={({ data = [] }) => 
            <div className="flex align-items-center flex-wrap" style={{paddingTop: 14}}>
              <Popover style={{maxWidth: 100}} content={<div><a href="#">Whats this?</a></div>}>
                <div style={{height: '100%'}}>
                  Scan Type
                </div>
              </Popover>
              <Divider type="vertical" />
              <Radio.Group buttonStyle="solid" style={{ fontSize: 'small' }} defaultValue={true} size="small" onChange={(e) => this.updateFilters('scanToPo', e.target.value, '=')}>
                <Radio.Button value={true}>Scan To</Radio.Button>
                <Radio.Button value={false}>Scan From</Radio.Button>
                <Radio.Button value="">Both</Radio.Button>
              </Radio.Group>
            </div>
          }
          populateArray={[{ path: 'po' }, { path: 'product' }, { path: 'locations' }]}
          filters={this.state.filters}
          title={"Scans"}
          onRowEditSave={this.handleRowEditSave}
          onImport={this.handleImport}
          showScannerForm
          importHeaders={[
            { value: 'sku', required: true },
            { value: 'box name', required: true },
            { value: 'locations' },
            { value: 'barcode' },
            { value: 'quantity', required: true },
            { value: 'po name' },
            { value: 'po type' },
            { value: 'scan from' },
            { value: 'prefix' },
          ]}
          importValidValues={[
            { value: 'sku', required: true },
            { value: 'box name', required: true },
            { value: 'locations', type: 'stringArray' },
            { value: 'barcode', },
            { value: 'quantity', required: true, type: 'number' },
            { value: 'scan from', type: 'array', validValues: ['yes', ''] },
            { value: 'po type', type: 'array', validValues: ['inbound', 'outbound', ''] },
            { value: 'name' },
            { value: 'prefix' },
          ]}
          bulkMenuOptions={[
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
            { id: 'sku', text: 'SKU', width: 175, span: 8, className: 'no-wrap', noEdit: true, createInputConfig: { type: 'autoComplete', queryModel: 'Product', nestedKey: 'sku', linkedFields: [{ formRef: 'productbarcode', dataRef: 'barcode' }], showAddOption: true, required: true }, },
            { id: 'name', text: 'Box Name', width: 175, span: 8, className: 'no-wrap', required: true },
            { id: 'prefix', text: 'Box Prefix', width: 175, span: 8, className: 'no-wrap', required: true, },
            { id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 8, className: 'no-wrap', required: true },
            { id: 'scanToPo', text: 'Scan Type', width: 175, span: 8, className: 'no-wrap', noEdit: true, render: (po={}) => (po.scanToPo === true ? 'Scan To' : 'Scan From'), options: [{ id: 'true', text: 'Scan To' }, { id: 'false', text: 'Scan From' }], type: 'select', noFilter: true,},
            { id: 'po', nestedKey: 'name', text: 'PO Name', width: 175, span: 8, className: 'no-wrap', noEdit: true, createInputConfig: { type: 'autoComplete', queryModel: 'PurchaseOrder', nestedKey: 'name', showAddOption: true, linkedFields: [{ formRef: 'potype', dataRef: 'type', render: (po = {}) => po.type && po.type.charAt(0).toUpperCase() + po.type.slice(1), }, { formRef: 'postatus', dataRef: 'status', render: (po = {}) => po.status && po.status.charAt(0).toUpperCase() + po.status.slice(1), }, { formRef: 'pocreatedOn', dataRef: 'createdOn', type: 'date' }], }, },
            { id: 'po', nestedKey: 'type', text: 'PO Type', width: 175, span: 8, className: 'no-wrap', options: [{ id: 'Inbound' }, { id: 'Outbound' }], type: 'select', noEdit: true },
            { id: 'po', nestedKey: 'status', text: 'PO Status', width: 175, span: 8, className: 'no-wrap', options: [{ id: 'Complete' }, { id: 'Processing' }], type: 'select', noEdit: true },
            { id: 'locations', nestedKey: 'name', type: 'autoComplete', autoCompleteMode: 'tags', refModel: 'BoxScan', queryModel: 'Location', upsertOnChange: true,text: 'Location', width: 175, span: 8, className: 'no-wrap', },
            { id: 'actions', text: 'Actions', width: 100, noSort: true, actionOptions: [{ name: 'Edit', key: 'edit', },{ name: 'Delete', key: 'delete', }] },
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


export default connect(mapStateToProps, {})(ScanTable);