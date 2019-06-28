import React, { Component } from 'react'
import StkdTable from './StkdTable';
import { connect } from "react-redux";
import { Radio, Tooltip, Icon, Button } from 'antd'
import { updatePoProducts, removePoProducts } from '../store/actions/poProducts';
import * as scanHandlers from "../store/actions/boxScans";


class PoProductTableNew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filters: []
    }
  }

  updateAndFilter = (key,andQuery=[]) => {
    let filters = this.state.filters || []
    filters = [...andQuery, ...filters.filter(f => f[0] !== key)]
    this.setState({filters})
    console.log({filters, andQuery})
  }

  componentWillUpdate(prevProps) {
    if (typeof this.props.match.params.po === 'string' && this.props.match.params.po !== prevProps.match.params.po) {
      let andQuery = this.props.match.params.po.split(",").map(id=>['po',id,'='])
      this.updateAndFilter('po',andQuery)
    }
  }

  componentDidMount() {
    console.log({ state: this.state, history: this.props.history, match: this.props.match })
    if (typeof this.props.match.params.po === 'string') {
      let andQuery = this.props.match.params.po.split(",").map(id => ['po', id, '='])
      this.updateAndFilter('po', andQuery)
    }
    if (Array.isArray(this.props.history.location.poRefs)) {
      this.setState({
        currentPOs: this.props.history.location.poRefs,
      })
      console.log({state:this.state, history: this.props.history, match: this.props.match})
    }
  }

  handleDelete = (ids) => {
    return new Promise(async (resolve, reject) => {
      await scanHandlers.deleteBoxScans(ids, this.props.currentUser.user.company)
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
    return new Promise(async (resolve, reject) => {
      await scanHandlers.updateBoxScans(updates, this.props.currentUser.user)
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
    return new Promise(async (resolve, reject) => {
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
    let foundFilter = filters.find(f => f[0] === key)
    if (foundFilter) {
      filters = filters.filter(f => f[0] !== key)
    }
    filters = value === "" ? filters : [[key, value, operator], ...filters]
    this.setState({ filters })
    console.log({ filters })
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        {/* <div className="flex align-items-center space-between">
          <h1 style={{ display: 'inline', margin: 0 }}>Scans</h1>
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
        </div> */}
        <StkdTable
          title={"Purchase Order Products"}
          queryModel="PoProduct"
          editTitle={"PO Product"}
          populateArray={[{ path: 'po' }, { path: 'product' }]}
          filters={this.state.filters}
          onRowEditSave={this.handleRowEditSave}
          onImport={this.handleImport}
          showScannerForm
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
            { name: 'Bulk Edit', key: 'bulk-edit' },
            { name: 'Delete', key: 'delete', handler: this.handleDelete },
          ]}
          tableMenuOptions={[
            { name: 'Import', key: 'import', },
            { name: 'Scan', key: 'scan', },
            { name: 'Add One', key: 'add', },
            { name: 'Display Options', key: 'display-options' },
          ]}
          headers={[
            { id: 'select-all', text: '', width: 75, noSort: true },
            { id: 'sku', text: 'SKU', width: 175, span: 8, className: 'no-wrap' },
            { id: 'product', nestedKey: 'barcode', text: 'Barcode', width: 175, span: 8, className: 'no-wrap'},
            { id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 8, className: 'no-wrap' },
            { id: 'scannedQuantity', text: 'Scanned', width: 175, type: 'number', span: 8, className: 'no-wrap' },
            { id: 'po', nestedKey: 'name', text: 'PO Name', width: 400, span: 8, className: 'no-wrap' },
            { id: 'po', nestedKey: 'type', text: 'PO Type', width: 250, span: 8, className: 'no-wrap', options: [{ id: 'Inbound' }, { id: 'Outbound' }], type: 'select', },
            { id: 'status', text: 'PO Status', width: 250, span: 8, className: 'no-wrap', options: [{ id: 'Complete' }, { id: 'Processing' }], type: 'select', },
            { id: 'createdOn', text: 'Date Created', width: 100, type: 'date', span: 24, className: 'no-wrap' },
            { id: 'actions', text: 'Actions', width: 100, noSort: true, actionOptions: [{ name: 'Edit', key: 'edit' }, { name: 'Add to Order', key: 'add-to-order', }, { name: 'Add to PO', key: 'add-to-po', },{ name: 'Print Labels', key: 'print-label' },{ name: 'Delete', key: 'delete', }] },
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


export default connect(mapStateToProps, { updatePoProducts, removePoProducts })(PoProductTableNew);