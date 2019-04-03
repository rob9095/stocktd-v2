import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Form, Row, Col, Input, Button, Select, Skeleton, Spin } from 'antd';
import { getAllModelDocuments, upsertModelDocuments } from '../store/actions/models';
import InsertDataModal from './InsertDataModal';

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
    await getAllModelDocuments('BoxPrefix',{user: this.props.currentUser.id},this.props.currentUser.company)
    .then(res=>{
      console.log(res)
      let userPrefixList = res.data.map(pf => ({
        value: pf.name,
        id: pf._id,
      }))
      this._isMounted && this.setState({
        boxPrefixList: [...userPrefixList, ...this.state.boxPrefixList],
        currentPrefix: userPrefixList[0] ? userPrefixList[0].value : this.props.currentUser.email.split('@')[0],
      })
    })
    .catch(err=>{
      console.log(err)
      this._isMounted && this.setState({
        boxPrefixList: [{value: this.props.currentUser.email.split('@')[0], id: this.props.currentUser.id}, {value: 'Add New', id: 'Add New'}],
        currentPrefix: this.props.currentUser.email.split('@')[0],
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
      upsertModelDocuments('BoxPrefix', [{...data, user: this.props.currentUser.id}], this.props.currentUser.company, 'name')
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
        this.props.onScan(values)
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
        // clear scan id
        setTimeout(()=> {
          this.props.form.setFieldsValue({barcode: ''})
        }, 250)        
      }
    });
  } 

  handleNewBarcode = (update) => {
    return new Promise((resolve,reject) => {
      upsertModelDocuments('Product', [{...update, skuCompany: update.sku + "-" + this.props.currentUser.company}], this.props.currentUser.company, 'skuCompany')
      .then(res => {
        resolve({text:'Barcode Updated!', status:'success'})
      })
      .catch(err => {
        console.log(err)
        reject({text:'Failed to Update Barcode',status:'error'})
      })
    })
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
            currentUser={this.props.currentUser}
            title={'Add Box Prefix'}
            inputs={[
              {span: 24, id: 'name', text: 'Box Prefix', required: true, message: 'Box Prefix is required'},
            ]}
            okText={'Save'}
            cancelText={'Cancel'}
            onClose={this.toggle('showBoxPrefixModal')}
            onSave={this.handleNewBoxPrefix}
          />
        )}
        {this.state.showBarcodeModal && (
          <InsertDataModal
            currentUser={this.props.currentUser}
            title={'Add Barcode'}
            inputs={[
              {span: 24, id: 'sku', text: 'SKU', required: true, message: 'SKU is required', autoComplete: true, queryModel: 'Product'},
              {span: 24, id: 'barcode', text: 'Barcode', required: true, message: 'Barcode is required'},
            ]}
            okText={'Save'}
            cancelText={'Cancel'}
            onClose={this.toggle('showBarcodeModal')}
            onSave={this.handleNewBarcode}
          />
        )}
        {this.props.currentPOs.length === 0 && this.props.requirePo ? 
          <div className="centered-container col">
            <h3>Please add a Purcase Order to start scanning</h3>
            <Link to='/app/purchase-orders'>
            <Button type="primary">
              Add Purchase Order
            </Button>
            </Link>
          </div>
        :
          <Spin spinning={!this.state.currentPrefix}>
            <Form
              className="scan-form"
              onSubmit={this.handleSubmit}
            >
              <Row gutter={24}>
                <Col s={24} md={8}>
                  <FormItem label="Box Name">
                    {getFieldDecorator('name', {
                      rules: [{
                        required: true,
                        message: 'Box Name Required',
                      }],
                    })(
                      <Input addonBefore={boxSelect} placeholder="Box Name" />
                    )}
                  </FormItem>
                </Col>
                <Col s={24} md={10}>
                  <FormItem label="Scan ID">
                    {getFieldDecorator('barcode', {
                      rules: [{
                        required: true,
                        message: 'Scan ID Required',
                      }],
                    })(
                      <Input placeholder="Scan ID" />
                    )}
                  </FormItem>
                </Col>
                <Col s={24} md={4}>
                  <FormItem label="Quantity">
                    {getFieldDecorator('quantity', { initialValue: '1' }, {
                      rules: [{
                        required: true,
                        message: 'Scan Quantity Required',
                      }],
                    })(
                      <Input type="number" />
                    )}
                  </FormItem>
                </Col>
                <Col s={24} md={2} style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 113,
                }}>
                  <Button type="primary" htmlType="submit">Scan</Button>
                </Col>
              </Row>
            </Form>
        </Spin>
        }       
      </div>
    );
  }
}

const WrappedScanForm = Form.create()(ScanForm);
export default WrappedScanForm