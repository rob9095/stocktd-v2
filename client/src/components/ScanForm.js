import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Select } from 'antd';
import { getAllModelDocuments, upsertModelDocuments } from '../store/actions/models';
import InsertDataModal from './InsertDataModal';

const Option = Select.Option;
const FormItem = Form.Item;

class ScanForm extends Component {
  state = {
    showDataModal: false,
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
      this.setState({
        boxPrefixList: [...userPrefixList, ...this.state.boxPrefixList],
        currentPrefix: userPrefixList[0].value,
      })
    })
    .catch(err=>{
      console.log(err)
      this.setState({
        boxPrefixList: [{value: this.props.currentUser.email.split('@')[0], id: this.props.currentUser.id}, {value: 'Add New', id: 'Add New'}],
        currentPrefix: this.props.currentUser.email.split('@')[0],
      })
    })    
  }

  componentDidMount() {
    this.getBoxPrefixes()
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
        showDataModal: true,
      })
    } else {
      this.setState({
        currentPrefix: value,
      })
    }
  }

  handleNewBoxPrefix = (data) => {
    return new Promise((resolve,reject) => {
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

  render() {
    const { getFieldDecorator } = this.props.form;
    let preFixOptions = this.state.boxPrefixList.map(pf => (
      <Option value={pf.value} key={pf.id}>{pf.value}</Option>
    ))
    let boxSelect = (
      <Select onSelect={this.handlePrefixSelect} style={{minWidth: 105}} value={this.state.currentPrefix} >
        {preFixOptions}
      </Select>
    );
    return (
      <div>
        {this.state.showDataModal && (
          <InsertDataModal
            currentUser={this.props.currentUser}
            title={'Add Box Prefix'}
            inputs={[
              {span: 24, id: 'name', text: 'Box Prefix', required: true, message: 'Box Prefix is required'},
            ]}
            okText={'Save'}
            cancelText={'Cancel'}
            onClose={this.toggle('showDataModal')}
            onSave={this.handleNewBoxPrefix}
          />
        )}
        <Form
            className="scan-form"
          >
            <Row gutter={24}>
              <Col s={24} md={8}>
              <FormItem label="Box Name">
                {getFieldDecorator('boxName', {
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
                {getFieldDecorator('scanId', {
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
                {getFieldDecorator('scanQuantity', {initialValue: '1' }, {
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
                <Button
                type="primary"
                htmlType="submit"
                >
                  Scan
                </Button>
              </Col>
            </Row>
          </Form>       
      </div>
    );
  }
}

const WrappedScanForm = Form.create()(ScanForm);
export default WrappedScanForm