import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchAllProducts, updateProducts, importProducts } from '../store/actions/products';
import { queryModelData, deleteModelDocuments } from '../store/actions/models';
import { upsertModelDocuments } from '../store/actions/models';
import { Button, Pagination, Divider, Icon, Spin, Form, Dropdown, Menu, Modal, message, Row, Col, Skeleton, Input } from 'antd';
import WrappedFilterForm from './FilterForm';
import EditItemDrawer from './EditItemDrawer';
import ImportModal from './ImportModal';
import AutoCompleteInput from './AutoCompleteInput';

const confirm = Modal.confirm;
const FormItem = Form.Item;

class ProductTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadingRows: [],
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
      showEditItemDrawer: false,
      showCreateItemDrawer: false,
      itemDrawerProduct: {},
      showImportModal: false,
      populateArray: [],
      hiddenCols: ['supplier'],
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
        onChange: (requestedPage, requestedRowsPerPage) => {
          this.handleDataFetch({requestedPage, requestedRowsPerPage})
        },
        onShowSizeChange: (requestedPage, requestedRowsPerPage) => {
          this.handleDataFetch({requestedPage, requestedRowsPerPage})
        },
      },
    }
  }

  handleDataFetch = async (config) => {
    let { requestedPage, requestedRowsPerPage, rowIds } = config || {}
    let rowId = Array.isArray(rowIds) ? rowIds[0] : null
    await this.setState({
      ...rowId ? { loadingRows: [...rowIds] } : {loading: true}
    })
    console.log({loadingRows: this.state.loadingRows, loading: this.state.loading})
    requestedPage = requestedPage || this.state.activePage;
    requestedRowsPerPage = requestedRowsPerPage || this.state.rowsPerPage;
    let populateArray = this.props.populateArray.map(pC => {
      const foundPc = this.state.populateArray.find(p => p.path === pC.path)
      if (foundPc) {
        return ({
          ...foundPc
        })
      } else {
        return({...pC})
      }
    })
    await this.props.queryModelData(this.props.queryModel,this.state.query,this.state.column, this.state.direction, requestedPage, requestedRowsPerPage,this.props.currentUser.user.company,populateArray)
    .then(({data, activePage, totalPages, rowsPerPage, skip})=>{
      this.setState({
        skip,
        data,
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
      console.log(err)
    })
      await this.setState({
        ...rowId ? { loadingRows: [] } : { loading: false }
      })
      console.log({
        loadingRows: this.state.loadingRows,
        loading: this.state.loading
      });
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

    handleRowEdit = async (e) => {
      let itemDrawerProduct = this.state.data.find(p=>p._id === e.target.id)
      this.setState({
        showEditItemDrawer: true,
        itemDrawerProduct,
      })
      console.log(e.target.id)
    }

    showConfirm(title, action, items) {
      return new Promise((resolve,reject) => {
        const end = items.length > 1 ? 'items?' : 'item?';
        const content = `${action} ${items.length} ${end}`;
        confirm({
          okText: 'Yes',
          okType: 'primary',
          title: title === null ? content : title,
          content: title !== null ? content : null,
          onOk() {
            resolve(items);
          },
          onCancel() {
            resolve('cancel')
          },
        });
      })
    }

    handleActionMenuClick = async ({ item, key, keyPath }) => {
      console.log(item.props.children.props.name)
      // switch(item.props.children.props.name) {
      //   case 'delete':
      //     let items = await this.showConfirm(null,'Delete',[item.props.children.props.id])
      //     if (items !== 'cancel') {
      //       this.handleProductDelete(items)
      //     }
      //     break;
      //   default:
      //     console.log('unknown menu option');
      // }
    }

    handleBulkMenuClick = async ({ item, key, keyPath }) => {
      console.log(key)
      // switch(key) {
      //   case 'delete':
      //     let items = await this.showConfirm(null,'Delete',this.state.selected)
      //     if (items !== 'cancel') {
      //       this.handleProductDelete(items)
      //     }
      //     break;
      //   default:
      //     console.log('unknown menu option');
      // }
    }

    handleOptionsMenuClick = async ({ item, key, keyPath }) => {
      switch(key) {
        case 'add':
        this.setState({
          showCreateItemDrawer: true,
        })
          break;
        case 'import':
        this.setState({
          showImportModal: true,
        })
          break;
        default:
          console.log('unknown menu option');
      }
    }

    toggle = (prop) => {
      return () => {
        this.setState({
          [prop]: !this.state[prop],
        })
      }
    }

    handleMessage = (type,text) => {
      message[type](text)
    }

    handleProductDelete = (ids) => {
       let data = this.state.data.filter(p=>ids.indexOf(p._id) === -1)
       let selected = this.state.selected.filter(id=>ids.indexOf(id) === -1)
       const end = ids.length > 1 ? 's' : ''
       this.props.deleteModelDocuments('Product',ids,this.props.currentUser)
       .then(res=>{
         this.handleMessage('success',`Product${end} Deleted Successfully`)
         this.setState({
           data,
           selected,
         })
       })
       .catch(err=>{
         this.handleMessage('error',err)
       })
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

    handleProductUpdate = (updates, id) => {
      return new Promise((resolve,reject) => {
        let data = this.state.data.map(p=>{
          let update = updates.find(u=>u.id === p._id)
          if (update) {
            return {
              ...p,
              ...update,
            }
          } else {
            return {
              ...p,
            }
          }
        })
        this.props.updateProducts(updates, this.props.currentUser)
        .then((res)=>{
          this.setState({
            data,
            itemDrawerProduct: id ? {...data.find(i=>i._id === id)} : this.state.itemDrawerProduct,
          })
          resolve(res)
        })
        .catch(error=>{
          reject(error)
        })
      })
    }

    handleProductImport = (json) => {
      return new Promise((resolve,reject) => {
        this.props.importProducts(json, this.props.currentUser)
        .then(res=>{
          resolve(res)
        })
        .catch(err=>{
          reject(err)
        })
      })
    }

    handleFilterSearch = async (query,populateArray) => {
      await this.setState({
        query,
        populateArray
      });
      this.handleDataFetch()
    }

    handleAutoCompleteUpdate = async (data) => {
      this.setState({
        loadingRows: [...this.state.loadingRows, data.rowId]
      })
      let refUpdates = data.refModel && [{
        _id: data.rowId,
        filterRef: '_id',
        ref: data.colId,
        refArray: true,
      }]
      // clicked.id and clicked.data are not an array when select is empty
      let update = Array.isArray(data.clicked.id) ? data.clicked.id.map(val => ({ [data.nestedKey]: val.id })) : []
      await upsertModelDocuments(data.queryModel, update, this.props.currentUser.user.company, data.nestedKey, refUpdates, data.refModel)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
      this.handleDataFetch({ rowIds: [data.rowId] });
    }

    render() {
      const bulkMenu = this.props.bulkMenuOptions && (
        <Menu onClick={this.handleBulkMenuClick}>
          {this.props.bulkMenuOptions.map(o=>(
            <Menu.Item name={o.name} key={o.key}>{o.name}</Menu.Item>
          ))}
        </Menu>
      );
      const tableMenuOptions = this.props.tableMenuOptions  && (
        <Menu onClick={this.handleOptionsMenuClick}>
          {this.props.tableMenuOptions.map(o=>(
            <Menu.Item name={o.name} key={o.key}>{o.name}</Menu.Item>
          ))}
        </Menu>
      );
      let headers = this.props.headers.filter(h=>this.state.hiddenCols.indexOf(h.id) === -1).map((h,i) => {
        if (i === 0 && h.id=== 'select-all') {
          return (
            <th key="select-all" id="select-all" width="100" className="ant-table-selection-column">
              <label className="container">
                <input
                  className="ant-checkbox-input" onChange={this.handleSelectAllClick} checked={this.state.selectAll} type="checkbox"
                />
                <span className="checkmark"></span>
              </label>
            </th>
          )
        } else if (h.noSort) {
          return (
            <th key={h.id+h.nestedKey || i} id={h.id} width={h.width}>
              {h.text}
            </th>
          )
        } else {
          return (
            <th key={h.id+h.nestedKey || i} id={h.id} width={h.width} onClick={this.handleSort} className="stkd-table header">
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
      let rows = this.state.data.map((r,i) => {
      const isSelected = this.isSelected(r._id);
      let activeColumns = this.props.headers.filter(h=>this.state.hiddenCols.indexOf(h.id) === -1).map(col=>{
        if (col.id === 'select-all') {
          return (
            <td key={`${r._id}-select-all`} className="ant-table-selection-column">
              <Skeleton paragraph={false} loading={this.state.loading || this.state.loadingRows.includes(r._id)} active>
                <label className="container">
                  <input
                    type="checkbox"
                    onChange={event => this.handleRowCheck(event, r._id)}
                    checked={isSelected}
                  />
                  <span className="checkmark"></span>
                </label>
              </Skeleton>
            </td>
          )
        }
        if (col.id === 'actions' && Array.isArray(col.actionOptions)) {
          const menu = (
            <Menu key={`${r._id}-action-menu`} onClick={this.handleActionMenuClick}>
              {col.actionOptions.map(o=>(
                <Menu.Item key={`${r._id}-action-menu-option-${o.name}`}>
                  <a id={r._id} name={o.name}>{o.name}</a>
                </Menu.Item>
              ))}
            </Menu>
          )
          return (
            <td key={`${r._id}-${col.id}`} className="stkd-td actions center-a no-wrap">
              <Skeleton paragraph={false} loading={this.state.loading || this.state.loadingRows.includes(r._id)} active>
                <span>
                  <a id={r._id} onClick={this.handleRowEdit}>Edit</a>
                  <Divider type="vertical" />
                  <Dropdown overlay={menu}>
                    <a className="ant-dropdown-link"><Icon type="down" /></a>
                  </Dropdown>
                </span>
              </Skeleton>
            </td>
          )
        }
        if (Array.isArray(r[col.id])) {
          return (
            <td key={`${r._id}-${col.id}`} className="stkd-td actions center-a no-wrap">
              <Skeleton paragraph={false} loading={this.state.loading || this.state.loadingRows.includes(r._id)} active>
                <AutoCompleteInput
                  key={`${r._id}-${col.id}-auto-complete`}
                  queryModel={col.queryModel}
                  searchKey={col.nestedKey}
                  placeholder={col.text}
                  mode={"tags"}
                  onUpdate={(clicked) => this.handleAutoCompleteUpdate({ rowId: r._id, clicked, ...col, colId: col.id })}
                  skipSelectedCallback={true}
                  selected={r[col.id]}
                >
                  <Input style={{ display: "none" }} />
                </AutoCompleteInput>
              </Skeleton>
            </td>
          )
        }
        return (
          <td key={`${r._id}-${col.id}-${col.nestedKey || i}`} className={col.className}>
            <Skeleton paragraph={false} loading={this.state.loading || this.state.loadingRows.includes(r._id)} active>
              {col.nestedKey && r[col.id] ? r[col.id][col.nestedKey] : r[col.id]}
            </Skeleton>
          </td>
        )
      })
      return (
        <tr className="ant-table-row"
          key={r._id}
          >
          {activeColumns}
        </tr>
      )
    })
      return(
        <div>
          <h1>{this.props.title || null}</h1>
          {tableMenuOptions && (
            <Form layout="inline">
            <Dropdown overlay={tableMenuOptions}>
              <Button style={{float: 'right', marginLeft: 10}} type="primary" icon="setting">
                Options <Icon type="down" />
              </Button>
            </Dropdown>
          </Form>
          )}
          <WrappedFilterForm
            inputs={this.props.headers.filter(h=>h.noSort !== true)}
            onFilterSearch={this.handleFilterSearch}
          />
          {this.state.showEditItemDrawer && (
            <EditItemDrawer
              inputs={[
                {id: 'sku', text: 'SKU', span: 8, className: 'no-wrap', required: true, type: 'text', message: 'SKU cannot be blank'},
                {id: 'title', text: 'Title', span: 16, className: 'lg-field', type: 'text', required: false},
                {id: 'quantity', text: 'Quantity', type: 'number', span: 8, className: 'no-wrap', type: 'text', required: false},
                {id: 'quantityToShip', text: 'To Ship', type: 'number', span: 8, className: 'no-wrap', required: false},
                {id: 'price', text: 'Price', type: 'number', span: 8, className: 'no-wrap', required: false},
                {id: 'weight', text: 'Weight', type: 'number', span: 8, className: 'no-wrap', required: false},
                {id: 'brand', text: 'Brand', span: 8, type: 'text', required: false},
                {id: 'supplier', text: 'Supplier', span: 8, type: 'text', required: false},
                {id: 'barcode', text: 'Barcode', span: 8, type: 'text', required: false},
                {id: 'description', text: 'Description', span: 24, type: 'textarea', required: false, textRows: 4},
              ]}
              item={this.state.itemDrawerProduct}
              title={'Edit Product'}
              onClose={this.toggle('showEditItemDrawer')}
              onSave={this.handleProductUpdate}
              create={false}
            />
          )}
          {this.state.showCreateItemDrawer && (
            <EditItemDrawer
              inputs={[
                {id: 'sku', text: 'SKU', span: 8, className: 'no-wrap', required: true, type: 'text', message: 'SKU cannot be blank'},
                {id: 'title', text: 'Title', span: 16, className: 'lg-field', type: 'text', required: false},
                {id: 'quantity', text: 'Quantity', type: 'number', span: 8, className: 'no-wrap', type: 'text', required: false},
                {id: 'quantityToShip', text: 'To Ship', type: 'number', span: 8, className: 'no-wrap', required: false},
                {id: 'price', text: 'Price', type: 'number', span: 8, className: 'no-wrap', required: false},
                {id: 'weight', text: 'Weight', type: 'number', span: 8, className: 'no-wrap', required: false},
                {id: 'brand', text: 'Brand', span: 8, type: 'text', required: false},
                {id: 'supplier', text: 'Supplier', span: 8, type: 'text', required: false},
                {id: 'description', text: 'Description', span: 24, type: 'textarea', required: false, textRows: 4},
              ]}
              item={{}}
              title={'Create Product'}
              onClose={this.toggle('showCreateItemDrawer')}
              onSave={this.handleProductImport}
              create={true}
            />
          )}
          {this.state.showImportModal && (
            <ImportModal
              title="Import Products"
              onClose={this.toggle('showImportModal')}
              headers={[
                {value:'sku', required: true},
                {value:'title'},
                {value: 'barcode'},
                {value:'quantity'},
                {value:'price'},
                {value:'supplier'},
                {value:'brand'},
                {value:'weight'},
                {value:'action'},
              ]}
              validInputs={[
                {value:'sku', required: true},
                {value:'title'},
                {value:'barcode'},
                {value:'quantity', type: 'number'},
                {value:'price', type: 'number'},
                {value:'supplier'},
                {value:'brand'},
                {value:'weight', type: 'number'},
                {value:'action', type: 'array', validValues: ['update','delete']},
              ]}
              onSubmit={this.handleProductImport}
              onSuccess={this.handleDataFetch}
            />
          )}
          <div className="ant-table stkd-content no-pad contain">
            <Spin spinning={false}>
              <div className="table-options">
                <div>
                  {bulkMenu && (
                    <Dropdown className="bulk-dropdown" overlay={bulkMenu} disabled={this.state.selected.length === 0}>
                      <Button size="small">
                        {`Action on ${this.state.selected.length} selected`} <Icon type="down" />
                      </Button>
                    </Dropdown>
                  )}
                </div>
                <div>
                  <Pagination className="ant-table-pagination" {...this.state.pagination} />
                </div>
              </div>
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

  export default connect(mapStateToProps, {fetchAllProducts, updateProducts, importProducts, queryModelData, deleteModelDocuments})(ProductTable);
