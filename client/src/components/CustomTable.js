import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchAllProducts, updateProducts, deleteProducts } from '../store/actions/products';
import { Pagination, Divider, Icon, Spin, Form, Switch } from 'antd';
import WrappedProductSearchForm from './ProductSearchForm';

const FormItem = Form.Item;

class CustomTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      rowsPerPage: 100,
      activePage: 1,
      totalPages: 0,
      skip: 0,
      data: [],
      selected: [],
      selectAll: false,
      column: 'sku',
      direction: 'ascending',
      query: [],
      showFilters: false,
      headers: [
        {id: 'select-all', text: '', width: 75, noSort: true},
        {id: 'sku', text: 'SKU', width: 175, span: 8},
        {id: 'title', text: 'Title', width: 800, span: 8},
        {id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 4},
        {id: 'quantityToShip', text: 'To Ship', width: 175, type: 'number', span: 4},
        {id: 'price', text: 'Price', width: 75, type: 'number', span: 4},
        {id: 'weight', text: 'Weight', width: 75, type: 'number', span: 4},
        {id: 'brand', text: 'Brand', width: 100, span: 8},
        {id: 'supplier', text: 'Supplier', width: 100, span: 8},
        {id: 'actions', text: 'Actions', width: 100, noSort: true},
      ],
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
          this.handleDataFetch(page, pageSize)
        },
        onShowSizeChange: (page, pageSize) => {
          this.handleDataFetch(page, pageSize)
        },
      },
    }
  }

  handleDataFetch = (requestedPage, requestedRowsPerPage) => {
    this.setState({
      loading: true,
    })
    requestedPage === undefined ? requestedPage = this.state.activePage : null;
    requestedRowsPerPage === undefined ? requestedRowsPerPage = this.state.rowsPerPage : null;
    this.props.fetchAllProducts(this.state.query,this.state.column, this.state.direction, requestedPage, requestedRowsPerPage, this.props.currentUser.user.company)
    .then(({products, activePage, totalPages, rowsPerPage, skip})=>{
      this.setState({
        loading: false,
        skip,
        data: products,
        activePage,
        totalPages,
        rowsPerPage,
        pagination: {
          ...this.state.pagination,
          current: activePage,
          total: rowsPerPage * totalPages,
          pageSize: rowsPerPage,
        },
      })
    })
    .catch(err=>{
      this.setState({
        loading: false,
      })
      console.log(err)
    })
  }
    componentDidMount() {
      this.handleDataFetch();
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

    isSelected = id => this.state.selected.indexOf(id) != -1;

    handleSelectAllClick = () => {
      if (!this.state.selectAll) {
        this.setState({ selected: this.state.data.map(p => p._id), selectAll: true, });
        return
      }
      this.setState({ selected: [], selectAll: false, });
    };

    handleRowEdit = (e) => {
      console.log(e.target.id)
    }

    handleActionMenuClick = (e) => {
      console.log(e.target.id)
    }

    toggle = (prop) => {
      return () => {
        this.setState({
          [prop]: !this.state[prop],
        })
      }
    }

    handleSort = async (e) => {
      let clickedCol = e.target.id;
      const { column, direction } = this.state
      if (clickedCol === '') {
        clickedCol = this.state.column
      }
      if (column !== clickedCol) {
        await this.setState({
          column: clickedCol,
          direction: 'ascending',
        })
        this.handleDataFetch()
        return
      }
      await this.setState({
        direction: direction === 'ascending' ? 'descending' : 'ascending',
      })
      this.handleDataFetch()
    }

    handleFilterSearch = async (query) => {
      await this.setState({
        query,
      })
      this.handleDataFetch()
    }

    render() {
      let headers = this.state.headers.map((h,i) => {
        if (i === 0) {
          return (
            <th key="select-all" id="select-all" width="100" className="ant-table-selection-column">
              <input onChange={this.handleSelectAllClick} checked={this.state.selectAll} type="checkbox" />
            </th>
          )
        } else if (h.noSort) {
          return (
            <th key={h.id} id={h.id} width={h.width}>
              {h.text}
            </th>
          )
        } else {
          return (
            <th key={h.id} id={h.id} width={h.width} onClick={this.handleSort} className="stkd-table header">
              <span id={h.id} onClick={this.handleSort}>
                {h.text}
                {this.state.column === h.id && (
                  <Icon
                    onClick={this.handleSort}
                    id={h.id}
                    type={this.state.direction === 'ascending' ? 'caret-down' : 'caret-up'}
                    className="sort-icon primary-color"
                  />
                )}
              </span>
            </th>
          )
        }
      })
      let rows = this.state.data.map(p => {
      const isSelected = this.isSelected(p._id);
      return (
        <tr className="ant-table-row"
          key={p._id}
          >
          <td className="ant-table-selection-column">
            <input
              type="checkbox"
              onChange={event => this.handleRowCheck(event, p._id)}
              checked={isSelected}
            />
          </td>
          <td className="no-wrap">{p.sku}</td>
          <td className="lg-cell">{p.title}</td>
          <td className="stkd-td no-wrap">{p.quantity}</td>
          <td className="stkd-td no-wrap">{p.quantityToShip}</td>
          <td className="stkd-td no-wrap">{p.price}</td>
          <td className="stkd-td no-wrap">{p.weight}</td>
          <td className="stkd-td">{p.brand}</td>
          <td className="stkd-td">{p.supplier}</td>
          <td className="stkd-td actions center-a no-wrap">
            <span>
              <a id={p._id} onClick={this.handleRowEdit}>Edit</a>
              <Divider type="vertical" />
              <a id={p._id} onClick={this.handleActionMenuClick} className="ant-dropdown-link">
                <Icon type="down" />
              </a>
            </span>
          </td>
        </tr>
      )
    })
      return(
        <div>
          <Form layout="inline">
            <FormItem label="Filters">
              <Switch checked={this.state.showFilters} onChange={this.toggle('showFilters')} />
            </FormItem>
          </Form>
          {this.state.showFilters && (
            <WrappedProductSearchForm
              inputs={this.state.headers.filter(h=>h.noSort !== true)}
              onFilterSearch={this.handleFilterSearch}
            />
          )}
          <div className="ant-table stkd-content no-pad contain">
            <Spin spinning={this.state.loading}>
              <Pagination className="ant-table-pagination" {...this.state.pagination} />
                <table>
                  <thead className="ant-table-thead">
                    <tr>
                      {headers}
                    </tr>
                  </thead>
                  <tbody className="ant-table-tbody">
                    {rows}
                  </tbody>
                </table>
            </Spin>
          </div>
        </div>
      )
    }
  }

  function mapStateToProps(state) {
   return {
     currentUser: state.currentUser,
     errors: state.errors,
   };
  }

  export default connect(mapStateToProps, {fetchAllProducts})(CustomTable);
