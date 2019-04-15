import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { importPurchaseOrder, updatePurchaseOrders, removePurchaseOrders } from '../store/actions/purchaseOrders';
import { queryModelData, deleteModelDocuments } from '../store/actions/models';
import { Button, Pagination, Divider, Icon, Spin, Form, Dropdown, Menu, Modal, message } from 'antd';
import WrappedFilterForm from './FilterForm';
import EditItemDrawer from './EditItemDrawer';
import ImportModal from './ImportModal';
import PoProductTable from '../components/PoProductTable';

const moment = require('moment');
const confirm = Modal.confirm;

class PurchaseOrderTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      rowsPerPage: 10,
      activePage: 1,
      totalPages: 0,
      skip: 0,
      data: [],
      selected: [],
      selectAll: false,
      column: 'sku',
      openPOs: [],
      direction: 'ascending',
      query: [],
      showFilters: false,
      showEditItemDrawer: false,
      showCreateItemDrawer: false,
      showImportModal: false,
      headers: [
        {id: 'select-all', text: '', width: 75, noSort: true},
        {id: 'name', text: 'Name', width: 400, span: 6, className: 'no-wrap'},
        {id: 'type', text: 'Type', width: 250, span: 6, className: 'no-wrap'},
        {id: 'status', text: 'Status', width: 250, span: 6, className: 'no-wrap'},
        {id: 'quantity', text: 'Quantity', width: 175, type: 'number', span: 6, className: 'no-wrap'},
        {id: 'createdOn', text: 'Date Created', width: 100, type: 'date', span: 8, className: 'no-wrap'},
        {id: 'actions', text: 'Actions', width: 100, noSort: true},
      ],
      hiddenCols: [''],
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
    requestedPage = requestedPage === undefined ? this.state.activePage : null;
    requestedRowsPerPage = requestedRowsPerPage === undefined ? this.state.rowsPerPage : null;
    this.props.queryModelData('PurchaseOrder',this.state.query,this.state.column, this.state.direction, requestedPage, requestedRowsPerPage, this.props.currentUser.user.company)
    .then(({data, activePage, totalPages, rowsPerPage, skip})=>{
      data = data.map(po => ({
        ...po,
        createdOn: new Date(po.createdOn).toLocaleString()
      }))
      this.setState({
        loading: false,
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
      if (this.state.selected.indexOf(id) !== -1) {
        selected = this.state.selected.filter(s => s !== id)
      } else {
        selected.push(id)
      }
      this.setState({ selected });
    }

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    handleSelectAllClick = () => {
      if (!this.state.selectAll) {
        this.setState({ selected: this.state.data.map(p => p._id), selectAll: true, });
        return
      }
      this.setState({ selected: [], selectAll: false, });
    };

    handleRowEdit = async (e) => {
      let drawerItem = this.state.data.find(p=>p._id === e.target.id)
      this.setState({
        showEditItemDrawer: true,
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
      switch(item.props.children.props.name) {
        case 'delete':
          let items = await this.showConfirm(null,'Delete',[item.props.children.props.id])
          if (items !== 'cancel') {
            this.handleItemDelete(items)
          }
          break;
        default:
          console.log('unknown menu option');
      }
    }

    handleBulkMenuClick = async ({ item, key, keyPath }) => {
      switch(key) {
        case 'delete':
          let items = await this.showConfirm(null,'Delete',this.state.selected)
          if (items !== 'cancel') {
            this.handleItemDelete(items)
          }
          break;
        case 'open':
          let poRefs = this.state.data.filter(p=>this.state.selected.includes(p._id))
          console.log(poRefs)
          this.setState({
            redirect: {
              pathname: `/app/po-products`,
              poRefs,
            }
          })
          break;
        default:
          console.log('unknown menu option');
      }
    }

    handleOptionsMenuClick = async ({ item, key, keyPath }) => {
      switch(key) {
        case 'add':
        this.setState({
          drawerItem: {},
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

    handleItemDelete = (ids) => {
       let data = this.state.data.filter(p=>ids.indexOf(p._id) === -1)
       let removedPos = this.state.data.filter(p=>ids.indexOf(p._id) !== -1).map(po=>({id: po._id, poRef: po.poRef}))
       console.log(removedPos)
       let selected = this.state.selected.filter(id=>ids.indexOf(id) === -1)
       const end = ids.length > 1 ? 's' : ''
       this.props.removePurchaseOrders(removedPos,this.props.currentUser)
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

    handlePOUpdate = (updates, id) => {
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
        this.props.updatePurchaseOrders(updates,this.props.currentUser)
        .then((res)=>{
          this.setState({
            data,
            drawerItem: id ? { ...data.find(i => i._id === id) } : this.state.drawerItem,
          })
          resolve(res)
        })
        .catch(error=>{
          reject(error)
        })
      })
    }

    handleImport = (json) => {
      return new Promise((resolve,reject) => {
        this.props.importPurchaseOrder(json, this.props.currentUser)
        .then(res=>{
          this.handleDataFetch()
          resolve(res)
        })
        .catch(err=>{
          reject(err)
        })
      })
    }

    handleFilterSearch = async (query) => {
      await this.setState({
        query,
      })
      this.handleDataFetch()
    }

    render() {
      const bulkMenu = (
        <Menu onClick={this.handleBulkMenuClick}>
          <Menu.Item name="open" key="open">Open POs</Menu.Item>
          <Menu.Item name="scan" key="scan">Scan POs</Menu.Item>
          <Menu.Item name="copy" key="copy">Duplicate POs</Menu.Item>
          <Menu.Item name="label" key="label">Print Product Labels</Menu.Item>
          <Menu.Item name="delete" key="delete">Delete POs</Menu.Item>
        </Menu>
      );
      const optionsMenu = (
        <Menu onClick={this.handleOptionsMenuClick}>
          <Menu.Item name="import" key="import">Import POs</Menu.Item>
          <Menu.Item name="export" key="export">Export POs</Menu.Item>
          <Menu.Item name="add" key="add">Create PO</Menu.Item>
          <Menu.Item name="display" key="display">Display Options</Menu.Item>
        </Menu>
      );
      let headers = this.state.headers.filter(h=>this.state.hiddenCols.indexOf(h.id) === -1).map((h,i) => {
        if (i === 0) {
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
      let rows = this.state.data.map((p,i) => {
      const isSelected = this.isSelected(p._id);
      let activeColumns = this.state.headers.filter(h=>this.state.hiddenCols.indexOf(h.id) === -1).map(col=>{
        if (col.id === 'select-all') {
          return (
            <td key={`${p._id}-${col.id}`} className="ant-table-selection-column">
              <label className="container">
                <input
                  type="checkbox"
                  onChange={event => this.handleRowCheck(event, p._id)}
                  checked={isSelected}
                />
                <span className="checkmark"></span>
              </label>
            </td>
          )
        }
        if (col.id === 'actions') {
          const menu = (
            <Menu key={`${p._id}-menu`} onClick={this.handleActionMenuClick}>
              <Menu.Item>
                <a id={p._id} name="scan">Scan PO</a>
              </Menu.Item>
              <Menu.Item>
                <a id={p._id} name="copy">Copy PO</a>
              </Menu.Item>
              <Menu.Item>
                <a id={p._id} name="delete">Delete PO</a>
              </Menu.Item>
            </Menu>
          )
          return (
            <td key={`${p._id}-${col.id}`} className="stkd-td actions center-a no-wrap">
              <span>
                <a id={p._id} onClick={this.handleRowEdit}>Edit</a>
                <Divider type="vertical" />
                <Dropdown overlay={menu}>
                  <a className="ant-dropdown-link"><Icon type="down" /></a>
                </Dropdown>
              </span>
            </td>
          )
        }
        if (col.id === 'name') {
          return (
            <td key={`${p._id}-${col.id}`} className={col.className}>
              <Link to={{
                  pathname: '/app/po-products',
                  poRefs: [{...p}],
                }}
              >
                {p[col.id]}
              </Link>
            </td>
          )
        }
        if (col.type === 'date') {
          return (
            <td key={`${p._id}-${col.id}`} className={col.className}>{moment(new Date(p[col.id])).format('M/D/YY')}</td>
          )
        } else {
          return (
              <td key={`${p._id}-${col.id}`} className={col.className}>{p[col.id]}</td>
            )
        }
      })
      return (
        <tr className="ant-table-row"
          key={p._id}
          >
          {activeColumns}
        </tr>
      )
    })
      if (this.state.redirect) {
        return (
          <Redirect
            to={this.state.redirect}
          />
        )
      }
      return(
        <div>
          <h1>Purchase Orders</h1>
          <Form layout="inline">
            <Dropdown overlay={optionsMenu}>
              <Button style={{float: 'right', marginLeft: 10}} type="primary" icon="setting">
                Options <Icon type="down" />
              </Button>
            </Dropdown>
            <Link to="/app/po-products">
              <Button style={{float: 'right', marginLeft: 10}} type="primary" icon="tags">
                PO Products
              </Button>
            </Link>
          </Form>
          <WrappedFilterForm
            currentUser={this.props.currentUser.user}
            inputs={this.state.headers.filter(h=>h.noSort !== true)}
            onFilterSearch={this.handleFilterSearch}
          />
          {this.state.drawerItem && (
            <EditItemDrawer
              inputs={[
                {id: 'name', text: 'PO Name', span: 16, className: 'no-wrap', required: true, type: 'text', message: 'Name cannot be blank'},
                {id: 'createdOn', text: 'Date Created', span: 8, className: 'full-width', required: true, type: 'date'},
                {id: 'type', text: 'PO Type', span: 12, className: 'no-wrap', required: true, type: 'dropdown', values: [{id:'inbound',text:'Inbound'},{id:'outbound',text:'Outbound'}]},
                {id: 'status', text: 'PO Status', span: 12, className: 'no-wrap', required: true, type: 'dropdown', values: [{id:'complete',text:'Complete'},{id:'processing',text:'Processing'}]},
              ]}
              item={this.state.drawerItem}
              title={`${this.state.drawerItem._id ? 'Edit' : 'Create'} Purchase Order`}
              onClose={()=>this.setState({drawerItem: null})}
              onSave={(data,id) => id ? this.handlePOUpdate(data, id) : this.handleImport(data)}
              create={this.state.drawerItem._id ? false : true}
            />
          )}
          {/* {this.state.showCreateItemDrawer && (
            <EditItemDrawer
              inputs={[
                {id: 'name', text: 'Name', span: 16, className: 'no-wrap', required: true, type: 'text', message: 'Name cannot be blank'},
                {id: 'createdOn', text: 'Date Created', span: 8, className: 'full-width', required: true, type: 'date'},
                {id: 'type', text: 'PO Type', span: 12, className: 'no-wrap', required: true, type: 'dropdown', values: [{id:'inbound',text:'Inbound'},{id:'outbound',text:'Outbound'}]},
                {id: 'status', text: 'PO Status', span: 12, className: 'no-wrap', required: true, type: 'dropdown', values: [{id:'complete',text:'Complete'},{id:'processing',text:'Processing'}]},
              ]}
              item={{}}
              title={'Create Purchase Order'}
              onClose={this.toggle('showCreateItemDrawer')}
              onSave={this.handleImport}
              create={true}
            />
          )} */}
          {this.state.showImportModal && (
            <ImportModal
              title="Import Purchase Orders"
              onClose={this.toggle('showImportModal')}
              headers={[
                {value:'sku', required: true},
                {value:'type', required: true},
                {value:'name', required: true},
                {value:'quantity', required: true},
                {value:'status'},
                {value:'title'},
                {value:'barcode'},
                {value:'price'},
                {value:'supplier'},
                {value:'brand'},
                {value:'weight'},
              ]}
              validInputs={[
                {value:'sku', required: true},
                {value:'name', required: true},
                {value:'type', required: true, type: 'array', validValues: ['inbound','outbound']},
                {value:'quantity', type: 'number', required: true},
                {value:'status', type: 'array', validValues: ['complete','processing']},
                {value:'title'},
                {value:'barcode'},
                {value:'price', type: 'number'},
                {value:'supplier'},
                {value:'brand'},
                {value:'weight', type: 'number'},
              ]}
              onSubmit={this.handleImport}
              onSuccess={this.handleDataFetch}
            />
          )}
          <div className="ant-table stkd-content no-pad contain">
            <Spin spinning={this.state.loading}>
              <div className="table-options">
                <div>
                  <Dropdown className="bulk-dropdown" overlay={bulkMenu} disabled={this.state.selected.length === 0}>
                    <Button size="small">
                      {`Action on ${this.state.selected.length} selected`} <Icon type="down" />
                    </Button>
                  </Dropdown>
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

export default connect(mapStateToProps, {deleteModelDocuments, importPurchaseOrder, queryModelData, updatePurchaseOrders, removePurchaseOrders})(PurchaseOrderTable);
