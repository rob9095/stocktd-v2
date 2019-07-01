import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Select, Switch, DatePicker, Icon } from 'antd';

const moment = require('moment');
const Option = Select.Option;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class BasicSearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selects: {},
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query || prevProps.populateQuery !== this.props.populateQuery) {
      let pQuery = prevProps.query || []
      let pPopQuery = prevProps.populateQuery || []
      let pq = [...pQuery, ...pPopQuery]
      console.log({
        currentQuery: this.props.query,
      })
      this.setQueryValues(pq)
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
    this.props.onSearch([], []);
  }

  handleSelect = async (value, select) => {
    await this.setState({
      selects: { ...this.state.selects, [select.props.id]: value },
    })
    if (this.props.form.getFieldValue(select.props.iref)) {
      this.handleSubmit()
    }
  }

  handleDateSelect = async (date, dateString,id) => {
    console.log(date, dateString);
    let endDate = new Date(`${dateString[1]}T23:59:59.999Z`)
    let offSet = endDate.getTimezoneOffset()
    await this.setState({
      // adds local offset in minutes to second date so query works, I have no clue why
      //[id]: date.length > 0 ? [dateString[0], new Date(endDate).getTime() + offSet * 60000] : null,
      [id]: date.length > 0 ? dateString : undefined,
    })
    this.handleSubmit()
  }

  handleClear = (id) => {
    this.props.form.setFieldsValue({[id]: ''})
    this.handleSubmit()
  }

  handleSubmit = (e) => {
    e && e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      // fitler out any empty entries
      let query = Object.entries(values).filter(val => val[1] && val[1].length > 0).map(val => {
        //check if we have a select for the query value, if we do add it to the third element in the query array
        if (this.props.inputs.find(i => i.type === 'number' && i.id === val[0])) {
          return [...val, this.state.selects[val[0] + "Select"] || "="]
        } else if (Array.isArray(val[1]) && this.state[val[0]]) {
          return [[val[0]], this.state[val[0]]]
        } else {
          return [...val]
        }
      })
      //loop the provided iputs(form fields) and remove any inputs with nestedKeys(populated fields), and create a populateArray query
      let populateArray = [];
      let populateQuery = [];
      if (this.props.inputs.filter(input => input.nestedKey).length > 0) {
        for (let input of this.props.inputs) {
          let popId = input.id + input.nestedKey
          let match = query.find(val => val[0] === popId)
          if (match) {
            query = query.filter(val => val[0] !== match[0])
            match[0] = input.nestedKey
            let defaultQuery = input.defaultQuery || []
            //remove spaces from text label
            let text = input.text.split("").filter(l=>l!==' ').join('')
            if (input.populatePath) {
              populateArray.push({ path: input.populatePath, populate: [{ path: input.id, query: [match] }, ...input.defaultPopulateArray], query: defaultQuery })
              populateQuery.push({ popId, path: input.populatePath, id: input.id, text, match})
            } else {
              populateArray.push({ path: input.id, query: [match, ...defaultQuery] })
              populateQuery.push({ popId, id: input.id, text, match })
            }
          }
        }
      }
      //if there is no new queries and the old queries were empty, just return to avoid unneeded searches :)
      if (!query.length && !this.props.query.length && !populateQuery.length && !this.props.populateQuery.length) {
        return
      }
      this.props.onSearch(query, populateArray, populateQuery)
    });
  }

  setQueryValues = (prevQuery = []) => {
    //parse any incoming queries and popQueries and set/reset fields if neccesary
    let query = this.props.query || []
    let popQuery = this.props.populateQuery || []
    let comibinedQuery = [...query, ...popQuery]
    //loop the previous query and reset values if prev query field isn't in new query
    for (let pq of prevQuery) {
      let popData = pq.match ? pq : {}
      pq = pq.match || pq
      let [field, value, operator] = pq
      field = popData.popId || field
      if (comibinedQuery.filter(q=>q[0] === field || q.popId === field).length === 0) {
        operator && this.setState({ selects: { ...this.state.selects, [field + "Select"]: '=' } })
        this.props.form.setFieldsValue({ [field]: undefined })
      }
    }
    
    // loop the combined query and update the fields
    for (let q of comibinedQuery) {
      let popData = q.match ? q : {}
      q = q.match || q
      let [field, value, operator] = q
      field = popData.popId || field
      operator && this.setState({ selects: { ...this.state.selects, [field + "Select"]: operator } })
      value = Array.isArray(value) ? value.map(d => moment(d)) : value
      this.props.form.setFieldsValue({ [popData.popId || field]: value })
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let inputs = this.props.inputs.map(i => {
      const id = i.nestedKey ? i.id + i.nestedKey : i.id
      const selectBefore = (
        <Select key={`${id}Select`} value={this.state.selects[id+"Select"] || "="} onChange={this.handleSelect} showArrow={false} className="number-input pre-select">
          <Option id={`${id}Select`} iref={id} className="center-a" value="=">=</Option>
          <Option id={`${id}Select`} iref={id} className="center-a" value="gt">{'>'}</Option>
          <Option id={`${id}Select`} iref={id} className="center-a" value="gte">{'≥'}</Option>
          <Option id={`${id}Select`} iref={id} className="center-a" value="lt">{'<'}</Option>
          <Option id={`${id}Select`} iref={id} className="center-a" value="lte">{'≤'}</Option>
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
                  addonAfter={this.props.form.getFieldValue(id) ? <Icon onClick={() => this.handleClear(id)} type="close-circle" theme="filled" /> : null}
                  onBlur={this.handleSubmit}
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
                <RangePicker key={id} onChange={(a,b)=>this.handleDateSelect(a,b,id)} />
              )}
            </FormItem>
          </Col>
        )
      } else if (i.type === 'select') {
        return (
          <Col xs={i.span * 3} sm={i.span} key={id}>
            <FormItem label={`${i.text}`}>
              {getFieldDecorator(id, {
              })(
                <Select placeholder={i.text} allowClear onChange={(value)=>this.props.form.setFieldsValue({[id]: value}) || this.handleSubmit()} key={`${id}Select`}>
                  {i.options.map(val => (
                    <Option key={id + val.id + "Select"} value={val.id}>{val.text || val.id}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        )
      } else {
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
                  suffix={<Icon style={{...!this.props.form.getFieldValue(id) && {display: 'none'}}} onClick={()=>this.handleClear(id)} type="close-circle" theme="filled" />}
                  placeholder={i.text}
                  onBlur={this.handleSubmit}
                />
              )}
            </FormItem>
          </Col>
        )
      }
    })
    return (
      <div onKeyDown={(e)=>e.key === 'Enter' && this.handleSubmit()}>
        <Form
          onSubmit={this.handleSubmit}
        >
          <Row gutter={0}>{inputs}</Row>
        </Form>
      </div>
    );
  }
}

const SearchForm = Form.create()(BasicSearchForm);
export default SearchForm