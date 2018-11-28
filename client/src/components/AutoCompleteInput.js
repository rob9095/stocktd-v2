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
    getAllModelDocuments(this.props.queryModel,{sku: value},this.props.currentUser.company, true)
    .then((res)=>{
      let data = res.data.map(p => (p.sku)).filter((p,i)=>i<=4)
      this.setState({
        data,
      })
    })
    .catch(err=>{
      console.log(err)
    })
  }

  render() {
    const { data } = this.state;
    return (
      <AutoComplete
        dataSource={data}
        onSelect={onSelect}
        onSearch={this.handleDataFetch}
        placeholder="SKU"
      />
    );
  }
}

export default AutoCompleteInput;