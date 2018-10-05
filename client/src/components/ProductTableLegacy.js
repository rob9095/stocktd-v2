import React, { Component } from 'react';
import { Table, Row, Col } from 'antd';

class ProductTableLegacy extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'Actions',
        align: 'center',
        key: 'actions',
        width: 250,
      },
    ]
    this.state = {
      data: []
    }
  }


  render() {
    return (
      <Row>
        <Col span={24}>
            <div className="stkd-content contain no-pad product-table">
              <Table {...this.state} columns={this.columns} dataSource={this.state.data} />
            </div>
        </Col>
      </Row>
    );
  }
}

export default ProductTableLegacy
