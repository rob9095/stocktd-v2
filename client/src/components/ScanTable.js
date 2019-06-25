import React, { Component } from 'react'
import StkdTable from './StkdTable';
import { connect } from "react-redux";
import { Radio, Tooltip, Icon, Button } from 'antd'
import * as scanHandlers from "../store/actions/boxScans";


class ScanTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filters: [['scanToPo', true, '=']]
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
        <div className="flex align-items-center space-between">
          <h1 style={{display: 'inline', margin: 0}}>Scans</h1>
          <div>
            <Radio.Group buttonStyle="solid" style={{ fontSize: 'small' }} defaultValue={true} size="small" onChange={(e) => this.updateFilters('scanToPo', e.target.value, '=')}>
              <Radio.Button value={true}>Scan To</Radio.Button>
              <Radio.Button value={false}>Scan From</Radio.Button>
              <Radio.Button value="">Both</Radio.Button>
            </Radio.Group>
            <Tooltip overlayStyle={{ fontSize: 'small' }} title="What's this?">
              <Button size="small" className="no-border no-bg" onClick={() => console.log('clicked')}>
                <Icon type="question-circle" theme="twoTone" twoToneColor="#716aca" />
              </Button>
            </Tooltip>
          </div>
        </div>
        <StkdTable
          queryModel="BoxScan"
          editTitle={"Scan"}
          populateArray={[{ path: 'po' }, { path: 'product' }, { path: 'locations' }]}
          filters={this.state.filters}
          title={false}
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
            { name: 'Display Options', key: 'display-options' },
          ]}
          headers={[
            { id: 'select-all', text: '', width: 75, noSort: true },
            { id: 'sku', text: 'SKU', width: 175, span: 6, className: 'no-wrap', disabled: true },
            { id: 'name', text: 'Box Name', width: 175, span: 6, className: 'no-wrap', required: true },
            { id: 'prefix', text: 'Box Prefix', width: 175, span: 6, className: 'no-wrap', required: true, },
            { id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 6, className: 'no-wrap', required: true },
            { id: 'scanToPo', text: 'Scan Type', width: 175, span: 6, className: 'no-wrap', disabled: true, render: (val)=>(val === true ? 'Scan To' : 'Scan From'), noFilter: true},
            { id: 'po', nestedKey: 'name', text: 'PO Name', width: 175, span: 8, className: 'no-wrap', disabled: true },
            { id: 'po', nestedKey: 'type', text: 'PO Type', width: 175, span: 8, className: 'no-wrap', disabled: true },
            { id: 'locations', type: 'autoComplete', autoCompleteMode: 'tags', nestedKey: 'name', refModel: 'BoxScan', queryModel: 'Location', upsertOnChange: true,text: 'Location', width: 175, span: 8, className: 'no-wrap', },
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