import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import StkdTable from './StkdTable';
import { connect } from "react-redux";
import { Radio, Tooltip, Icon, Button, Divider, Skeleton, Tag, Input, Empty, Select } from 'antd';
import { updatePoProducts, removePoProducts } from '../store/actions/poProducts';
import { addBoxScan } from '../store/actions/boxScans';
import * as scanHandlers from "../store/actions/boxScans";
import AutoCompleteInput from './AutoCompleteInput';


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
    if (this.props.match.params.po !== prevProps.match.params.po) {
      setTimeout(() => {
        let po = this.props.match.params.po || ''
        let andQuery = po.split(",").filter(id=>id).map(id => ['po', id, '='])
        this.updateAndFilter('po', andQuery)
      }, 1);
    }
  }

  componentDidMount() {
    if (typeof this.props.match.params.po === 'string') {
      let andQuery = this.props.match.params.po.split(",").filter(id => id).map(id => ['po', id, '='])
      this.updateAndFilter('po', andQuery)
    }
    if (Array.isArray(this.props.history.location.poRefs)) {
      this.setState({
        currentPOs: this.props.history.location.poRefs,
      })
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

  handleScan = (scan) => {
    return new Promise((resolve, reject) => {
      scan = {
        ...scan,
        user: this.props.currentUser.user.id,
      }
      let poRefs = this.state.currentPOs.sort((a, b) => (b.quantity - a.quantity))
      addBoxScan(scan, this.props.currentUser.user.company)
        .then(res => {
          let data = this.state.data.map(p => {
            if (p._id === res.updatedPoProduct._id) {
              return {
                ...res.updatedPoProduct,
              }
            } else {
              return {
                ...p,
              }
            }
          })
          this.setState({
            data,
          })
          if (res.completedPoProducts && res.completedPoProducts.nMatched) {
            this.handlePoComplete(res.updatedPoProduct)
          }
          resolve(res)
        })
        .catch(err => {
          reject(err);
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
          scanFormConfig={({data=[], scannerClosed})=>({
            currentPOs: this.props.match.params.po ? this.props.match.params.po.split(',').filter(id => id).map(id => data.find(r => r.po && r.po._id === id)).filter(pop=>pop && pop.po).map(pop => pop.po) : [],
            requirePO: true,
            poMode: 'multiple',
            onScan:this.handleScan,
            skipControlledUpdateCallback: true,
            onCurrentPOUpdate: (pos) => {
              if (scannerClosed === false) {
                pos = Array.isArray(pos) ? pos : [pos]
                let path = '/app/po-products/'+pos.map((p={})=>p._id).filter(id=>id).join()
                console.log({pos,path, currentPath: this.props.history.location.pathname, history: this.props.history})
                if (path !== this.props.history.location.pathname) {
                  this.props.history.push(path)
                }
              }
            },
            onAddQuantity: (a)=>console.log({a}),
            scanToPo: false,
          })}
          title={"Purchase Order Products"}
          queryModel="PoProduct"
          editTitle={"PO Product"}
          populateArray={[{ path: 'po' }, { path: 'product' }]}
          extraTopContent={({data=[]})=>{
            if (this.props.match.params.po) {
              let pos = this.props.match.params.po.split(',').filter(id=>id).map(id=>data.find(r=>r.po && r.po._id === id)).map(pop=>pop && pop.po ? pop.po : {})
              return (
                <div className="flex align-items-center flex-wrap" style={{ paddingTop: 12 }}>
                  {pos.length + ' Open Purchase Order' + `${pos.length > 1 ? 's' : ''}`}
                  <Divider type="vertical" />
                  {pos.map((po,i) => (
                    <Tag onClose={()=>this.props.history.push('/app/po-products/'+pos.map((p={})=>p._id).filter(id => id !== po._id).join())} closable className="table-tag" key={po._id || i} style={{ background: '#fff', fontSize: 14, padding: '2px 7px', marginRight: 7, ...!po._id && {minWidth: 80} }}>
                        <Skeleton paragraph={false} loading={!po._id} active>
                        {po.name}
                        </Skeleton>
                    </Tag>
                  )).concat(
                    <Button key="addNewPoBtn" onClick={()=>this.setState({addNewPo: !this.state.addNewPo})} style={{marginRight: 7,}} size="small">
                      <Icon type={ this.state.addNewPo ? "close" : "plus"} />
                    </Button>
                  ).concat(
                    this.state.addNewPo && (
                      <div key="addNewPoInput">
                        <AutoCompleteInput
                          filter={(arr)=>arr.filter(item => !this.props.match.params.po.split(',').filter(id=>id).includes(item._id.toString()))}
                          size="small"
                          queryModel={"PurchaseOrder"}
                          searchKey={"name"}
                          placeholder={"Search by PO Name"}
                          renderOption={item => (
                            <div style={{ maxHeight: 35, overflow: "hidden",}}>
                              <div style={{ fontSize: "small" }}>
                                {item["name"]}
                              </div>
                              <div style={{ marginTop: -5, fontSize: 10, color: "grey" }}>
                                {item["type"]}
                              </div>
                            </div>
                          )}
                          onUpdate={clicked => {
                            this.props.history.push('/app/po-products/'+[...pos.map((p={})=>p._id),clicked.data._id || ""].join())
                            this.setState({addNewPo: false})
                          }}
                          notFound={
                            <Empty
                              imageStyle={{ height: 20 }}
                              description={(
                                <span>
                                  <Link to="/app/purchase-orders" style={{fontSize: 'small', opacity: '.8'}}>Add Purchase Order</Link>
                                </span>
                              )}
                            />
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              )
            }
          }}
          filters={this.state.filters}
          onRowEditSave={this.handleRowEditSave}
          onImport={this.handleImport}
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