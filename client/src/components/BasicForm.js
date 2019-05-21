import React, { Component } from 'react'
import { Form, Input, Button, DatePicker, Radio, Row, Col, Select, } from 'antd';

const { RangePicker } = DatePicker;
const FormItem = Form.Item
const Option = Select.Option

class BForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { formLayout } = this.state;
    const { getFieldDecorator } = this.props.form;
    let formItems = this.props.inputs || []
    let inputs = formItems.map(i => {
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
          <Col xs={i.span * 3} md={i.span} key={id}>
            <FormItem key={id} label={`${i.text}`}>
              {getFieldDecorator(id, {
                rules: [{
                  required: false,
                  message: '',
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
          <Col xs={i.span * 3} md={i.span} key={id}>
            <FormItem key={id} label={`${i.text}`}>
              {getFieldDecorator(id, {
                rules: [{
                  required: false,
                  message: '',
                }],
              })(
                <RangePicker key={id} onChange={this.handleDateSelect} />
              )}
            </FormItem>
          </Col>
        )
      } else if (i.type === 'dropdown') {
        return (
          <Col xs={i.span * 3} sm={i.span} key={id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(id)(
                <Select key={`${id}Select`} size="large">
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
          <Col xs={i.span * 3} md={i.span} key={id}>
            <FormItem key={id} label={`${i.text}`} labelCol={i.labelCol} wrapperCol={i.wrapperCol}>
              {getFieldDecorator(id, {
                initialValue: i.initialValue,
                rules: [{
                  required: false,
                  message: '',
                }],
              })(
                <Input
                  size="small"
                  placeholder={i.text}
                />
              )}
            </FormItem>
          </Col>
        )
      }
    })
    return (
      <div>
        <Form layout={this.props.formLayout} className="basic-form">
          <Row gutter={24}>{inputs}</Row>
        </Form>
      </div>
    );
  }
}

const BasicForm = Form.create()(BForm);
export default BasicForm