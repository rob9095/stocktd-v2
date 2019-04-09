import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Form, Row, Col, Input, Button, Select, Skeleton, Spin } from 'antd';
import { getAllModelDocuments, upsertModelDocuments } from '../store/actions/models';
import InsertDataModal from './InsertDataModal';
import { connect } from "react-redux";
import AutoCompleteInput from './AutoCompleteInput';

const Option = Select.Option;
const FormItem = Form.Item;

class ScanForm extends Component {
  _isMounted = false 
  state = {
    showBoxPrefixModal: false,
    boxPrefixList: [
      {value: 'Add New', id: 'Add New'},
    ],
  };

  getBoxPrefixes = async () => {
    // get the box prefixes for this user
    await getAllModelDocuments('BoxPrefix',{user: this.props.currentUser.user.id},this.props.currentUser.user.company)
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
    return () => {
      this.setState({
        [prop]: !this.state[prop],
      })
    }
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

 
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      if (!err) {
        this.props.onScan({
          ...values,
          prefix: this.state.currentPrefix,
        })
        .then(res=>{
          console.log(res)
        })
        .catch(err=>{
          console.log(err)
          if (err[0] === 'Barcode not found') {
            this.setState({
              showBarcodeModal: true,
            })
          }
        })
        // clear scan id and reset focus
        setTimeout(()=> {
          this.props.form.setFieldsValue({barcode: ''})
          this.barcodeInput.focus()
        }, 250)        
      }
    });
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
    this.props.form.setFieldsValue({ [valKey]: clicked.data || '' })
    console.log(clicked)
    this.setState({
      values: {
        ...this.state.values,
        [valKey]: clicked.data || '',
      }
    })
    this.props.onCurrentPOUpdate(clicked)
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
            onClose={this.toggle("showBoxPrefixModal")}
            onSave={this.handleNewBoxPrefix}
          />
        )}
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
                autoComplete: true,
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
            onClose={this.toggle("showBarcodeModal")}
            onSave={this.handleNewBarcode}
          />
        )}
        <Spin spinning={!this.state.currentPrefix}>
          <Form className="scan-form" onSubmit={this.handleSubmit}>
            <Row gutter={24} style={{ minHeight: 90 }}>
              <Col s={24} md={8}>
                <FormItem label="Purchase Order">
                  {getFieldDecorator("currentPOs", {
                    rules: [
                      {
                        required: this.props.requirePO,
                        message: "Purchase Order Required"
                      }
                    ]
                  })(
                    <AutoCompleteInput
                      queryModel={"PurchaseOrder"}
                      searchKey={"name"}
                      placeholder={"Search by PO Name"}
                      renderOption={item => (
                        <div style={{ maxHeight: 40, overflow: "hidden" }}>
                          <div style={{ fontSize: "small" }}>
                            {item["name"]}
                          </div>
                          <div style={{ fontSize: 10, color: "grey" }}>
                            {item["type"]}
                          </div>
                        </div>
                      )}
                      mode={this.props.poMode || "default"}
                      selected={this.props.currentPOs}
                      onUpdate={clicked =>
                        this.handleAutoUpdate(clicked, "currentPOs")
                      }
                    >
                      <Input style={{ display: "none" }} />
                    </AutoCompleteInput>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col s={24} md={8}>
                <FormItem label="Box Name">
                  {getFieldDecorator("name", {
                    rules: [
                      {
                        required: true,
                        message: "Box Name Required"
                      }
                    ]
                  })(
                    <Input addonBefore={boxSelect} placeholder="Box Name" />
                  )}
                </FormItem>
              </Col>
              <Col s={24} md={10}>
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
                md={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 113
                }}
              >
                <Button type="primary" htmlType="submit">
                  Scan
                </Button>
              </Col>
            </Row>
          </Form>
        </Spin>
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