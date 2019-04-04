import React, { Component } from 'react';
import AutoCompleteInput from './AutoCompleteInput';

class ReceiveInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {}
    };
  }

  handleAutoUpdate = (value, id) => {
    this.setState({
      values: {
        ...this.state.values,
        [id]: value
      }
    });
  };

  render() {
    return (
      <div className="stkd-content">
        <AutoCompleteInput
          queryModel={"PurchaseOrder"}
          id={"name"}
          placeholder={"Search by PO Name"}
          onUpdate={val => this.handleAutoUpdate(val,'poName')}
        />
      </div>
    );
  }
}

export default ReceiveInventory