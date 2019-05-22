import React, { Component } from 'react'
import { Form, Input, Button, DatePicker, Icon, Row, Col, Select, } from 'antd';
import CircularProgress from './CircularProgress';

const { RangePicker } = DatePicker;
const FormItem = Form.Item
const Option = Select.Option

class BForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingInputs: [],
      customFeedback: {},
    };
  }

  validate = async (fieldNames,input,id) => {
    return new Promise((resolve,reject)=>{
      this.props.form.validateFields(fieldNames, (errors, values) => {
        if (input.initialValue === values[id]) resolve({errors: true, values})
        resolve({errors,values})
      })
    })
  }

  handleBlur = async (input, id, skipConfirm) => {
    //validate
    let validation = await this.validate([id],input,id)
    if (validation.errors) {
      return
    }
    
    //if input uses special confirm step, setState and return
    if (input.confirm && !skipConfirm) {
      this.setState({
        [id]: true,
      })
      return
    }

    //if input doesn't use onBlur or we don't have onBlur handler in props return
    if (input.onBlur === false || !this.props.onBlur) {
      return
    }

    //add input to loadingInputs
    this.setState({
      loadingInputs: [...this.state.loadingInputs, id],
    })

    //use custom onBlur for input if avaiable otherwise use onBlur handler in props
    let onBlur = typeof input.onBlur === 'function' ? input.onBlur : this.props.onBlur
    await onBlur(validation.values, input.handler)
    .then(res=>{
      this.setState({[id]: {status: 'done'}})
    })
    .catch(err=>{
      this.setState({ [id]: { status: 'error' }, customFeedback: { ...this.state.customFeedback, [id]: { help: err.message.toString(), validateStatus: 'error' }}})
    })
    //reset state after timeout to show success/exception
    setTimeout(()=>{
      //reset value if we errored out onBlur
      this.state[id].status === 'error' && this.props.form.setFieldsValue({ [id]: input.initialValue })
      this.setState({
        loadingInputs: this.state.loadingInputs.filter(fid => fid !== id),
        [id]: null,
        customFeedback: {
          ...this.state.customFeedback,
          [id]: null,
        }
      })
    },input.timeout || 3000)
  }

  handleConfirmCancel = (input,id) => {
    this.setState({
      [id]: null
    })
    this.props.form.setFieldsValue({[id]: input.initialValue})
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let formItems = this.props.inputs || []
    let inputs = formItems.map((i,index) => {
      const id = i.nestedKey ? i.id + i.nestedKey : i.id
      let message = i.validationRender ? i.validationRender(i) : i.validationMessage || this.props.form.getFieldValue(id) ? 'Please enter a valid ' + i.text : i.text + ' is required.'
      const selectBefore = (
        <Select key={`${id}Select`} defaultValue={'='} onChange={this.handleSelect} showArrow={false} className="number-input pre-select">
          <Option id={`${id}Select`} value="=">=</Option>
          <Option id={`${id}Select`} value="gt">{'>'}</Option>
          <Option id={`${id}Select`} value="gte">{'>='}</Option>
          <Option id={`${id}Select`} value="lt">{'<'}</Option>
          <Option id={`${id}Select`} value="lte">{'<='}</Option>
        </Select>
      )
      if (i.type === 'number') {
        return (
          <Col xs={i.span * 3} md={i.span} key={id} style={index !== this.props.inputs.length - 1 && { borderBottom: '1px solid #dad2e0' }}>
            <FormItem key={id} label={`${i.text}`} labelCol={i.labelCol} wrapperCol={i.wrapperCol}>
              {getFieldDecorator(id, {
                initialValue: i.initialValue,
                rules: [{
                  required: i.required,
                  message,
                }],
              })(
                <Input
                  autoComplete={i.autoComplete || "off"}
                  type="number"
                  addonBefore={selectBefore}
                  placeholder={i.text}
                />
              )}
            </FormItem>
          </Col>
        )
      } if (i.type === 'date') {
        return (
          <Col xs={i.span * 3} md={i.span} key={id} style={index !== this.props.inputs.length - 1 && { borderBottom: '1px solid #dad2e0' }}>
            <FormItem key={id} label={`${i.text}`} labelCol={i.labelCol} wrapperCol={i.wrapperCol}>
              {getFieldDecorator(id, {
                initialValue: i.initialValue,
                rules: [{
                  required: i.required,
                  message,
                }],
              })(
                <RangePicker key={id} onChange={this.handleDateSelect} />
              )}
            </FormItem>
          </Col>
        )
      } else if (i.type === 'select') {
        return (
          <Col xs={i.span * 3} md={i.span} key={id} style={index !== this.props.inputs.length - 1 && { borderBottom: '1px solid #dad2e0' }}>
            <FormItem label={`${i.text}`} labelCol={i.labelCol} wrapperCol={i.wrapperCol}>
              {getFieldDecorator(id, {
                initialValue: i.initialValue,
                rules: [{
                  required: i.required,
                  message,
                }],
              })(
                <Select key={`${id}Select`} size="large" showSearch={i.showSearch}>
                  {i.values.map(val => (
                    <Option key={id + val.id + "Select"} value={val.id}>{val.text}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        )
      } else {
        return (
          <Col xs={i.span * 3} md={i.span} key={id} style={index !== this.props.inputs.length - 1 && { borderBottom: '1px solid #dad2e0'}}>
            {this.state.loadingInputs.includes(id) && (
              <CircularProgress style={{position: 'absolute', top: 25, right: 7}} {...this.state[id] ? { ...this.state[id] } : {}} />
            )}
            <FormItem key={id} {...this.state.customFeedback[id] && {...this.state.customFeedback[id]}} label={`${i.text}`} labelCol={i.labelCol} wrapperCol={i.wrapperCol}>
              {getFieldDecorator(id, {
                initialValue: i.initialValue,
                validateTrigger: 'onBlur',
                rules: [{
                  required: i.required,
                  message,
                  type: i.validType,
                }],
              })(
                <Input
                  autoComplete={i.initialValue ? "off" : !!window.chrome ? "disabled" : "off"}
                  size="small"
                  placeholder={i.text}
                  onBlur={() => this.handleBlur(i, id)}
                />
              )}
            </FormItem>
            {i.confirm && this.state[id] === true && (
              <div className="flex space-between align-items-center flex-wrap" style={{padding: '15px 30px', borderTop: '1px solid rgb(218, 210, 224)', background: '#f9f9fd', marginTop: -5}}>
                <div className="flex" style={{fontSize: 16}}>
                  {i.confirmMessage || <div className="flex align-items-center"><Icon type="info-circle" style={{fontSize: 24, marginRight: 5}} /> Please confirm the changes</div>}
                </div>
                <div className="flex">
                  <Button style={{marginRight: 5}} size="large" onClick={()=>this.handleConfirmCancel(i,id)}>Cancel</Button>
                  <Button size="large" type="primary" onClick={()=>this.handleBlur(i,id,true)}>Save</Button>
                </div>
              </div>
            )}
          </Col>
        )
      }
    })
    return (
      <div>
        <Form autoComplete="off" layout={this.props.formLayout} className="basic-form">
          <input type="hidden" autoComplete="false" />
          <Row gutter={2}>{inputs}</Row>
        </Form>
      </div>
    );
  }
}

const BasicForm = Form.create()(BForm);
export default BasicForm