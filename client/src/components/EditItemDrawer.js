import React, { Component } from 'react';
import { Alert, Drawer, Form, Button, Col, Row, Input, Select, DatePicker } from 'antd';
const moment = require('moment');

const Option = Select.Option;
const FormItem = Form.Item;

class DrawerForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: true,
      alertText: '',
      alertType: '',
      showAlert: false,
     }
  }

  toggle = () => {
    this.setState({
      visible: !this.state.visible,
    });
    this.props.onClose();
  };

  handleAlert = (alertText, alertType) => {
    this.setState({
      showAlert: true,
      alertText,
      alertType,
    })
  }

  hideAlert = () => {
    this.setState({
      showAlert: false,
    })
  }

  handleDateChange = (date, dateString) => {
    console.log(date, dateString);
    this.setState({
      date: dateString,
    })
  }

  handleSelect = (value, select) => {
    this.setState({
      selects: {[select.props.id]: value},
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.hideAlert();
    this.props.form.validateFields((err, inputs) => {
      console.log('Received values of form: ', inputs);
      for (let input of this.props.inputs) {
        if (input.required === true && inputs[input.id] === undefined || inputs[input.id] === '' || inputs[input.id] === null) {
          this.handleAlert(`${input.text} cannot be blank`, 'error')
          return
        }
      }
      // fitler out any empty entries or values that are the same
      const values = Object.entries(inputs).filter(val=>val[1] !== undefined)
      if (values.length === 0) {
        this.handleAlert('No Updates Found','warning');
        return
      }
      let update = {
        id: this.props.item._id,
        poRef: this.props.item.poRef,
        oldQty: this.props.item.quantity,
        ...this.state.selects,
      }
      for (let val of values) {
        update = {
          ...update,
          [val[0]]: val[0] === 'createdOn' ? new Date(val[1]).toLocaleString() : val[1],
        }
      }
      console.log(update)
      this.props.onSave(this.props.create ? [inputs] : [update],this.props.item._id)
      .then(res=>{
        this.handleAlert('Changes Saved','success')
      })
      .catch(err=>{
        console.log(err)
        this.handleAlert(err[0],'error')
      })
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let item = this.props.item
    let inputs = this.props.inputs.map(i=>{
      if (i.type === 'textarea') {
        return (
          <Col xs={i.span*3} sm={i.span} key={i.id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(i.id, { initialValue: item[i.id] }, {
                 rules: [{
                   required: i.required,
                   message: i.message,
                 }],
               })(
                  <Input.TextArea
                   rows={i.textRows}
                   placeholder={i.text}
                   disabled={i.disabled}
                  />
               )}
            </FormItem>
          </Col>
        )
      } else if (i.type === 'date') {
        return (
          <Col xs={i.span*3} sm={i.span} key={i.id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(i.id, { initialValue: !this.props.create ? moment(new Date(item[i.id])) : moment() }, {
                 rules: [{
                   required: i.required,
                   message: i.message,
                 }],
               })(
                  <DatePicker onChange={this.handleDateChange} className={i.className} disabled={i.disabled} />
               )}
            </FormItem>
          </Col>
        )
      } else if (i.type === 'dropdown') {
        return (
          <Col xs={i.span*3} sm={i.span} key={i.id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(i.id, { initialValue: item[i.id] }, {
                 rules: [{
                   required: i.required,
                   message: i.message,
                 }],
               })(
                 <Select key={`${i.id}Select`} onChange={this.handleSelect} size="large" disabled={i.disabled}>
                   {i.values.map(val => (
                     <Option id={`${i.id}Select`} key={val.id} value={val.id}>{val.text}</Option>
                   ))}
                 </Select>
               )}
            </FormItem>
          </Col>
        )
      } else {
        return (
          <Col xs={i.span*3} sm={i.span} key={i.id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(i.id, { initialValue: item[i.id] }, {
                 rules: [{
                   required: i.required,
                   message: i.message,
                 }],
               })(
                  <Input
                   type={i.type}
                   placeholder={i.text}
                   disabled={i.disabled}
                  />
               )}
            </FormItem>
          </Col>
        )
      }
    })
    return (
        <Drawer
          title={this.props.title}
          width={document.documentElement.clientWidth < 720 ? '100%' : 720}
          placement="right"
          onClose={this.toggle}
          maskClosable={false}
          visible={this.state.visible}
          style={{
            height: 'calc(100% - 55px)',
            overflow: 'auto',
            paddingBottom: 53,
          }}
        >
          {this.state.showAlert && (
            <Alert style={{margin: '-10px 0px 10px 0px'}} closable afterClose={this.hideAlert} message={this.state.alertText} type={this.state.alertType} showIcon />
          )}

          <Form layout="vertical" onSubmit={this.handleSubmit}>
            <Row gutter={24}>{inputs}</Row>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px',
              }}
            >
              <Button
                style={{
                  marginRight: 8,
                }}
                onClick={this.toggle}
                icon="close"
              >
                Cancel
              </Button>
              <Button htmlType="submit" onClick={this.handleSubmit} type="primary" icon="save">Save</Button>
            </div>
          </Form>
        </Drawer>
    );
  }
}

const EditItemDrawer = Form.create()(DrawerForm);
export default EditItemDrawer;
