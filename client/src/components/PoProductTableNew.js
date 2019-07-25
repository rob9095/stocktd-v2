import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import StkdTable from './StkdTable';
import { connect } from "react-redux";
import { Radio, Tooltip, Icon, Button, Divider, Skeleton, Tag, Input, Empty, Select } from 'antd';
import { updatePoProducts, removePoProducts } from '../store/actions/poProducts';
import { importPurchaseOrder } from '../store/actions/purchaseOrders';
import { queryModelData } from '../store/actions/models';
import { addBoxScan } from '../store/actions/boxScans';
import { addNotification, removeNotification } from '../store/actions/notifications';
import AutoCompleteInput from './AutoCompleteInput';

const moment = require('moment');


class PoProductTableNew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filters: [],
      fetchData: 0,
      currentPOs: [],
    }
  }

  updateAndFilter = async (key,andQuery=[]) => {
    let filters = this.state.filters || []
    filters = [...andQuery, ...filters.filter(f => f[0] !== key)]
    console.log({ filters, andQuery })
    await this.setState({filters})
    //only fetch currentPOs if we have them in the filters (i.e in the url params)
    if (filters.filter(q => q[0] === 'po').length) {
      this.fetchCurrentPOs()
    } else {
      this.setState({currentPOs: []})
    }
  }

  fetchCurrentPOs = () => {
    //set skeleton pos 
    this.setState({
      currentPOs: this.state.filters.filter(q=>q[0] === 'po').map(q=>({isSkeleton: true}))
    })
    this.props.queryModelData('PurchaseOrder',this.state.filters.filter(q=>q[0] === 'po').map(([f,...q])=>['_id',...q]),'name','ascending',1,10,this.props.currentUser.user.company)
    .then(({data})=>{
      this.setState({
        currentPOs: data,
      })
    })
    .catch(err=>{
      this.setState({
        currentPOs: this.state.currentPOs.filter(r=> !r.isSkeleton),
      })
      console.log({err})
    })
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

  handleDelete = ({data}) => {
    return new Promise(async (resolve, reject) => {
      await this.props.removePoProducts(data, this.props.currentUser)
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
      await this.props.updatePoProducts(updates, this.props.currentUser)
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

  handleScan = (scan) => {
    return new Promise((resolve, reject) => {
      scan = {
        ...scan,
        user: this.props.currentUser.user.id,
      }
      scan.currentPOs = scan.currentPOs.sort((a, b) => (b.quantity - a.quantity))
      addBoxScan(scan, this.props.currentUser.user.company)
        .then(res => {
          let updatedPoProduct = res.updatedPoProduct || {}
          this.setState({fetchData: this.state.fetchData+1, fetchDataConfig: {rowIds: [updatedPoProduct._id]}})
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

  handlePoComplete = (poProduct) => {
    this.showConfirm('PO Completed', null, [], `All units for PO "${poProduct.name}" were scanned, remove it from current purchase orders?`)
      .then((res) => {
        if (res !== 'cancel') {
          let path = this.props.history.location.pathname.split(',').filter(id=>id && id !== poProduct._id).join()
          if (path !== this.props.history.location.pathname) {
            this.props.history.push(path)
          }
        }
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

  handleCurrentPoTagClick = (data) => {
    if (typeof data !== 'object') {
      return
    }
    let values = ['name', 'quantity', 'type', 'status', 'createdOn']
    this.props.addNotification({
      nType: 'modal',
      visible: true,
      footer: null,
      content: (
        Object.entries(data).filter(([field, value])=>values.includes(field)).map(([field, value],i)=>
          <div key={field + i}>
            {field === 'createdOn' ? 
              <div>
                <span style={{fontWeight: 600}}>Date Created: </span>{new moment(Date(value).toLocaleString()).format('M/D/YY') }
              </div>
            :
              <div>
                <span style={{fontWeight: 600}}>{field}: </span>{value}
              </div>
            }
          </div>
        )
      ),
      title: data.name,
      id: data._id || 'unknown',
      onCancel: () => this.props.removeNotification({id: data._id || 'unknown'}),
    })
  }

  render() {
    const { currentPOs = [] } = this.state
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
          fetchData={this.state.fetchData}
          fetchDataConfig={this.state.fetchDataConfig}
          // scanFormConfig={({data=[], scannerClosed})=>({
          //   // currentPOs: this.props.match.params.po ? this.props.match.params.po.split(',').filter(id => id).map(id => data.find(r => r.po && r.po._id === id)).filter(pop=>pop && pop.po).map(pop => pop.po) : [],
          //   currentPOs,
          //   requirePO: true,
          //   poMode: 'multiple',
          //   onScan: this.handleScan,
          //   skipControlledUpdateCallback: true,
          //   onCurrentPOUpdate: (pos,ids) => {
          //     if (scannerClosed === false) {
          //       ids = Array.isArray(ids) ? ids : [ids]
          //       let path = '/app/po-products/'+ids.filter(({id,key})=>id||key).map(({id,key})=>id||key).join()
          //       console.log({ids,path, currentPath: this.props.history.location.pathname, history: this.props.history})
          //       if (path !== this.props.history.location.pathname) {
          //         this.props.history.push(path)
          //       }
          //     }
          //   },
          //   onAddQuantity: (a)=>console.log({a}),
          //   scanToPo: false,
          // })}
          scanFormConfig={{
            // currentPOs: this.props.match.params.po ? this.props.match.params.po.split(',').filter(id => id).map(id => data.find(r => r.po && r.po._id === id)).filter(pop=>pop && pop.po).map(pop => pop.po) : [],
            currentPOs: this.state.currentPOs.filter(p=>!p.isSkeleton),
            requirePO: true,
            poMode: 'multiple',
            onScan: this.handleScan,
            skipControlledUpdateCallback: true,
            onAddQuantity: (a)=>console.log({a}),
            scanToPo: false,
          }}
          onCurrentPOUpdate={(pos,ids,scannerClosed) => {
            if (scannerClosed === false) {
              ids = Array.isArray(ids) ? ids : [ids]
              let path = '/app/po-products/'+ids.filter(({id,key})=>id||key).map(({id,key})=>id||key).join()
              console.log({ids,path, currentPath: this.props.history.location.pathname, history: this.props.history})
              if (path !== this.props.history.location.pathname) {
                this.props.history.push(path)
              }
            }
            console.log({pos,ids,scannerClosed})
          }}
          title={"Purchase Order Products"}
          queryModel="PoProduct"
          editTitle={"PO Product"}
          populateArray={[{ path: 'po' }, { path: 'product' }]}
          extraTopContent={({data=[]})=>{
            if (this.props.match.params.po) {
              // let pos = this.props.match.params.po.split(',').filter(id=>id).map(id=>data.find(r=>r.po && r.po._id === id) || {po: {idNotFound: id}}).map(pop=>pop && pop.po ? pop.po : {})
              let pos = currentPOs
              return (
                <div className="flex align-items-center flex-wrap" style={{ paddingTop: 12 }}>
                  {pos.length + ' Open Purchase Order' + `${pos.length > 1 ? 's' : ''}`}
                  <Divider type="vertical" />
                  {pos.map((po,i) => {
                    let foundPo = data.find(r=>r.po && r.po._id === po._id)
                    return(
                    <Tooltip key={po._id || i} title={!foundPo ? 'No Results Found' : false}>
                      <Tag
                        onClick={()=>!po.isSkeleton && this.handleCurrentPoTagClick(po)}
                        onClose={(e)=>{
                          e.stopPropagation()
                          this.props.history.push('/app/po-products/'+pos.map((p={})=>p._id).filter(id => id !== po._id).join())
                        }}
                        closable
                        className="table-tag"
                        key={po._id || i}
                        style={{ background: '#fff', fontSize: 14, padding: '2px 7px', marginRight: 7,
                          ...!po.isSkeleton && {cursor: 'pointer'},
                          ...po.isSkeleton && {minWidth: 80},
                          ...!foundPo && !po.isSkeleton && {opacity: .6}
                          }
                        }>
                          <Skeleton paragraph={false} loading={po.isSkeleton} active>
                            {po.name}
                          </Skeleton>
                      </Tag>                    
                    </Tooltip>
                  )}).concat(
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
                            this.props.history.push('/app/po-products/'+[...pos.filter(id=>id).map((p={})=>p._id),clicked.data._id || ""].join())
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
            { id: 'sku', text: 'SKU', width: 175, span: 8, className: 'no-wrap', noEdit: true, createInputConfig: { type: 'autoComplete', queryModel: 'Product', nestedKey: 'sku', linkedFields: [{formRef:'productbarcode',dataRef: 'barcode'}], showAddOption: true, required: true }, },
            { id: 'product', nestedKey: 'barcode', text: 'Barcode', width: 175, span: 8, className: 'no-wrap', noBulkEdit: true},
            { id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 8, className: 'no-wrap', render: (pop = {}) => pop.quantity || 0, createInputConfig: { required: true } },
            { id: 'scannedQuantity', text: 'Scanned', width: 175, type: 'number', span: 8, className: 'no-wrap', render: (pop={})=> pop.scannedQuantity || 0, },
            { id: 'po', nestedKey: 'name', text: 'PO Name', width: 400, span: 8, className: 'no-wrap', noEdit: true, createInputConfig: { type: 'autoComplete', queryModel: 'PurchaseOrder', nestedKey: 'name', showAddOption: true, linkedFields: [{ formRef: 'potype', dataRef: 'type', render: (po={})=> po.type && po.type.charAt(0).toUpperCase() + po.type.slice(1), }, {formRef: 'postatus', dataRef: 'status', render: (po={})=> po.status && po.status.charAt(0).toUpperCase() + po.status.slice(1),}, {formRef:'pocreatedOn', dataRef: 'createdOn', type: 'date'}], }, },
            { id: 'po', nestedKey: 'type', text: 'PO Type', width: 250, span: 8, className: 'no-wrap', options: [{ id: 'Inbound' }, { id: 'Outbound' }], type: 'select', noEdit: true},
            { id: 'po', nestedKey: 'status', text: 'PO Status', width: 250, span: 8, className: 'no-wrap', options: [{ id: 'Complete' }, { id: 'Processing' }], type: 'select', noEdit: true},
            { id: 'po', nestedKey: 'createdOn', text: 'Date Created', width: 100, type: 'date', span: 8, className: 'no-wrap', noEdit: true },
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


export default connect(mapStateToProps, { importPurchaseOrder, updatePoProducts, removePoProducts, queryModelData, addNotification, removeNotification })(PoProductTableNew);