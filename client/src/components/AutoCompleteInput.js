import React, { Component } from 'react';
import { AutoComplete, Select, Avatar, Form, Skeleton } from 'antd';
import { getAllModelDocuments } from '../store/actions/models';
import { connect } from "react-redux";

const Option = Select.Option;

class AutoCompleteInputForm extends Component {
  _isMounted = false 
  constructor(props) {
    super(props)
    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this._isMounted = true;
    this.handleDataFetch('')
    if (this.props.selected) {
      const selected = this.props.selected.map(item=>({key:item._id, label: item[this.props.searchKey]}))
      this.props.form.setFieldsValue(({ selected, data: this.props.selected }));
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleDataFetch = async (value) => {
    const searchKey = this.props.searchKey;
    this.setState({loading: true})
    await getAllModelDocuments(this.props.queryModel,{[searchKey]: value},this.props.currentUser.user.company, true, 15)
    .then((res)=>{
      //remove duplicates based on searchKey if in tags mode
      let data =
        this.props.mode === "tags"
          ? res.data.filter(function (a) {
            return !this[a[searchKey]] && (this[a[searchKey]] = true);
          }, Object.create(null))
          : res.data;
      this._isMounted && this.setState({data})
    })
    .catch(err=>{
      console.log(err)
    })
    this._isMounted && this.setState({ loading: false });
  }

  handleChange = (id,e) => {
    console.log({id,e})
    if (!id) {
      this.props.onUpdate({ id: '', data: {} })
      return
    }
    if (id.length === 0) {
      this.props.onUpdate({id:'', data:{}})
      return
    }
    let data = Array.isArray(e) ? e.map(d=>({...d.props.data})) : e.props.data
    id = Array.isArray(id) ? id.map(i=>({id:i.key})) : id
    this.props.onUpdate({id,data})
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const children = this.state.data.map(item => (
      // use item._id as value if not in tags mode
      <Option key={item._id} value={this.props.mode === 'tags' ? item[this.props.searchKey] : item._id} data={{ ...item }}>
        {this.props.renderOption ? this.props.renderOption(item) 
        : item[this.props.searchKey]}
      </Option>
    ));
    return (
      getFieldDecorator("selected")(
        <Select
          allowClear
          style={{ minWidth: 250 }}
          showSearch
          showArrow
          placeholder={this.props.placeholder}
          notFoundContent={this.state.loading ? <Skeleton active loading paragraph={false} /> : this.props.notFound || null}
          filterOption={false}
          onSearch={this.handleDataFetch}
          onChange={this.handleChange}
          mode={this.props.mode || "default"}
          labelInValue
          ref={node => (this.selectRef = node)}
        >
          {children}
        </Select>
      )
    );
  }
}

const AutoCompleteInput = Form.create()(AutoCompleteInputForm);

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors
  };
}


export default connect(mapStateToProps, {})(AutoCompleteInput);