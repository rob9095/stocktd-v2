import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Icon, Select } from 'antd';

const Option = Select.Option;
const FormItem = Form.Item;

class ProductSearchForm extends Component {
  state = {
    selects: {

    },
  };

  handleReset = () => {
    this.props.form.resetFields();
  }

  handleSelect = (value, select) => {
    this.setState({
      selects: {[select.props.id]: value},
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      // fitler out any empty entries or equal selects
      const selects = Object.entries(this.state.selects).filter(val=>val[1] !== '' && val[1] !== '=')
      console.log(selects)
      const query = Object.entries(values).filter(val=>val[1] !== '' && val[1] !== undefined).map(val=>{
        //check if we have a select for the query value, if we do add it to the element in the query array
        let select = selects.find(s=>s[0] === val[0])
        if(select) {
          return [...val,select[1]]
        } else {
          return [...val]
        }
      })
      this.props.onFilterSearch(query)
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let inputs = this.props.inputs.map(i=>{
      const selectBefore = (
        <Select key={`${i.id}Select`} defaultValue={'='} onChange={this.handleSelect} showArrow={false} className="number-input pre-select">
          <Option id={`${i.id}Select`} value="=">=</Option>
          <Option id={`${i.id}Select`} value="gt">{'>'}</Option>
          <Option id={`${i.id}Select`} value="gte">{'>='}</Option>
          <Option id={`${i.id}Select`} value="lt">{'<'}</Option>
          <Option id={`${i.id}Select`} value="lte">{'<='}</Option>
        </Select>
      )
      if (i.type === 'number') {
        return(
          <Col xs={i.span*3} md={i.span} key={i.id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(i.id, {
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
      } else {
        return (
          <Col xs={i.span*3} md={i.span} key={i.id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(i.id, {
                 rules: [{
                   required: false,
                   message: '',
                 }],
               })(
                 <Input
                   placeholder={i.text}
                 />
               )}
            </FormItem>
          </Col>
        )
      }
    })
    return (
      <Form
        className="ant-advanced-search-form"
        onSubmit={this.handleSubmit}
      >
        <Row gutter={24}>{inputs}</Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">Search</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
              Clear
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

const WrappedProductSearchForm = Form.create()(ProductSearchForm);
export default WrappedProductSearchForm
