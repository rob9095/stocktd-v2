import React, { Component } from 'react';
import { AutoComplete, Select, Avatar, Skeleton } from 'antd';
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

  handleDataFetch = async (value) => {
    this.setState({loading: true})
    await getAllModelDocuments(this.props.queryModel,{[this.props.searchKey]: value},this.props.currentUser.user.company, true, 15)
    .then((res)=>{
      let data = res.data
      this._isMounted && this.setState({data})
    })
    .catch(err=>{
      console.log(err)
    })
    this.setState({loading: false})
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
    let data = Array.isArray(e) ? e[0].props.data : e.props.data
    id = Array.isArray(id) ? id[0] : id
    this.props.onUpdate({id,data})
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
        value={item._id}
        data={{ ...item }}
      >
        <span>{item[this.props.searchKey]}</span>
      </Option>
    ));
    return (
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