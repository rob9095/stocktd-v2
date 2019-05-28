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
    this.props.onFilterSearch([],[]);
  }

  handleSelect = (value, select) => {
    console.log({value,select})
    this.setState({
      selects: {...this.state.selects, [select.props.id]: value},
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
      // fitler out any empty entries
      let query = Object.entries(values).filter(val=>val[1] !== '' && val[1] !== undefined && val[1].length > 0).map(val=>{
        //check if we have a select for the query value, if we do add it to the third element in the query array
        if(this.props.inputs.find(i=>i.type === 'number' && i.id === val[0])) {
          return [...val, this.state.selects[val[0] + "Select"] || "="]
        } else if(Array.isArray(val[1])) {
          return [[val[0]],this.state.dates]
        } else {
          return [...val]
        }
      })
      //loop the provided iputs(form fields) and remove any inputs with nestedKeys(populated fields), and create a populateArray query
      let populateArray = [];
      if (this.props.inputs.filter(input=>input.nestedKey).length > 0) {
        for (let input of this.props.inputs) {
          let match = query.find(val => val[0] === input.id + input.nestedKey)
          if (match) {
            query = query.filter(val => val[0] !== match[0])
            match[0] = input.nestedKey
            let defaultQuery = input.defaultQuery || []
            input.populatePath ? 
              populateArray.push({ path: input.populatePath, populate: [{ path: input.id, query: [match] }, ...input.defaultPopulateArray], query: defaultQuery })
             :
              populateArray.push({ path: input.id, query: [match, ...defaultQuery] })
          }
        }
      }
      this.props.onFilterSearch(query,populateArray)
    });
  }

  handleScan = (scan) => {
    return this.props.onScan(scan)
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let inputs = this.props.inputs.map(i=>{
      const id = i.nestedKey ? i.id + i.nestedKey : i.id
      const selectBefore = (
        <Select key={`${id}Select`} defaultValue={'='} onChange={this.handleSelect} showArrow={false} className="number-input pre-select">
          <Option id={`${id}Select`} className="center-a" value="=">=</Option>
          <Option id={`${id}Select`} className="center-a" value="gt">{'>'}</Option>
          <Option id={`${id}Select`} className="center-a" value="gte">{'≥'}</Option>
          <Option id={`${id}Select`} className="center-a" value="lt">{'<'}</Option>
          <Option id={`${id}Select`} className="center-a" value="lte">{'≤'}</Option>
        </Select>
      )
      if (i.type === 'number') {
        return(
          <Col xs={i.span*3} md={i.span} key={id}>
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
          <Col xs={i.span*3} md={i.span} key={id}>
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
                    <Option key={id+val.id+"Select"} value={val.id}>{val.text}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        )
      } else {
        return (
          <Col xs={i.span*3} md={i.span} key={id}>
            <FormItem key={id} label={`${i.text}`}>
              {getFieldDecorator(id, {
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
            <Row gutter={24} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}}>{inputs}</Row>
            <div>
              <div span={24} className="flex justify-content-center" style={{ margin: '20px 10px' }}>
                <Button type="primary" htmlType="submit">Search</Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                  Clear
                </Button>
              </div>
            </div>
          </Form>
        )}
        {this.state.showScannerForm && (
          <WrappedScanForm
            currentPOs={this.props.currentPOs}
            requirePO={true}
            poMode={'multiple'}
            onScan={this.handleScan}
            onCurrentPOUpdate={this.props.onCurrentPOUpdate}
            onAddQuantity={this.props.onAddQuantity}
            scanToPo={this.props.scanToPo}
          />
        )}
      </div>
    );
  }
}

const WrappedFilterForm = Form.create()(FilterForm);
export default WrappedFilterForm
