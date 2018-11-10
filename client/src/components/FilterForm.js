import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Select, Switch, DatePicker, Icon } from 'antd';
import { getAllModelDocuments, upsertModelDocuments } from '../store/actions/models';
import InsertDataModal from './InsertDataModal';

const Option = Select.Option;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class FilterForm extends Component {
  state = {
    showDataModal: false,
    showFilterForm: false,
    showScannerForm: false,
    boxPrefixList: [
      {value: this.props.currentUser.email.split('@')[0], id: this.props.currentUser.id},     
    ],
    selects: {

    },
    dates: [],
  };

  getBoxPrefixes = async () => {
    // get the box prefixes for this user
    await getAllModelDocuments('BoxPrefix',{user: this.props.currentUser.id},this.props.currentUser.company)
    .then(res=>{
      let userPrefixList = res.data.map(pf => ({
        value: pf.name,
        id: pf._id,
      }))
      this.setState({
        boxPrefixList: [...this.state.boxPrefixList, ...userPrefixList, {value: 'Add New', id: 'Add New'}],
      })
    })
    .catch(err=>{
      console.log(err)
      this.setState({
        boxPrefixList: [...this.state.boxPrefixList, {value: 'Add New', id: 'Add New'}],
      })
    })    
  }

  componentDidMount() {
    if (this.props.showScannerForm) {
      this.getBoxPrefixes()
      console.log(this.state.boxPrefixList)
    }
  }

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

  handlePrefixSelect = (value, option) => {
    if (value === "Add New") {
      this.setState({
        showDataModal: true,
      })
    }
  }

  handleNewBoxPrefix = (data) => {
    return new Promise((resolve,reject) => {
      upsertModelDocuments('BoxPrefix', [{...data, user: this.props.currentUser.id}], this.props.currentUser.company, 'name')
      .then(res => {
        resolve({text:'Box Prefix Added',status:'success'})
        this.setState({
          boxPrefixList: [{value: data.name, id: res.upsertedDocs.upserted[0]._id}, ...this.state.boxPrefixList]
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
      <Select onSelect={this.handlePrefixSelect} style={{minWidth: 100}} defaultValue={this.state.boxPrefixList[0].value}>
        {preFixOptions}
      </Select>
    );
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
          <Form
            className="scan-form"
            onSubmit={this.handleScan}
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
        )}        
      </div>
    );
  }
}

const WrappedFilterForm = Form.create()(FilterForm);
export default WrappedFilterForm
