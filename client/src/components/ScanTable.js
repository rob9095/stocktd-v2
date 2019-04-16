import React, { Component } from 'react'
import StkdTable from './StkdTable';
import { upsertModelDocuments } from '../store/actions/models';
import { connect } from "react-redux";


class ScanTable extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  handleSelectFieldUpdate = (data) => {
    //works for arrays only for now, for other feilds we use a regular input
    console.log(data)
    let refUpdates = [{
      _id: data.rowId,
      filterRef: '_id',
      ref: data.colId,
      refArray: true,
    }]
    let update = Array.isArray(data.clicked.id) ? data.clicked.id.map(val=>({[data.nestedKey]: val.id})) : []
    console.log({update})
    upsertModelDocuments(data.queryModel, update, this.props.currentUser.user.company, data.queryModel, refUpdates, data.refModel)
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })
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
        {id: 'locations', type: 'array', nestedKey: 'name', refModel: 'BoxScan', queryModel: 'Location', text: 'Location', width: 175, span: 8, className: 'no-wrap', handler: this.handleSelectFieldUpdate},
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