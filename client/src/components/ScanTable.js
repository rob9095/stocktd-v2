import React, { Component } from 'react'
import StkdTable from './StkdTable';
import { connect } from "react-redux";


class ScanTable extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    return(
      <StkdTable
        queryModel="BoxScan"
        populateArray={[{path:'po'},{path:'product'},{path:'locations'}]}
        title="Scans"
        bulkMenuOptions={[
          {name: 'Delete', key: 'Delete'}
        ]}
        tableMenuOptions={[
          {name: 'Display Options', key: 'Display Options'}
        ]}
        headers={[
        {id: 'select-all', text: '', width: 75, noSort: true},
        {id: 'sku', text: 'SKU', width: 175, span: 8, className: 'no-wrap'},
        {id: 'name', text: 'Box Name', width: 175, span: 8,className: 'no-wrap'},
        {id: 'prefix', text: 'Box Prefix', width: 175, span: 8, className: 'no-wrap'},
        {id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 4, className: 'no-wrap'},
        {id: 'po', nestedKey: 'name', text: 'PO Name',  width: 175, span: 8, className: 'no-wrap'},
        {id: 'po', nestedKey: 'type', text: 'PO Type', width: 175, span: 8, className: 'no-wrap'},
        {id: 'locations', type: 'array', nestedKey: 'name', refModel: 'BoxScan', queryModel: 'Location', text: 'Location', width: 175, span: 8, className: 'no-wrap',},
        //{id: 'actions', text: 'Actions', width: 100, noSort: true},
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