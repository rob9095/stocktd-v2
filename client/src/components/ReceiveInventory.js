import React, { Component } from 'react';
import AutoCompleteInput from './AutoCompleteInput';
import WrappedScanForm from './ScanForm';
import { Button, Form, Badge } from 'antd'
import { connect } from "react-redux";
import { addBoxScan } from "../store/actions/boxScans";

const FormItem = Form.Item;


class ReceiveInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {}
    };
  }

  handleAutoUpdate = (clicked, id) => {
    this.setState({
      values: {
        ...this.state.values,
        [id]: {...clicked.data}
      }
    });
  };

  handleScan = (scan) => {
    return new Promise((resolve, reject) => {
      scan = {
        ...scan,
        user: this.props.currentUser.user.id,
        scanToPo: true,
      };
      this.props.addBoxScan(scan, [this.state.values.currentPO || {}], this.props.currentUser.user.company)
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          reject(err);
        })
    })
  }

  render() {
    return (
      <div className="stkd-content">
        <FormItem key={"currentPo"} label={"Purchase Order (Optional)"}>
          <AutoCompleteInput
            queryModel={"PurchaseOrder"}
            searchKey={"name"}
            placeholder={"Search by PO Name"}
            renderOption={item => (
              <div style={{maxHeight: 40, overflow: 'hidden'}}>
                <div style={{fontSize: "small"}}>{item["name"]}</div>
                <div style={{fontSize: 9, color: 'grey'}}>{item["type"]}</div>
              </div>
            )}
            onUpdate={clicked =>
              this.handleAutoUpdate(clicked, "currentPO")
            }
          />
        </FormItem>
        <WrappedScanForm
          currentPOs={[this.state.currentPO]}
          requirePo={false}
          onScan={this.handleScan}
        />
        <Button
          onClick={() => console.log(this.state.values.currentPO.data)}
        />
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors
  };
}

export default connect(mapStateToProps, {addBoxScan})(ReceiveInventory);