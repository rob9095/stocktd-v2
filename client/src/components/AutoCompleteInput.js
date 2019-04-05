import React, { Component } from 'react';
import { AutoComplete, Select, Avatar } from 'antd';
import { getAllModelDocuments } from '../store/actions/models';
import { connect } from "react-redux";

const Option = Select.Option;

class AutoCompleteInput extends Component {
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
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleDataFetch = (value) => {
    getAllModelDocuments(this.props.queryModel,{[this.props.searchKey]: value},this.props.currentUser.user.company, true, 5)
    .then((res)=>{
      let data = res.data
      this._isMounted && this.setState({data})
    })
    .catch(err=>{
      console.log(err)
    })
  }

  handleChange = (value,e) => {
    console.log({value,e})
    this.props.onUpdate({value,data: e.props.data})
  }

  render() {
    // const { data } = this.state;
    // return (
    //   <AutoComplete
    //     dataSource={data}
    //     onSelect={onSelect}
    //     onSearch={this.handleDataFetch}
    //     placeholder={this.props.placeholder}
    //     onChange={this.handleChange}
    //   />
    const children = this.state.data.map(item => (
      <Option
        key={item._id}
        value={item[this.props.searchKey]}
        data={{ ...item }}
      >
        <span>{item[this.props.searchKey]}</span>
      </Option>
    ));
    return (
      <Select
        style={{ minWidth: 250 }}
        showSearch
        placeholder={this.props.placeholder}
        notFoundContent={this.props.notFound || null}
        filterOption={false}
        onSearch={this.handleDataFetch}
        onChange={this.handleChange}
        onSelect={this.handleChange}
      >
        {children}
      </Select>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors
  };
}


export default connect(mapStateToProps, {})(AutoCompleteInput);