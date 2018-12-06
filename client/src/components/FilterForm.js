import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Select, Switch, DatePicker, Icon } from 'antd';
import WrappedScanForm from './ScanForm';

const Option = Select.Option;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class FilterForm extends Component {
  state = {
    showFilterForm: false,
    showScannerForm: false,
    selects: {

    },
    dates: [],
  };

  toggle = (prop) => {
    return () => {
      this.setState({
        [prop]: !this.state[prop],
      })
    }
  }

  handleReset = () => {
    this.props.form.resetFields();
    this.props.onFilterSearch([]);
  }

  handleSelect = (value, select) => {
    this.setState({
      selects: {[select.props.id]: value},
    })
  }

  handleDateSelect = (date, dateString) => {
    console.log(date, dateString);
    let endDate = new Date(`${dateString[1]}T23:59:59.999Z`)
    let offSet = endDate.getTimezoneOffset()
    this.setState({
      // adds local offset in minutes to second date so query works, I have no clue why
      dates: date.length > 0 ? [dateString[0], new Date(endDate).getTime() + offSet*60000] : null,
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(this.state)
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      // fitler out any empty entries or equal selects
      const selects = Object.entries(this.state.selects).filter(val=>val[1] !== '' && val[1] !== '=')
      const query = Object.entries(values).filter(val=>val[1] !== '' && val[1] !== undefined && val[1].length > 0).map(val=>{
        //check if we have a select for the query value, if we do add it to the element in the query array
        let select = selects.find(s=>s[0] === `${val[0]}Select`)
        if(select) {
          return [...val,select[1]]
        } else if(Array.isArray(val[1])) {
          return [[val[0]],this.state.dates]
        } else {
          return [...val]
        }
      })
      this.props.onFilterSearch(query)
    });
  }

  handleScan = (scan) => {
    return this.props.onScan(scan)
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
            <FormItem key={i.id} label={`${i.text}`}>
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
      } if (i.type === 'date') {
        return (
          <Col xs={i.span*3} md={i.span} key={i.id}>
            <FormItem key={i.id} label={`${i.text}`}>
              {getFieldDecorator(i.id, {
                 rules: [{
                   required: false,
                   message: '',
                 }],
               })(
                 <RangePicker key={i.id} onChange={this.handleDateSelect} />
               )}
            </FormItem>
          </Col>
        )
      } else {
        return (
          <Col xs={i.span*3} md={i.span} key={i.id}>
            <FormItem key={i.id} label={`${i.text}`}>
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
      <div>
        <Form layout="inline" style={{width: '10%', display: 'inline'}}>
          <FormItem label="Search">
            <Switch checked={this.state.showFilterForm} onChange={this.toggle('showFilterForm')} />
          </FormItem> 
          {this.props.showScannerForm && (
            <FormItem label="Scan">
              <Switch checked={this.state.showScannerForm} onChange={this.toggle('showScannerForm')} />
            </FormItem> 
          )}       
        </Form>
        {this.state.showFilterForm && (
          <Form
            className="ant-advanced-search-form"
            onSubmit={this.handleSubmit}
          >
            <Row gutter={24}>{inputs}</Row>
            <Row gutter={24}>
              <Col span={24} className="center-a" style={{ margin: '20px 10px' }}>
                <Button type="primary" htmlType="submit">Search</Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        )}
        {this.state.showScannerForm && (
          <WrappedScanForm
            currentUser={this.props.currentUser}
            currentPOs={this.props.currentPOs}
            requirePo={true}
            onScan={this.handleScan}
          />
        )}
      </div>
    );
  }
}

const WrappedFilterForm = Form.create()(FilterForm);
export default WrappedFilterForm
