import React, { Component } from 'react';
import { connect } from 'react-redux';
import { queryModelData, deleteModelDocuments } from '../store/actions/models';
import { upsertModelDocuments } from '../store/actions/models';
import { addBoxScan } from '../store/actions/boxScans';
import { Button, Pagination, Select, Icon, Dropdown, Menu, Modal, message, Empty, Skeleton, Input, Layout, PageHeader } from 'antd';
import { addNotification, removeNotification } from '../store/actions/notifications';
import WrappedFilterForm from './FilterForm';
import SearchForm from './SearchForm';
import ScanForm from './ScanFormNew';
import EditItemDrawer from './EditItemDrawer';
import ImportModal from './ImportModal';
import InsertDataModal from './InsertDataModal';
import AutoCompleteInput from './AutoCompleteInput';
import CascaderSelect from './CascaderSelect';
import BasicTreeSelect from './BasicTreeSelect';
import SingleInputFilter from './SingleInputFilter';

const moment = require('moment');
const confirm = Modal.confirm;

class ProductTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadingRows: [],
      rowsPerPage: 10,
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
      populateQuery:[],
      hiddenCols: ['supplier'],
      siderClosed: true,
      scannerClosed: true,
      triggerDropMenuClose: 0,
      pageSizeOptions: [10, 50, 100, 250, 500],
      pagination: {
        current: 1,
        total: 0,
        defaultPageSize: 10,
        pageSize: 10,
        hideOnSinglePage: true,
        showSizeChanger: true,
        showQuickJumper: false,
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
    if (this.props.fetchData > prevProps.fetchData) {
      this.handleDataFetch(this.props.fetchDataConfig || {})
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
      let data = [1, 2, 3, 4, 5].map(n => ({ ...this.props.headers.map(h => ({ [h.id]: '' })), _id: n, isSkeleton: true }))
      this.setState({
        data,
      })
    }
    //console.log({loadingRows: this.state.loadingRows, loading: this.state.loading})
    requestedPage = requestedPage || this.state.activePage;
    requestedRowsPerPage = requestedRowsPerPage || this.state.rowsPerPage;
    let populateArray = this.props.populateArray || []
    populateArray = populateArray.map(pC => {
      const foundPc = this.state.populateArray.find(p => p.path === pC.path)
      if (foundPc) {
        return ({
          ...pC,
          ...foundPc
        })
      } else {
        return({...pC})
      }
    })
    let query = this.props.filters ? [...this.state.query, ...this.props.filters] : this.state.query
    await this.props.queryModelData(this.props.queryModel,query,this.state.column, this.state.direction, requestedPage, requestedRowsPerPage,this.props.currentUser.user.company,populateArray)
    .then(({data = [], activePage, totalPages, rowsPerPage, skip})=>{
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
      this.props.addNotification({
        nType: 'notification',
        id: 'fetch-error',
        icon: <Icon type="close-circle" style={{color: 'red'}} />,
        message: err || 'Something went wrong',
        onClose: () => this.props.removeNotification({ id: 'fetch-error', })
      })
      this.setState({
        data: this.state.data.filter(r=>!r.isSkeleton),
      })

    })
      await this.setState({
        ...rowId ? { loadingRows: [] } : { loading: false }
      })
      // console.log({
      //   loadingRows: this.state.loadingRows,
      //   loading: this.state.loading
      // });
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

    handleRowEdit = async (id) => {
      let drawerItem = this.state.data.find(p=>p._id === id)._id
      this.setState({
        drawerItem,
      })
      console.log(id)
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

    handleActionMenuClick = async ({ item, key, keyPath, id }) => {
      console.log({item})
      switch(item.props.children.key) {
        case 'edit':
          this.handleRowEdit(id)
          break;
        case 'delete':
          let items = await this.showConfirm(null,'Delete',[id])
          if (items !== 'cancel') {
            this.handleRowDelete(items)
          }
          break;
        default:
          console.log('unknown menu option');
      }
    }

    handleBulkMenuClick = async ({ item, key, keyPath }) => {
      let foundOption = this.props.bulkMenuOptions.find(o => o.handler && o.key === key) || {}
      switch(key) {
        case 'delete':
          let items = await this.showConfirm(null,'Delete',this.state.selected)
          if (items !== 'cancel') {
            foundOption.handler ? this.handleRowDelete(items,foundOption.handler) : this.handleRowDelete(items)
          }
          break;
        case 'bulk-edit':
          //this.toggle('showInsertDataModal')
          this.setState({
            insertDataModal: {
              title: "Bulk Edit",
              inputs: this.props.headers.filter(h => !h.noSort && !h.noEdit && !h.noBulkEdit).map(h => ({ ...h, required: false })),
              okText: "Save",
              cancelText: "Cancel",
              onSave: this.handleInsertDataSave,
            }
          })
          break;
        default:
          foundOption.handler && foundOption.handler(({item, key, keyPath, selected: this.state.selected}))
      }
    }

    handleOptionsMenuClick = async ({ item, key, keyPath }) => {
      this.setState({
        tableOptionsMenuOpen: false,
      })
      //let option = this.props.tableMenuOptions.find(o => o.handler && o.key === key) || {}
      switch(key) {
        case 'add':
          this.setState({
            drawerItem: true,
          })
          break;
        case 'import':
          this.setState({
            showImportModal: true,
          })
          break;
        case 'scan':
          this.setState({scannerClosed: false})
          break;
        default:
          console.log('unknown menu option');
      }
    }

    handleMessage = (type,text) => {
      message[type](text)
    }

    handleRowDelete = async (ids, handler, ignore) => {
      this.setState({
        loadingRows: [...this.state.loadingRows, ...ids]
      })
      let data = this.state.data.filter(r => ids.indexOf(r._id) === -1)
      let selected = this.state.selected.filter(id => ids.indexOf(id) === -1)
      const end = ids.length > 1 ? 's' : ''
      if (ignore !== true) {
        let fn = handler || this.props.deleteModelDocuments
        await fn({model: this.props.queryModel, data: ids, currentUser: this.props.currentUser})
          .then(res => {
            this.handleMessage('success', `${ids.length} record${end} deleted`)
            this.setState({
              data,
              selected,
            })
          })
          .catch(err => {
            console.log(err)
            this.handleMessage('error', err.message)
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

    handleRowEditSave = (updates,id) => {
      return new Promise(async (resolve, reject) => {
        if (this.props.onRowEditSave) {
          // this.setState({
          //   loadingRows: [...this.state.loadingRows, ...updates.map(u=>u.id)]
          // })
          await this.props.onRowEditSave(updates)
          .then(res=>{
            resolve(res)
            this.handleDataFetch({ rowIds: updates.map(u => u.id) })
          })
          .catch(err=>{
            reject(err)
          })
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
          this.handleDataFetch()
        })
        .catch(err => {
          reject(err)
        })
      })
    }

    handleFilterSearch = async (query,populateArray,populateQuery) => {
      let q = {
        oldQuery: [...this.state.query,...this.state.populateQuery],
        query: [...query, ...populateQuery]
      }
      //check the query values if new and old queries are same length
      // if (q.query.length === q.oldQuery.length) {
      //   let check = q.query.filter(val=>{
      //     let oldVal = q.oldQuery.find(v=>v[0] === val[0])
      //     //if there is no oldVal or the newVal doesn't match the oldVal keep the query
      //     if (!oldVal || oldVal[1] !== val[1] || oldVal[2] !== val[2]) {
      //       return val
      //     }
      //   })
      //   if (!check.length) return
      // }
      await this.setState({
        query,
        populateArray,
        populateQuery,
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
      this.setState({
        ...data.rowId ? {
          loadingRows: [...this.state.loadingRows, data.rowId]
        } : {
          loading: true,
        }
      })
      //use custom handler if provided
      if (data.handler) {
        data.handler(data)
        .then(res=>{
          console.log(res)
          this.handleDataFetch({ rowIds: [data.rowId] });
        })
        .catch(err=>console.log(err));
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
        await addBoxScan(scan, this.props.currentUser.user.company)
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
      let drawerItem = this.state.drawerItem === true ? true : this.state.data.find(item=>item._id === this.state.drawerItem) || {}
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
              <Skeleton paragraph={false} loading={this.state.loading} active>
                <label className="container">
                  <input
                    className="ant-checkbox-input" onChange={this.handleSelectAllClick} checked={this.state.selectAll} type="checkbox"
                  />
                  <span className="checkmark"></span>
                </label>
              </Skeleton>
            </th>
          )
        } else if (h.noSort) {
          return (
            <th key={h.id+h.nestedKey || i} id={h.id} width={h.width}>
              <Skeleton paragraph={false} loading={this.state.loading} active>
                {h.text}
              </Skeleton>
            </th>
          )
        } else {
          return (
            <th key={h.id+h.nestedKey || i} id={h.id} width={h.width} onClick={this.handleSort} className="stkd-table header">
              <Skeleton paragraph={false} loading={this.state.loading} active>
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
              </Skeleton>
            </th>
          )
        }
      })
      let rows = this.state.data.map((r,i) => {
      const isSelected = this.isSelected(r._id);
      const rowLoading = this.state.loading || this.state.loadingRows.includes(r._id)
      let activeColumns = this.props.headers.filter(h=>this.state.hiddenCols.indexOf(h.id) === -1).map(col=>{
        if (col.id === 'select-all') {
          return (
            <td key={`${r._id}-select-all`} className="ant-table-selection-column">
              <Skeleton paragraph={false} loading={rowLoading} active>
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
            <Menu key={`${r._id}-action-menu`} onClick={(data)=>this.handleActionMenuClick({...data, id: r._id})}>
              {col.actionOptions.map(o=>(
                <Menu.Item key={`${r._id}-action-menu-option-${o.name}`}>
                  <a id={r._id} key={o.key} name={o.name}>{o.name}</a>
                </Menu.Item>
              ))}
            </Menu>
          )
          return (
            <td key={`${r._id}-${col.id}`} id={`${r._id}-${col.id}-dropdown`} className="stkd-td actions center-a no-wrap" style={this.state.data.length>8?{position: 'relative'}:{}}>
              <Skeleton paragraph={false} loading={rowLoading} active>
                <Dropdown trigger={['click']} getPopupContainer={()=>document.getElementById(`${r._id}-${col.id}-dropdown`)} overlay={menu} placement="bottomRight">
                    <Button className="no-border no-bg">
                      <Icon type="ellipsis" style={{ color: '#a6aece', fontSize: 25, cursor: 'pointer' }} />
                    </Button>
                  </Dropdown>
              </Skeleton>
            </td>
          )
        }
        if (col.type === 'treeSelect') {
          return(
            <td key={`${r._id}-${col.id}`} className="stkd-td no-wrap" style={{minWidth: 200,...this.state.data.length > 8 && { position: 'relative' }}}>
              <Skeleton paragraph={false} loading={rowLoading} active>
                <BasicTreeSelect
                  domRef={`${r._id}-${col.id}-tree-select`}
                  options={col.mapReduce.parents(r)}
                  childOptions={col.mapReduce.childOptions(r)}
                  onUpdate={(value, options) => this.handleAutoCompleteUpdate({ rowId: r._id, handler: col.handler, clicked: { value, options }, colId: col.id, })}
                  showAddOption
                  onAddNewItem={() => {
                    let insertDataModal = this.props.onGetInsertDataConfig(this.state.data.filter(row => row._id === r._id), 'addNewBox')
                    insertDataModal = {
                      ...insertDataModal,
                      ...!insertDataModal.onSave && { onSave: this.props.onInsertDataSave }
                    }
                    this.setState({
                      insertDataModal,
                    })
                  }}
                  triggerClose={this.state.triggerDropMenuClose}
                >
                  <Input style={{ display: "none" }} />
                </BasicTreeSelect>
              </Skeleton>
            </td>
          )
        }
        if (col.type === 'cascader') {
          return (
            <td key={`${r._id}-${col.id}`} className="stkd-td no-wrap" style={this.state.data.length>8?{position: 'relative'}:{}}>
              <Skeleton paragraph={false} loading={rowLoading} active>
                <CascaderSelect
                  domRef={`${r._id}-${col.id}cascader-select`}
                  data={Array.isArray(r[col.id]) ? col.filter ? col.filter(r[col.id].map(option => ({ ...r, ...option, }))) : r[col.id].map(option => ({ ...r, ...option, })) : []}
                  parent={col.parent}
                  child={col.child}
                  onUpdate={(value, options) => this.handleAutoCompleteUpdate({ rowId: r._id, handler: col.handler, clicked: {value, options}, colId: col.id, })}
                  showAddOption
                  reverseData={col.reverseData}
                  onAddNewItem={()=>{
                    let insertDataModal = this.props.onGetInsertDataConfig(this.state.data.filter(row => row._id === r._id), 'addNewBox')
                    insertDataModal = {
                      ...insertDataModal,
                      ...!insertDataModal.onSave && { onSave: this.props.onInsertDataSave} 
                    }
                    this.setState({
                      insertDataModal,
                    })
                  }}
                  triggerClose={this.state.triggerDropMenuClose}
                >
                  <Input style={{ display: "none" }} />
                </CascaderSelect>
              </Skeleton>
            </td>
          )
        }
        if (Array.isArray(r[col.id]) || col.type === 'autoComplete') {
          return (
            <td key={`${r._id}-${col.id}`} className="stkd-td no-wrap" style={this.state.data.length>8?{position: 'relative'}:{}}>
              <Skeleton paragraph={false} loading={rowLoading} active>
                <AutoCompleteInput
                  domRef={`${r._id}-${col.id}-auto-complete`}
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
        if (col.type === 'date') {
          return (
            <td key={`${r._id}-${col.id}-${col.nestedKey || i}`} className={col.className}>
              <Skeleton paragraph={false} loading={rowLoading} active>
                {col.render ? col.render(r[col.id]) : col.nestedKey && r[col.id] ? moment(new Date(r[col.id][col.nestedKey])).format('M/D/YY') : moment(new Date(r[col.id])).format('M/D/YY') || ''}
              </Skeleton>
            </td>
          )
        }
        return (
          <td key={`${r._id}-${col.id}-${col.nestedKey || i}`} className={col.className}>
            <Skeleton paragraph={false} loading={rowLoading} active>
              {col.render ? col.render(r) : col.nestedKey && r[col.id] ? r[col.id][col.nestedKey] : r[col.id] || ''}
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
        <Layout style={{height: '100%', background: 'transparent',}}>
        <div className="flex flex-col full-pad" style={{height: '100%', overflow: 'auto'}}>
          <div className="flex align-items-center space-between border-bottom" style={{paddingBottom: 16}}>
            <h1 className="no-margin">{this.props.title}</h1>
            <div>
              {tableMenuOptions && (
                <Dropdown placement={"bottomRight"} overlay={tableMenuOptions} onVisibleChange={(tableOptionsMenuOpen) => this.setState({ tableOptionsMenuOpen })}>
                  <Button style={{ display: 'flex' }} type="primary">
                    Options <Icon style={{ display: 'flex', transition: 'transform .3s', ...this.state.tableOptionsMenuOpen && { transform: 'rotate(180deg)' } }} type={"down"} />
                  </Button>
                </Dropdown>
              )}
            </div>
          </div>
          {this.props.extraTopContent && this.props.extraTopContent(this.state)}
          {/* <WrappedFilterForm
            inputs={[...this.props.headers.filter(h => h.noFilter !== true && h.noSort !== true), ...Array.isArray(this.props.additionalSearchInputs) && this.props.additionalSearchInputs]}
            onFilterSearch={this.handleFilterSearch}
            currentPOs={this.state.currentPOs}
            showScannerForm={this.props.showScannerForm}
            scanToPo={this.props.filters.find(f => f[0] === 'scanToPo') && this.props.filters.find(f => f[0] === 'scanToPo')[1]}
            onScan={this.handleScan}
          /> */}
          {(drawerItem === true || drawerItem._id) && (
            <EditItemDrawer
              inputs={this.props.headers.map(h=>({...h,span:24})).filter(h => !h.noSort && h.noEdit !== 'hide').sort((a,b)=>a.editOrder > b.editOrder)}
              item={drawerItem === true ? {} : drawerItem}
              title={`${drawerItem._id ? 'Edit' : 'Create'} ${this.props.editTitle || ''}`}
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
          {this.state.insertDataModal && (
            <InsertDataModal
              {...this.state.insertDataModal}
              onClose={() => this.setState({insertDataModal: null})}
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
          <div className="ant-table flex flex-col">
            <div className="flex flex-wrap align-items-center space-between" style={{padding: '14px 0px'}}>
              {bulkMenu && (
                <div>
                  <Dropdown className="bulk-dropdown" overlay={bulkMenu} disabled={this.state.selected.length === 0}>
                    <Button>
                      {`Action on ${this.state.selected.length} selected`} <Icon type="down" />
                    </Button>
                  </Dropdown>
                </div>
              )}
              <div>
                <SingleInputFilter
                  onSearchBuilderToggle={()=>this.setState({siderClosed: false, siderConfig: {title: 'Advanced Search'}})}
                  onSearch={this.handleFilterSearch}
                  searchBuilderClosed={this.state.siderClosed}
                  query={this.state.query}
                  populateQuery={this.state.populateQuery}
                  populateArray={this.state.populateArray}
                  options={[
                    ...this.props.headers.filter(h => h.noFilter !== true && h.noSort !== true),
                    ...Array.isArray(this.props.additionalSearchInputs) && this.props.additionalSearchInputs,
                  ]}
                />
              </div>
            </div>
            <div className="stkd-widget no-margin contain" style={{ height: '100%',}}>
              <table className="fixed">
                <thead className="ant-table-thead">
                  <tr>
                    {headers}
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                  {rows.length ? rows : 
                    this.props.emptyRender ? this.props.emptyRender() : 
                      <tr className="no-hover">
                        <td colSpan={headers.length || 99}>
                            <div style={{padding: '5% 0px'}}>
                              <Empty
                                imageStyle={{
                                  height: 140,
                                }}
                                description={
                                  <span>
                                    <span className="header">{this.state.query.length ? "We didn't find anything..." : "We didn't find any "+this.props.title}</span>
                                    <span>You can <a onClick={() => this.handleOptionsMenuClick({key: 'import'})}>import</a> or <a onClick={() => this.handleOptionsMenuClick({key:'add'})}>add one</a> to get started</span>
                                  </span>
                                }
                              />
                            </div>
                        </td>
                      </tr>
                  }
                </tbody>
              </table>
              <div className="table-footer flex justify-flex-end">
                <div className="flex align-items-center flex-wrap">
                  <span style={{ marginRight: 5, whiteSpace: 'nowrap' }}>Items per page:</span>
                  <Select
                    style={{minWidth: 75}}
                    className="size-changer"
                    value={this.state.pagination.pageSize}
                    defaultValue={this.state.pagination.defaultPageSize}
                    onSelect={(selected) => this.state.pagination.onShowSizeChange(this.state.pagination.current, selected)}
                  >
                    {this.state.pageSizeOptions.map(op => (
                      <Select.Option key={op} value={op} className="flex-i align-items-center justify-content-center">
                        <Skeleton paragraph={false} loading={this.state.loading} active>
                          {this.state.pagination.pageSize === op &&
                            <Icon style={{ marginRight: 2, marginLeft: -10 }} type="check" />
                          }
                          <span>{op}</span>
                        </Skeleton>
                      </Select.Option>
                    ))}
                  </Select>
                  <div className="pagination-simple">
                      <Skeleton paragraph={false} loading={this.state.loading} active>
                      <Pagination simple className="flex align-items-center" {...this.state.pagination} />
                    </Skeleton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          <Layout.Sider className="stkd-sidebar right" width={300} trigger={null} collapsedWidth={0} collapsible collapsed={this.state.siderClosed} onCollapse={() => this.setState({siderClosed: true})} style={{height: '100%', overflow: 'auto', ...this.state.siderClosed && {border: 'none'}}}>
            <div className="half-pad">
              <PageHeader onBack={() => this.setState({ siderClosed: true })} {...this.state.siderConfig} />
              <SearchForm
                inputs={[...this.props.headers.filter(h => h.noFilter !== true && h.noSort !== true), ...Array.isArray(this.props.additionalSearchInputs) && this.props.additionalSearchInputs].map(i => ({ ...i, span: 24 }))}
                query={this.state.query}
                populateQuery={this.state.populateQuery}
                onSearch={this.handleFilterSearch}
              />
            </div>
          </Layout.Sider>
          {this.props.scanFormConfig && !this.state.scannerClosed && (
            <Layout.Sider className={"stkd-sidebar right"} width={300} trigger={null} collapsedWidth={0} collapsible collapsed={this.state.scannerClosed} onCollapse={() => this.setState({ scannerClosed: true })} style={{ height: '100%', overflow: 'auto', ...this.state.scannerClosed && { border: 'none' } }}>
              <div className="half-pad">
                <PageHeader onBack={() => this.setState({ scannerClosed: true })} title="Scan Form" />
                <ScanForm
                  {...this.props.scanFormConfig}
                  onCurrentPOUpdate={(a,b)=>this.props.onCurrentPOUpdate(a,b,this.state.scannerClosed)}
                />
              </div>
            </Layout.Sider>
          )}
        </Layout>
      )
    }
  }

  function mapStateToProps(state) {
   return {
     currentUser: state.currentUser,
     errors: state.errors,
   };
  }

export default connect(mapStateToProps, { queryModelData, deleteModelDocuments, addBoxScan, addNotification, removeNotification})(ProductTable);
