import React, { Component } from 'react'
import StkdTable from './StkdTable';
import { connect } from "react-redux";
import * as scanHandlers from "../store/actions/boxScans";


class ScanTable extends Component {
  constructor(props) {
    super(props)
    this.state = {

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

  render() {
    return(
      <StkdTable
        queryModel="BoxScan"
        populateArray={[{path:'po'},{path:'product'},{path:'locations'}]}
        title="Scans"
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
          { value: 'scan from', type: 'array', validValues: ['yes',''] },
          { value: 'po type', type: 'array', validValues: ['inbound', 'outbound', ''] },
          { value: 'name' },
          { value: 'prefix' },
        ]}
        bulkMenuOptions={[
          {name: 'Bulk Edit', key: 'bulk-edit'},
          {name: 'Delete', key: 'delete', handler: this.handleDelete},
        ]}
        tableMenuOptions={[
          {name: 'Import', key: 'import',},
          {name: 'Display Options', key: 'display-options'},
        ]}
        headers={[
        {id: 'select-all', text: '', width: 75, noSort: true},
        {id: 'sku', text: 'SKU', width: 175, span: 8, className: 'no-wrap', disabled: true },
        {id: 'name', text: 'Box Name', width: 175, span: 8,className: 'no-wrap', required: true},
        {id: 'prefix', text: 'Box Prefix', width: 175, span: 8, className: 'no-wrap', required: true,},
        {id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 4, className: 'no-wrap', required: true},
        {id: 'po', nestedKey: 'name', text: 'PO Name',  width: 175, span: 8, className: 'no-wrap', disabled: true},
        {id: 'po', nestedKey: 'type', text: 'PO Type', width: 175, span: 8, className: 'no-wrap', disabled: true},
        {id: 'locations', type: 'autoComplete', autoCompleteMode: 'tags', nestedKey: 'name', refModel: 'BoxScan', queryModel: 'Location', text: 'Location', width: 175, span: 8, className: 'no-wrap',},
        {id: 'actions', text: 'Actions', width: 100, noSort: true, actionOptions: [{name: 'Delete', key: 'delete',}]},
      ]}
      />
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