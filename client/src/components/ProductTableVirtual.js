import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchAllProducts, updateProducts, deleteProducts } from '../store/actions/products';
import 'react-virtualized/styles.css'; // only needs to be imported once

class ProductTableVirtual extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      rowsPerPage: 1000,
      activePage: 1,
      totalPages: 0,
      skip: 0,
      products: [],
      selected: [],
      selectAll: false,
      column: 'sku',
      direction: 'ascending',
      query: [],
      showImport: false,
      showFilters: false,
      showBulkMenu: false,
      showDisplayOptions: false,
      showEditProductModal: false,
      showConfirmModal: false,
      confirmItems: [],
      confirmType: '',
      message: {
        open: false,
        type: '',
        header: '',
        list: [],
      }
    }
  }

  handleProductDataFetch = (requestedPage,requestedRowsPerPage) => {
    this.setState({
      isLoading: true,
    })
    return new Promise((resolve,reject)=>{
      this.props.fetchAllProducts(this.state.query,this.state.column, this.state.direction, requestedPage, requestedRowsPerPage, this.props.currentUser.user.company)
      .then(({products, activePage, totalPages, rowsPerPage, skip})=>{
        this.setState({
          isLoading: false,
          dataPage: 1,
          skip,
          products: products.map(p => ({
            ...p,
            checkbox: (<input type="checkbox" />),
          })),
          activePage,
          totalPages,
          rowsPerPage,
        })
        console.log(this.state)
        resolve();
      })
      .catch(err=>{
        this.setState({
          isLoading: false,
        })
        console.log(err)
        reject();
      })
    })
  }

  componentDidMount() {
    this.handleProductDataFetch(this.state.activePage,this.state.rowsPerPage)
  }

  render() {
    if (this.state.isLoading) {
      return (
        <span>loading...</span>
      )
    }
    let rows = this.state.products.map(p=>(
      <tr key={p._id}>
        <td>{p.sku}</td>
        <td>{p.title}</td>
        <td><input type="checkbox" /></td>
      </tr>
    ))
    return(
      <table>
        <tbody>
          <tr>
            <th>SKU</th>
            <th>Title</th>
            <th>Select</th>
          </tr>
          {rows}
        </tbody>
      </table>
    )
  }
}

function mapStateToProps(state) {
 return {
   currentUser: state.currentUser,
   errors: state.errors,
 };
}

export default connect(mapStateToProps, {fetchAllProducts, updateProducts, deleteProducts})(ProductTableVirtual);
