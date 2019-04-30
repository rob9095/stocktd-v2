import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchAllProducts, updateProducts, importProducts } from '../store/actions/products';
import { queryModelData, deleteModelDocuments } from '../store/actions/models';
import { upsertModelDocuments } from '../store/actions/models';
import { addBoxScan } from '../store/actions/boxScans';
import { Button, Pagination, Divider, Icon, Spin, Form, Dropdown, Menu, Modal, message, Row, Col, Skeleton, Input } from 'antd';
import WrappedFilterForm from './FilterForm';
import EditItemDrawer from './EditItemDrawer';
import ImportModal from './ImportModal';
import InsertDataModal from './InsertDataModal';
import AutoCompleteInput from './AutoCompleteInput';
import TreeSelectSearch from './SimpleTreeSelect';

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
      showInsertDataModal: false,
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

  toggle = (key) => this.setState({[key]: !this.state[key]})

  componentDidUpdate(prevProps) {
    if (this.props.filters[0] !== prevProps.filters[0]) {
      this.handleDataFetch()
    }
  }

  handleDataFetch = async (config) => {
    let { requestedPage, requestedRowsPerPage, rowIds } = config || {}
    let rowId = Array.isArray(rowIds) ? rowIds[0] : null
    await this.setState({
      ...rowId ? { loadingRows: [...rowIds] } : {loading: true}
    })
    //if the table is empty add some empty rows
    if (this.state.data.length === 0) {
      let data = [1, 2, 3, 4, 5].map(n => ({ ...this.props.headers.map(h => ({ [h.id]: '' })), _id: n, }))
      this.setState({
        data,
      })
    }
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
    let query = this.props.filters ? [...this.state.query, ...this.props.filters] : this.state.query
    await this.props.queryModelData(this.props.queryModel,query,this.state.column, this.state.direction, requestedPage, requestedRowsPerPage,this.props.currentUser.user.company,populateArray)
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
      let drawerItem = this.state.data.find(p=>p._id === e.target.id)._id
      this.setState({
        drawerItem,
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
      switch(item.props.children.props.name) {
        case 'delete':
          let items = await this.showConfirm(null,'Delete',[item.props.children.props.id])
          if (items !== 'cancel') {
            this.handleRowDelete(items)
          }
          break;
        default:
          console.log('unknown menu option');
      }
    }

    handleBulkMenuClick = async ({ item, key, keyPath }) => {
      console.log(key)
      switch(key) {
        case 'delete':
          let items = await this.showConfirm(null,'Delete',this.state.selected)
          if (items !== 'cancel') {
            let foundOption = this.props.bulkMenuOptions.find(o=>o.handler && o.key === key)
            let result = foundOption ? await foundOption.handler(items) : this.handleRowDelete(items);
            if (foundOption) {
              result.error ? console.log(result) : this.handleRowDelete(items,false)
            }
          }
          break;
        case 'bulk-edit':
          this.toggle('showInsertDataModal')
          break;
        default:
          console.log('unknown menu option');
      }
    }

    handleOptionsMenuClick = async ({ item, key, keyPath }) => {
      let option = this.props.tableMenuOptions.find(o => o.handler && o.key === key) || {}
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

    handleMessage = (type,text) => {
      message[type](text)
    }

    handleRowDelete = async (ids, ignore) => {
      this.setState({
        loadingRows: [...this.state.loadingRows, ...ids]
      })
      let data = this.state.data.filter(r => ids.indexOf(r._id) === -1)
      let selected = this.state.selected.filter(id => ids.indexOf(id) === -1)
      const end = ids.length > 1 ? 's' : ''
      if (ignore !== true) {
        await this.props.deleteModelDocuments(this.props.queryModel, ids, this.props.currentUser)
          .then(res => {
            this.handleMessage('success', `${ids.length} record${end} deleted`)
            this.setState({
              data,
              selected,
            })
          })
          .catch(err => {
            console.log(err)
            this.handleMessage('error', err)
          })
      } else {
        this.handleMessage('success', `${ids.length} record${end} deleted`)
        this.setState({
          data,
          selected,
        })
      }
      this.setState({
        loadingRows: this.state.loadingRows.filter(id=>!ids.includes(id)),
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

    handleRowEditSave = (updates,id) => {
      return new Promise(async (resolve, reject) => {
        if (this.props.onRowEditSave) {
          this.setState({
            loadingRows: [...this.state.loadingRows, ...updates.map(u=>u.id)]
          })
          let result = await this.props.onRowEditSave(updates)
          this.handleDataFetch({ rowIds: updates.map(u => u.id) })
          resolve(result)
          return
        }
        let data = this.state.data.map(r => {
          let update = updates.find(u => u.id === r._id)
          if (update) {
            return {
              ...r,
              ...update,
            }
          } else {
            return {
              ...r,
            }
          }
        })
        await upsertModelDocuments(this.props.queryModel, updates, this.props.currentUser.user.company)
        .then((res) => {
          this.setState({
            data,
          })
          resolve(res)
        })
        .catch(error => {
          reject(error)
        })
      })
    }

    handleImport = (json) => {
      return new Promise( async (resolve,reject) => {
        await this.props.onImport(json)
        .then(res => {
          resolve(res)
        })
        .catch(err => {
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

    handleInsertDataSave = (data) => {
      return new Promise((resolve,reject)=>{
        //get the selected items
        let updates = this.state.data.filter(row => this.isSelected(row._id)).map(row => ({ id: row._id, ...data }))
        this.handleRowEditSave(updates)
        .then(res=>{
          resolve({ text: 'Changes Saved', status: 'success' })
        })
        .catch(err=>{
          console.log({err})
          reject({text: 'Error', status: 'error'})
        })
      })
    }

    handleAutoCompleteUpdate = async (data) => {
      data.handler || data.upsert && this.setState({
        loadingRows: [...this.state.loadingRows, data.rowId]
      })
      //use custom handler if provided
      if (data.handler) {
        await data.handler(data).then(res=>console.log(res)).catch(err=>console.log(err))
        this.handleDataFetch({ rowIds: [data.rowId] });
        return
      }
      //upsert if upsert on change is true
      if (data.upsertOnChange) {
        //upsert the changes
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
        return
      }
    }

    handleScan = (scan) => {
      this.setState({
        loading: true,        
      })
      return new Promise( async (resolve, reject) => {
        scan = {
          ...scan,
          user: this.props.currentUser.user.id,
        }
        await this.props.addBoxScan(scan, this.props.currentUser.user.company)
        .then(res => {
          this.handleDataFetch()
          resolve(res)
        })
        .catch(err => {
          this.setState({loading: false})
          reject(err);
        })
      })
    }

    render() {
      let drawerItem = this.state.data.find(item=>item._id === this.state.drawerItem) || {}
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
                  <a id={r._id} key={o.key} name={o.name}>{o.name}</a>
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
        if (col.type === 'tree-select') {
          return (
            <td key={`${r._id}-${col.id}`} className="stkd-td no-wrap">
              <Skeleton paragraph={false} loading={this.state.loading || this.state.loadingRows.includes(r._id)} active>
                <TreeSelectSearch
                  data={Array.isArray(r[col.id]) ? r[col.id] : []}
                  parentTitle={'name'}
                  parentValue={'name'}
                  childTitle={'name'}
                  childValue={'name'}
                  childArray={'locations'}
                >
                  <Input style={{ display: "none" }} />
                </TreeSelectSearch>
              </Skeleton>
            </td>
          )
        }
        if (Array.isArray(r[col.id]) || col.type === 'autoComplete') {
          return (
            <td key={`${r._id}-${col.id}`} className="stkd-td no-wrap">
              <Skeleton paragraph={false} loading={this.state.loading || this.state.loadingRows.includes(r._id)} active>
                <AutoCompleteInput
                  key={`${r._id}-${col.id}-auto-complete`}
                  queryModel={col.queryModel}
                  searchKey={col.nestedKey}
                  placeholder={col.text}
                  mode={col.autoCompleteMode}
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
              {col.render ? col.render(r[col.id]) : col.nestedKey && r[col.id] ? r[col.id][col.nestedKey] : r[col.id] || ''}
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
            inputs={this.props.headers.filter(h => h.noFilter !== true && h.noSort !== true)}
            onFilterSearch={this.handleFilterSearch}
            currentPOs={this.state.currentPOs}
            showScannerForm={this.props.showScannerForm}
            scanToPo={this.props.filters.find(f => f[0] === 'scanToPo') && this.props.filters.find(f => f[0] === 'scanToPo')[1]}
            onScan={this.handleScan}
          />
          {drawerItem._id && (
            <EditItemDrawer
              inputs={this.props.headers.filter(h => !h.noSort)}
              item={drawerItem}
              title={`${drawerItem._id ? 'Edit '+ drawerItem.name || 'Item' : 'Create Item'} `}
              onClose={() => this.setState({ drawerItem: null })}
              onSave={(data, id) => id ? this.handleRowEditSave(data, id) : this.handleImport(data)}
              create={drawerItem._id ? false : true}
            />
          )}
          {this.state.showInsertDataModal && (
            <InsertDataModal
              currentUser={this.props.currentUser.user}
              title={"Add Box Prefix"}
              inputs={this.props.headers.filter(h => !h.noSort && !h.disabled).map(h=>({...h, required: false}))}
              okText={"Save"}
              cancelText={"Cancel"}
              onClose={() => this.toggle("showInsertDataModal")}
              onSave={this.handleInsertDataSave}
            />
          )}
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
              title="Import File"
              onClose={()=>this.toggle('showImportModal')}
              headers={this.props.importHeaders}
              validInputs={this.props.importValidValues}
              onSubmit={this.handleImport}
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

  export default connect(mapStateToProps, {fetchAllProducts, updateProducts, importProducts, queryModelData, deleteModelDocuments, addBoxScan})(ProductTable);
