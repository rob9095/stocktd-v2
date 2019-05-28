import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Form, Row, Col, Input, Button, Select, Empty, Collapse, Modal, Table, Radio, Icon, Tooltip, List, Avatar, Skeleton } from 'antd';
import { getAllModelDocuments, upsertModelDocuments } from '../store/actions/models';
import { connect } from "react-redux";
import InsertDataModal from './InsertDataModal';
import AutoCompleteInput from './AutoCompleteInput';
import InfiniteList from './InfiniteList';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const FormItem = Form.Item;

class ScanForm extends Component {
  _isMounted = false 
  constructor(props) {
    super(props);
    this.state = {
      showBoxPrefixModal: false,
      logOpen: false,
      boxPrefixList: [
        { value: 'Add New', id: 'Add New' },
      ],
    }
  }

  getBoxPrefixes = async () => {
    // get the box prefixes for this user
    await getAllModelDocuments({model: 'BoxPrefix', documentRef: {user: this.props.currentUser.user.id}, company: this.props.currentUser.user.company})
    .then(res=>{
      console.log(res)
      let userPrefixList = res.data.map(pf => ({
        value: pf.name,
        id: pf._id,
      }))
      this._isMounted && this.setState({
        boxPrefixList: [...userPrefixList, ...this.state.boxPrefixList],
        currentPrefix: userPrefixList[0] ? userPrefixList[0].value : this.props.currentUser.user.email.split('@')[0],
      })
    })
    .catch(err=>{
      console.log(err)
      this._isMounted && this.setState({
        boxPrefixList: [{value: this.props.currentUser.user.email.split('@')[0], id: this.props.currentUser.user.id}, {value: 'Add New', id: 'Add New'}],
        currentPrefix: this.props.currentUser.user.email.split('@')[0],
      })
    })
  }

