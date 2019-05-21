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
    };
  }

  handleBlur = async (input, id) => {
    if (input.confirm) {
      this.setState({
        [id]: true,
      })
      return
    }
    if (input.onBlur === false || !this.props.onBlur) {
      return
    }
    this.setState({
      loadingInputs: [...this.state.loadingInputs, id],
    })
    let onBlur = typeof input.onBlur === 'function' ? input.onBlur : this.props.onBlur
    await onBlur()
    .then(res=>this.setState({[id]: {status: 'done'}}))
    .catch(err=>this.setState({[id]: {status: 'execption'}}))
    setTimeout(()=>{
      this.setState({
        loadingInputs: this.state.loadingInputs.filter(fid => fid !== id),
        [id]: null,
      })
    },input.timeout || 2000)
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
                  message: i.text + ' is required.',
                }],
              })(
                <Input
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
                  message: i.text + ' is required.',
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
                  message: i.text + ' is required.',
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
            <FormItem key={id} label={`${i.text}`} labelCol={i.labelCol} wrapperCol={i.wrapperCol}>
              {getFieldDecorator(id, {
                initialValue: i.initialValue,
                rules: [{
                  required: i.required,
                  message: i.text + ' is required.',
                  trigger: 'onBlur',
                }],
              })(
                <Input
                  size="small"
                  placeholder={i.text}
                  onBlur={()=>this.handleBlur(i,id)}
                  suffix={
                    this.state.loadingInputs.includes(id) && (
                      <CircularProgress {...this.state[id] ? {...this.state[id]} : {}}  />
                    )
                  }
                />
              )}
            </FormItem>
            {i.confirm && this.state[id] && (
              <div className="flex space-between align-items-center half-pad" style={{borderTop: '1px solid rgb(218, 210, 224)', background: '#f9f9fd', marginTop: -5}}>
                <div className="flex" style={{fontSize: 16}}>
                  {i.confirmMessage || <div className="flex align-items-center"><Icon type="info-circle" style={{fontSize: 24, marginRight: 5}} /> Please confirm the changes</div>}
                </div>
                <div className="flex">
                  <Button style={{marginRight: 5}} size="large" onClick={()=>this.handleConfirmCancel(i,id)}>Cancel</Button>
                  <Button style={{ marginRight: 5 }} size="large" type="primary">Save</Button>
                </div>
              </div>
            )}
          </Col>
        )
      }
    })
    return (
      <div>
        <Form layout={this.props.formLayout} className="basic-form">
          <Row gutter={2}>{inputs}</Row>
        </Form>
      </div>
    );
  }
}

const BasicForm = Form.create()(BForm);
export default BasicForm