import React, { Component } from 'react';
import { AutoComplete } from 'antd';
import { getAllModelDocuments } from '../store/actions/models';

function onSelect(value) {
  console.log('onSelect', value);
}

class AutoCompleteInput extends Component {
  state = {
    data: [],
  }

  handleDataFetch = (value) => {
    getAllModelDocuments(this.props.queryModel,{[this.props.id]: value},this.props.currentUser.company, true, 5)
    .then((res)=>{
      let data = res.data.map(p => (p[this.props.id]))
      this.setState({
        data,
      })
    })
    .catch(err=>{
      console.log(err)
    })
  }

  handleChange = (value) => {
    this.props.onUpdate(value,this.props.key)
  }

  render() {
    const { data } = this.state;
    return (
      <AutoComplete
        dataSource={data}
        onSelect={onSelect}
        onSearch={this.handleDataFetch}
        placeholder={this.props.placeholder}
        onChange={this.handleChange}
      />
    );
  }
}

export default AutoCompleteInput;