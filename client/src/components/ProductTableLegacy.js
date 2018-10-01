import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchAllProducts, updateProducts, deleteProducts } from '../store/actions/products';
import { Checkbox, Table, Icon, Switch, Radio, Form, Divider, Row, Col, Pagination } from 'antd';

const FormItem = Form.Item;
const showHeader = true;
const scroll = { y: 240 };

class ProductTableLegacy extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: '',
        key: 'select',
        dataIndex: null,
        width: 100,
        render: (text, record) => ({
          props: {

          },
          children: <Checkbox
            onClick={event => this.handleRowCheck(event, record._id)}
            checked={this.isSelected(record._id)}
          />
        })
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: 175,
        defaultSortOrder: 'ascend',
        sorter: (a, b) => a - b,
        render: (text, record) => ({
          props: {
            className: "no-wrap",
          },
          children: text,
        }),
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 800,
        sorter: (a, b) => a - b,
        render: (text, record) => ({
          props: {
            className: "lg-cell",
          },
          children: text,
        }),
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 175,
        sorter: (a, b) => a - b,
      },
      {
        title: 'To Ship',
        dataIndex: 'quantityToShip',
        key: 'quantityToShip',
        width: 175,
        sorter: (a, b) => a - b,
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        width: 75,
        sorter: (a, b) => a - b,
      },
      {
        title: 'Weight',
        dataIndex: 'weight',
        key: 'weight',
        width: 75,
        sorter: (a, b) => a - b,
      },
      {
        title: 'Brand',
        dataIndex: 'brand',
        key: 'brand',
        width: 100,
        sorter: (a, b) => a - b,
      },
      {
        title: 'Supplier',
        dataIndex: 'supplier',
        key: 'supplier',
        width: 100,
        sorter: (a, b) => a - b,
      },
      {
        title: 'Actions',
        align: 'center',
        key: 'actions',
        width: 250,
        render: (text, record) => ({
          props: {
            className: "no-wrap",
          },
          children: (
            <span>
              <a id={record._id} onClick={this.handleRowEdit}>Edit</a>
              <Divider type="vertical" />
              <a href="javascript:;" className="ant-dropdown-link">
                <Icon type="down" />
              </a>
            </span>
          ),
        }
        ),
      },
    ]
    this.state = {
      skip: 0,
      data: [],
      selected: [],
      selectedRowKeys: [],
      column: 'sku',
      direction: 'ascending',
      query: [],
      bordered: false,
      loading: false,
      pagination: {
        position: 'bottom',
        current: 1,
        total: 0,
        defaultPageSize: 10,
        pageSize: 10,
        hideOnSinglePage: true,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10','50','100','250','500'],
        size: 'small',
        onChange: (page, pageSize) => {
          this.handleProductDataFetch(page, pageSize)
        },
        onShowSizeChange: (page, pageSize) => {
          this.handleProductDataFetch(page, pageSize)
        },
      },
      size: 'default',
      showHeader,
      scroll: undefined,
    }
  }

  handleRowCheck = (e, id) => {
    let selected = this.state.selected;
    if (this.state.selected.indexOf(id) != -1) {
      selected = this.state.selected.filter(s => s !== id)
    } else {
      selected.push(id)
    }
    this.setState({ selected });
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  handleProductDataFetch = (requestedPage,requestedRowsPerPage) => {
    this.setState({
      loading: true,
    })
    return new Promise((resolve,reject)=>{
      this.props.fetchAllProducts(this.state.query, this.state.column, this.state.direction, requestedPage, requestedRowsPerPage, this.props.currentUser.user.company)
      .then(({products, activePage, totalPages, rowsPerPage, skip})=>{
        this.setState({
          loading: false,
          dataPage: 1,
          skip,
          data: products.map(p=>({...p,key: p._id,})),
          pagination: {
            ...this.state.pagination,
            current: activePage,
            total: rowsPerPage * totalPages,
            pageSize: rowsPerPage,
          }
        })
        resolve();
      })
      .catch(err=>{
        this.setState({
          loading: false,
        })
        console.log(err)
        reject();
      })
    })
  }

  handleChange = async (pagination, filters, sorter) => {
    await this.setState({
      column: sorter.column ? sorter.column.key : this.state.column,
      direction: sorter.column ? `${sorter.order}ing` : this.state.direction,
    })
    sorter.column ? this.handleProductDataFetch(pagination.current, pagination.pageSize) : null
  }

  componentDidMount() {
    this.handleProductDataFetch(this.state.pagination.current,this.state.pagination.pageSize)
  }

  handleRowEdit = (e) => {
    console.log(e.target.id)
  }

  handleToggle = (prop) => {
    return (enable) => {
      this.setState({ [prop]: enable });
    };
  }

  handleSizeChange = (e) => {
    this.setState({ size: e.target.value });
  }

  handleHeaderChange = (enable) => {
    this.setState({ showHeader: enable ? showHeader : false });
  }

  handleScollChange = (enable) => {
    this.setState({ scroll: enable ? scroll : undefined });
  }

  handlePaginationChange = (e) => {
    const { value } = e.target;
    this.setState({
      pagination: value === 'none' ? false : { position: value },
    });
  }

  onSelectChange = async (selectedRowKeys) => {
    await this.setState({ selectedRowKeys });
  }

  render() {
    const state = this.state;
    const rowSelection = {
      selectedRowKeys: state.selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <Row>
        <Col span={24}>
          <div>
            <div className="components-table-demo-control-bar">
              <Form layout="inline">
                <FormItem label="Bordered">
                  <Switch checked={state.bordered} onChange={this.handleToggle('bordered')} />
                </FormItem>
                <FormItem label="Column Header">
                  <Switch checked={!!state.showHeader} onChange={this.handleHeaderChange} />
                </FormItem>
                <FormItem label="Fixed Header">
                  <Switch checked={!!state.scroll} onChange={this.handleScollChange} />
                </FormItem>
                <FormItem label="Size">
                  <Radio.Group size="default" value={state.size} onChange={this.handleSizeChange}>
                    <Radio.Button value="default">Default</Radio.Button>
                    <Radio.Button value="middle">Middle</Radio.Button>
                    <Radio.Button value="small">Small</Radio.Button>
                  </Radio.Group>
                </FormItem>
                <FormItem label="Pagination">
                  <Radio.Group
                    value={state.pagination ? state.pagination.position : 'none'}
                    onChange={this.handlePaginationChange}
                  >
                    <Radio.Button value="top">Top</Radio.Button>
                    <Radio.Button value="bottom">Bottom</Radio.Button>
                    <Radio.Button value="both">Both</Radio.Button>
                    <Radio.Button value="none">None</Radio.Button>
                  </Radio.Group>
                </FormItem>
              </Form>
            </div>
            <div className="stkd-content contain no-pad product-table">
              <Table rowSelection={rowSelection} {...this.state} onChange={this.handleChange} columns={this.columns} dataSource={state.data} />
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
 return {
   currentUser: state.currentUser,
   errors: state.errors,
 };
}

export default connect(mapStateToProps, {fetchAllProducts, updateProducts, deleteProducts})(ProductTableLegacy);