  componentDidMount() {
    this._isMounted = true;
    this.getBoxPrefixes()
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  toggle = (prop) => {
    this.setState({
      [prop]: !this.state[prop],
    })
  }

  handlePrefixSelect = (value, option) => {
    if (value === "Add New") {
      this.setState({
        showBoxPrefixModal: true,
      })
    } else {
      this.setState({
        currentPrefix: value,
      })
    }
  }

  handleNewBoxPrefix = (data) => {
    return new Promise((resolve,reject) => {
      if (this.state.boxPrefixList.some((pf)=>(pf.value === data.name))) {
        reject({text: 'Prefix already exists',status:'error'})
      }
      upsertModelDocuments('BoxPrefix', [{...data, user: this.props.currentUser.user.id}], this.props.currentUser.user.company, 'name')
      .then(res => {
        resolve({text:'Box Prefix Added',status:'success'})
        this.setState({
          boxPrefixList: [{value: data.name, id: res.upsertedDocs.upserted[0]._id}, ...this.state.boxPrefixList],
          currentPrefix: data.name,
        })
      })
      .catch(err => {
        console.log(err)
        reject({text:'Failed to Add Box Prefix',status:'error'})
      })
    })
  }

  showInfoModal = (config) => {
    let { title, action, list, buttons, message, okText, okType, maskClosable, error } = config
    return new Promise((resolve,reject) => {
      error = error || {}
      list = Array.isArray(list) && list.map((str, i) => <li key={i}>{str}</li>)
      buttons = Array.isArray(buttons) && buttons.map((btn, i) => 
      <Button onClick={()=>resolve(btn.text)} {...btn} key={i}>{btn.text}</Button>)
      let sku = error.poProduct ? error.poProduct.sku : error.product && error.product.sku
      let po = error.po || {}
      this.setState({
        infoModalConfig: {
          title: title || "Scan Error",
          content: (
            <div>
              <div>
                {message}
              </div>
              <ul>{list}</ul>
              <div className="flex space-evenly align-items-center" style={{padding: 5}}>
                {buttons}
              </div>
              {sku && (
                <div>
                  <strong>Scan Details</strong>
                  <Table
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "SKU",
                        dataIndex: "sku",
                      },
                      {
                        title: "Barcode",
                        dataIndex: "barcode",
                      },
                      {
                        title: 'PO Name',
                        dataIndex: 'name',
                      },
                      {
                        title: 'PO Type',
                        dataIndex: 'type',
                      },
                    ].filter(col=> po._id ? col : !col.title.includes("PO"))}
                    dataSource={[
                      {
                        key: sku,
                        sku,
                        barcode: error.barcode,
                        ...po,
                        ...config.error,
                      },
                    ]}
                  />
                </div>
              )}
              <div className="flex justify-flex-end" style={{marginTop: 10}}>
                <Button type="primary" onClick={()=>resolve('ok')}>
                  {okText || "Ok"}
                </Button>
              </div>
            </div>
          ),
          footer: null,
          onCancel: ()=>this.setState({infoModalConfig: null}),
          maskClosable: maskClosable || false
        }
      });
    })
  }

 
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      if (!err) {
        if (values.locations && values.locations.length === 0) {
          delete values.locations
        }
        this.props.onScan({
          ...values,
          prefix: this.state.currentPrefix,
          user: this.props.currentUser.user.id,
        })
        .then(res=>{
          console.log(res)
          this.setState({
            lastScan: res.updatedBoxScan,
          })
        })
        .catch((error)=>{
          console.log(error)
          this.handleError(error)
        })
        // clear scan id and reset focus
        setTimeout(()=> {
          this.props.form.setFieldsValue({barcode: ''})
          this.barcodeInput.focus()
        }, 250)
      }
    });
  }

  handleErrorOption = (option,error) => {
    switch(option) {
      case "Add PO":
        console.log(option)
        setTimeout(() => { this.setState({ poFocus: true })},600)
      break
      case "Add Quantity":
        //show modal with quantity input and disabled input for poProduct/po name, po Type
        this.props.onAddQuantity({ target: { id: error.poProduct._id}})
        break
      case "Allow Excess":
        //show are you sure modal with error.po.name and error.po.type
        break
      case "Remove PO":
        //show are you sure modal with error.po.name and error.po.type
        break
      default:
      console.log('unkown option', option) 
    }
  }

  handleError = async (error) => {
    let [message, ...rest] = error.message
    switch(message) {
      case 'Barcode not found':
        this.setState({showBarcodeModal: true})
        break
      case 'Scanned Quantity exceeds PO Product Quantity':
        let result = await this.showInfoModal({
          list: error.message,
          buttons: error.options.map(text=>({text, size: "small",})) || [],
          error,
        })
        this.setState({ infoModalConfig: null })
        console.log(result)
        this.handleErrorOption(result,error)
        break
      case 'Product not found on provided POs':
        result = await this.showInfoModal({
          list: error.message,
          buttons: error.options.map(text => ({ text, size: "small", })) || [],
          error,
        })
        this.setState({ infoModalConfig: null })
        console.log(result)
        this.handleErrorOption(result,error);
        break
      default:
        console.log({error: 'unknown error', error})
        await this.showInfoModal({
          list: ['Error scanning, please try again'],
        })
        this.setState({infoModalConfig: null})
    }

    setTimeout(() => {
      this.barcodeInput.focus()
    }, 550)
  }

  handleNewBarcode = (update) => {
    return new Promise((resolve,reject) => {
      upsertModelDocuments('Product', [{...update, skuCompany: update.sku + "-" + this.props.currentUser.user.company}], this.props.currentUser.user.company, 'skuCompany')
      .then(res => {
        resolve({text:'Barcode Updated!', status:'success'})
      })
      .catch(err => {
        console.log(err)
        reject({text:'Failed to Update Barcode',status:'error'})
      })
    })
  }

  handleAutoUpdate = (clicked, valKey) => {
    console.log(clicked)
    clicked.data = valKey === 'locations' ? [...clicked.id].map(l=>l.id) : clicked.data
    clicked.data = Object.keys(clicked.data).length > 0 ? clicked.data : ''
    this.props.form.setFieldsValue({ [valKey]: clicked.data || '' })
    this.setState({
      values: {
        ...this.state.values,
        [valKey]: clicked.data || '',
      }
    })
    this.props.onCurrentPOUpdate && valKey === 'currentPOs' && this.props.onCurrentPOUpdate(clicked.data);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let preFixOptions = this.state.boxPrefixList.map(pf => (
      <Option value={pf.value} key={pf.id}>{pf.value}</Option>
    ))
    let boxSelect = (
      <Select onSelect={this.handlePrefixSelect} style={{ minWidth: 105 }} value={this.state.currentPrefix} >
        {preFixOptions}
      </Select>
    );
    return (
      <div>
        {this.state.showBoxPrefixModal && (
          <InsertDataModal
            currentUser={this.props.currentUser.user}
            title={"Add Box Prefix"}
            inputs={[
              {
                span: 24,
                id: "name",
                text: "Box Prefix",
                required: true,
                message: "Box Prefix is required"
              }
            ]}
            okText={"Save"}
            cancelText={"Cancel"}
            onClose={()=>this.toggle("showBoxPrefixModal")}
            onSave={this.handleNewBoxPrefix}
          />
        )}
        <Modal
          visible={this.state.infoModalConfig ? true : false}
          {...this.state.infoModalConfig}
        >
          {this.state.infoModalConfig &&
            this.state.infoModalConfig.content}
        </Modal>
        {this.state.showBarcodeModal && (
          <InsertDataModal
            currentUser={this.props.currentUser.user}
            title={"Add Barcode"}
            inputs={[
              {
                span: 24,
                id: "sku",
                text: "SKU",
                required: true,
                message: "SKU is required",
                type: 'autoComplete',
                queryModel: "Product"
              },
              {
                span: 24,
                id: "barcode",
                text: "Barcode",
                required: true,
                message: "Barcode is required"
              }
            ]}
            okText={"Save"}
            cancelText={"Cancel"}
            onClose={()=>{
              this.toggle("showBarcodeModal")
              setTimeout(() => {
                this.barcodeInput.focus()
              },550)
            }}
            onSave={this.handleNewBarcode}
          />
        )}
          <Form className="scan-form" onSubmit={this.handleSubmit}>
            <Row gutter={24}>
              <Col s={24} md={8} lg={8}>
                <FormItem label="Purchase Order">
                  {getFieldDecorator("currentPOs", {
                    rules: [
                      {
                        required: this.props.form.getFieldValue('scanToPo') ? false : true,
                        message: "Purchase Order Required"
                      }
                    ]
                  })(
                    <AutoCompleteInput
                      queryModel={"PurchaseOrder"}
                      searchKey={"name"}
                      placeholder={"Search by PO Name"}
                      renderOption={item => (
                        <div style={{ maxHeight: 35, overflow: "hidden" }}>
                          <div style={{ fontSize: "small" }}>
                            {item["name"]}
                          </div>
                          <div style={{ marginTop: -5, fontSize: 10, color: "grey" }}>
                            {item["type"]}
                          </div>
                        </div>
                      )}
                      mode={this.props.form.getFieldValue('scanToPo') ? 'default' : 'multiple'}
                      selected={this.props.currentPOs}
                      onUpdate={clicked =>
                        this.handleAutoUpdate(clicked, "currentPOs")
                      }
                      setFocus={this.state.poFocus || false}
                      notFound={(
                        <Empty
                          imageStyle={{ height: 20 }}
                          description={(
                            <span>
                              <Link to="/app/purchase-orders" style={{fontSize: 'small', opacity: '.8'}}>Add Purchase Order</Link>
                            </span>
                          )}
                        />
                      )}
                    >
                      <Input style={{ display: "none" }} />
                    </AutoCompleteInput>
                  )}
                </FormItem>
              </Col>
              <Col s={24} md={7} lg={9}>
                <FormItem label="Location">
                  {getFieldDecorator("locations")(
                    <AutoCompleteInput
                      queryModel={"Location"}
                      searchKey={"name"}
                      placeholder={"Location"}
                      mode={"tags"}
                      onUpdate={clicked =>
                        this.handleAutoUpdate(clicked, "locations")
                      }
                    >
                      <Input style={{ display: "none" }} />
                    </AutoCompleteInput>
                  )}
                </FormItem>
              </Col>
              <Col s={24} md={9} lg={7}>
                <FormItem label="Scan Type" add >
                  {getFieldDecorator("scanToPo", {
                    initialValue: this.props.scanToPo === false  ? false : true, rules: [
                      {
                        required: true,
                        message: "Scan type is required"
                      }
                    ] })(
                    <RadioGroup buttonStyle="solid" size="small">
                      <Radio.Button value={true}>Scan to PO</Radio.Button>
                      <Radio.Button value={false}>Scan from PO</Radio.Button>
                    </RadioGroup>
                  )}
                  <Tooltip overlayStyle={{ fontSize: 'small' }} title="What's this?">
                    <Button size="small" className="no-border no-bg" onClick={() => this.showInfoModal({
                      title: 'Scan Types Explained',
                      message: (
                        <div>
                          <h4>Scan From PO</h4>
                          <ul>
                            <li>Scanning from a purchase order <strong>does not affect current inventory levels</strong> and is used to audit inbound and outbound purchase orders.</li>
                            <li>After a successful scan, the box information is saved and the scanned quantity for the product is updated on the purchase order.</li>
                            <li>You can scan from multiple purchase orders but at least one purchase order is required to scan from.</li>
                            <li>If the same product is on multiple purchase orders, the scanner will scan from the purchase order with the largest quantity first.</li>
                          </ul>
                          <h4>Scan To PO</h4>
                          <ul>
                            <li>Scanning to a purchase order <strong>does affect current inventory levels</strong> and is used for adding inventory and products to purchase orders.</li>
                            <li>After a successful scan, the box information is saved, the quantity for the product is updated on the purchase order, and the inventory level is updated on the product.</li>
                            <li>You can only scan to one purchase order at a time and you are not required to choose a purchase order to scan to.</li>
                            <li>If no purchase order is selected, the scanned inventory and products are added to a generic inbound purchase order.</li>
                          </ul>
                        </div>
                      )
                    }).then(() => this.setState({ infoModalConfig: null }))}>
                      <Icon type="question-circle" theme="twoTone" twoToneColor="#716aca" />
                    </Button>
                  </Tooltip>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col s={24} md={8} lg={8}>
                <FormItem label="Box Name">
                  {getFieldDecorator("name", {
                    rules: [
                      {
                        required: true,
                        message: "Box Name Required"
                      }
                    ]
                  })(
                    <Input
                      addonBefore={this.state.currentPrefix ? boxSelect :
                        <div style={{marginTop: -7, width: 65}}>
                          <Skeleton paragraph={false} loading={true} active />
                        </div>
                      }
                      placeholder="Box Name"
                    />
                  )}
                </FormItem>
              </Col>
              <Col s={24} md={9} lg={10}>
                <FormItem label="Scan ID">
                  {getFieldDecorator("barcode", {
                    rules: [
                      {
                        required: true,
                        message: "Scan ID Required"
                      }
                    ]
                  })(
                    <Input
                      ref={node => (this.barcodeInput = node)}
                      placeholder="Scan ID"
                    />
                  )}
                </FormItem>
              </Col>
              <Col s={24} md={4}>
                <FormItem label="Quantity">
                  {getFieldDecorator(
                    "quantity",
                    { initialValue: "1" },
                    {
                      rules: [
                        {
                          required: true,
                          message: "Scan Quantity Required"
                        }
                      ]
                    }
                  )(<Input type="number" />)}
                </FormItem>
              </Col>
              <Col
                s={24}
                md={3}
                lg={2}
              >
                <FormItem label=" " colon={false}>
                  <Button type="primary" htmlType="submit">Scan</Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
          {!this.props.hideScanLog && (
            <div id="scan-log" style={{position: 'relative', padding: '0px 0px 24px 0px'}}>
              <Button
                size="small"
                type={this.state.logOpen ? 'primary' : 'default'}
                onClick={()=>this.setState({logOpen: !this.state.logOpen})}
                style={{marginBottom: 10}}
              >
                Recent Scans {this.state.logOpen && <Icon type="close" />}
              </Button>
            {this.state.logOpen && (
              <InfiniteList
                lastItem={this.state.lastScan}
                id="scan-log"
                sortColumn="lastScan"
                sortDir="descending"
                queryModel="BoxScan"
                populateArray={[{ path: 'locations' }, { path: 'po' }, { path: 'user' }]}
                itemTitle={'sku'}
                itemDescription={'po.name'}
                itemContent={'lastScan'}
                renderItem={(item, itemLoading) =>
                  <List.Item
                    key={item._id}
                    style={{
                      borderBottom: '0px',
                      background: '#fff',
                      ...itemLoading ? { padding: 10, height: 47, paddingTop: 25 } : { padding: 0 },
                      margin: '10px 0px',
                    }}
                  >
                    <Skeleton paragraph={{ rows: 1, width: '100%' }} title={false} loading={itemLoading} active>
                      <List.Item.Meta
                        style={{ alignItems: 'center' }}
                        description={
                          <Collapse bordered={false} defaultActiveKey={['1']}>
                            <Collapse.Panel header={(
                              <div className="flex align-items-center space-between">
                                <div>
                                  {item.sku}
                                  <i style={{ fontSize: 12, color: 'grey' }}> scanned {item.scanToPo ? 'to' : 'from'}</i> {item.po && item.po.name}
                                </div>
                                <div style={{ fontSize: 12, color: 'grey' }}>
                                  {new Date(item.lastScan).toLocaleString()}
                                </div>
                              </div>
                            )} key={item._id} style={{ border: 0, }}>
                              <div className="flex" style={{ flexDirection: 'column' }}>
                                <span><strong>SKU: </strong>{item.sku}</span>
                                <span><strong>Scanned Quantity: </strong>{item.lastScanQuantity}</span>
                                <span><strong>Box Quantity: </strong>{item.quantity}</span>
                                <span><strong>Purchase Order: </strong>{item.po && item.po.name}</span>
                                <span><strong>Box: </strong>{item.name}</span>
                                <span><strong>User: </strong>{item.user && item.user.email}</span>
                                <span><strong>Date: </strong>{new Date(item.lastScan).toLocaleString()}</span>
                              </div>
                            </Collapse.Panel>
                          </Collapse>
                        }
                      />
                    </Skeleton>
                  </List.Item>
                }
              />
            )}
            </div>
          )}
      </div>
    );
  }
}

const WrappedScanForm = Form.create()(ScanForm);

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors
  };
}

export default connect(mapStateToProps, {})(WrappedScanForm);