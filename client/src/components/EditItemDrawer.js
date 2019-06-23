import React, { Component } from 'react';
import { Alert, Drawer, Form, Button, Col, Row, Input, Select, DatePicker } from 'antd';
import AutoCompleteInput from './AutoCompleteInput';
import CascaderSelect from "./CascaderSelect";
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
      selects: {
        ...this.state.selects,
        [select.props.id]: value
      },
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.hideAlert();
    this.props.form.validateFields((err, inputs) => {
      console.log('Received values of form: ', inputs);
      for (let input of this.props.inputs) {
        if (input.required === true) {
          if (inputs[input.id] === undefined || inputs[input.id] === '' || inputs[input.id] === null) {
            this.handleAlert(`${input.text} cannot be blank`, 'error')
            return
          }
        }
      }
      //need to loop this.props.inputs and update nestedKeys with correct key
      for (let input of this.props.inputs) {
        console.log(inputs[input.id + input.nestedKey])
        if (inputs[input.id + input.nestedKey] !== undefined) {
          inputs[input.id] = inputs[input.id+input.nestedKey]
          delete inputs[input.id + input.nestedKey]
        }
      }
      // fitler out any empty entries or values that are the same
      const values = Object.entries(inputs).filter(val=>val[1] !== undefined && inputs[val[0]] !== this.props.item[val[0]]).filter(val=>{
        if (moment(val[1]).isValid()){
          //compare if the dates are the same day
          if (!moment(val[1]).isSame(this.props.item[val[0]], 'day')) {
            return val
          }
        } else {
          return val
        }
      })
      console.log(values)
      if (values.length === 0) {
        this.handleAlert('No Updates Found','warning');
        return
      }
      console.log(this.props.item)
      let update = {
        id: this.props.item._id,
        ...this.props.item.poRef && {poRef: this.props.item.poRef},
        ...values.find(val=>val[0] === 'quantity') && {oldQty: this.props.item.quantity},
        ...this.state.selects,
      }
      //add any required keys for update
      if (Array.isArray(this.props.reqUpdateKeys)) {
        for (let key of this.props.reqUpdateKeys) {
          update = {
            ...update,
            [key]: this.props.item[key]
          }
        }
      }
      //add/overwrite any updated values into the update
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
        this.handleAlert(err.message[0],'error')
      })
    });
  }

  handleAutoUpdate = (clicked, id) => {
    console.log(clicked)
    this.props.form.setFieldsValue({ [id]: Array.isArray(clicked.id) && clicked.id.map(c =>c.id) || [] })
  }

  handlerCascaderUpdate = (value, options, i) => {
    return new Promise((resolve,reject) => {
      let parentValue = options[i.reverseData ? 1 : 0] ? options[i.reverseData ? 1 : 0].id : null;
      let childValue = options[i.reverseData ? 0 : 1] ? options[i.reverseData ? 0 : 1].id : null;
      let update = {
        [i.parent.defaultKey]: parentValue,
        [i.child.defaultKey]: childValue
      }
      this.props.form.setFieldsValue(update)
      resolve('success')
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let { item, inputs } = this.props
    let formInputs = inputs.map(i=>{
      let initialValue = i.nestedKey && item[i.id] ? item[i.id][i.nestedKey] : item[i.id]
      let id = i.nestedKey ? i.id+i.nestedKey : i.id
      if (i.type === 'textarea') {
        return (
          <Col xs={i.span*3} sm={i.span} key={id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(id, { initialValue }, {
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
      } else if (i.type === 'cascader') {
        return (
          <Col xs={i.span * 3} sm={i.span} key={`${item._id || ''}-${i.id}cascader-select`}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(i.id, {
                rules: [{
                  required: i.required,
                  message: i.message,
                }],
              })(
                <CascaderSelect
                  domRef={`${item._id || ''}-${i.id}edit-cascader-select`}
                  data={Array.isArray(item[i.id]) ? item[i.id].map(box => ({ ...box, [i.parent.defaultKey]: item[i.parent.defaultKey], [i.child.defaultKey]: item[i.child.defaultKey] })).filter(box => box.scanToPo == true) : []}
                  parent={i.parent}
                  child={i.child}
                  reverseData={i.reverseData}
                  onUpdate={(v,o)=>this.handlerCascaderUpdate(v,o,i)}
                >
                  <Input style={{ display: "none" }} />
                </CascaderSelect>
              )}
            </FormItem>
          </Col>
        )
      } else if (i.type === 'autoComplete') {
        return (
          <Col xs={i.span * 3} sm={i.span} key={id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(i.id, { initialValue }, {
                rules: [{
                  required: i.required,
                  message: i.message,
                }],
              })(
                <AutoCompleteInput
                  queryModel={i.queryModel}
                  searchKey={i.nestedKey}
                  placeholder={i.text}
                  mode={i.autoCompleteMode}
                  onUpdate={(clicked) => this.handleAutoUpdate(clicked, i.id)}
                  skipSelectedCallback={true}
                  selected={Array.isArray(item[i.id]) ? item[i.id] : []}
                >
                  <Input style={{ display: "none" }} />
                </AutoCompleteInput>
              )}
            </FormItem>
          </Col>
        )
      } else if (i.type === 'date') {
        return (
          <Col xs={i.span*3} sm={i.span} key={id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(id, { initialValue: !this.props.create ? moment(new Date(initialValue)) : moment() }, {
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
          <Col xs={i.span*3} sm={i.span} key={id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(id, { initialValue }, {
                 rules: [{
                   required: i.required,
                   message: i.message,
                 }],
               })(
                 <Select key={`${id}Select`} onChange={this.handleSelect} size="large" disabled={i.disabled}>
                   {i.values.map(val => (
                     <Option id={`${id}Select`} key={val.id} value={val.id}>{val.text}</Option>
                   ))}
                 </Select>
               )}
            </FormItem>
          </Col>
        )
      } else {
        return (
          <Col xs={i.span*3} sm={i.span} key={id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(id, { initialValue }, {
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
            <Row gutter={24}>{formInputs}</Row>
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
