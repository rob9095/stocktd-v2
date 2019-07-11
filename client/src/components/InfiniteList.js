import React, { Component } from 'react';
import { List, message, Avatar, Spin, Skeleton } from 'antd';
import { connect } from 'react-redux';
import { queryModelData } from '../store/actions/models';
import { addNotification, removeNotification } from '../store/actions/notifications';

import InfiniteScroll from 'react-infinite-scroller';

class InfiniteListExample extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      loading: false,
      loadingRows: [],
      hasMore: true,
      rowsPerPage: 10,
      activePage: 1,
      totalPages: 0,
      skip: 0,
      column: this.props.sortColumn || this.props.itemTitle || 'sku',
      direction: this.props.sortDir || 'ascending',
      query: [],
      populateArray: [],
      pagination: {
        position: 'bottom',
        current: 1,
        total: 0,
        defaultPageSize: 10,
        pageSize: 10,
        hideOnSinglePage: true,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '50', '100', '250', '500'],
        size: 'small',
        onChange: (requestedPage, requestedRowsPerPage) => {
          this.handleDataFetch({ requestedPage, requestedRowsPerPage })
        },
        onShowSizeChange: (requestedPage, requestedRowsPerPage) => {
          this.handleDataFetch({ requestedPage, requestedRowsPerPage })
        },
      },
    }
  }

  componentDidMount() {
    this.handleDataFetch()
  }

  componentDidUpdate(prevProps) {
    if (!Object.is(prevProps.lastItem, this.props.lastItem)) {
      console.log('last item changed!')
      this.handleDataFetch({requestedPage: 1})
    }
  }

  handleDataFetch = async (config) => {
    let { requestedPage, requestedRowsPerPage, rowIds } = config || {}
    let rowId = Array.isArray(rowIds) ? rowIds[0] : null
    let skeletons = [1,2,3,4,5].map(n=>({_id: n+'skel', docType:'skeleton'}))
    await this.setState({
      ...rowId ? { loadingRows: [...rowIds] } : { loading: true },
      data: [...this.state.data, ...skeletons]
    })
    requestedPage = requestedPage || this.state.activePage;
    requestedRowsPerPage = requestedRowsPerPage || this.state.rowsPerPage;
    let populateArray = this.props.populateArray.map(pC => {
      const foundPc = this.state.populateArray.find(p => p.path === pC.path)
      if (foundPc) {
        return ({
          ...pC,
          ...foundPc
        })
      } else {
        return ({ ...pC })
      }
    })
    let query = this.props.filters ? [...this.state.query, ...this.props.filters] : this.state.query
    await this.props.queryModelData(this.props.queryModel, query, this.state.column, this.state.direction, requestedPage, requestedRowsPerPage, this.props.currentUser.user.company, populateArray)
      .then(({ data, activePage, totalPages, rowsPerPage, skip }) => {
        data = activePage === 1 ? data : [...this.state.data.filter(d=>d.docType !== 'skeleton'), ...data].reduce((acc,cv)=>acc.map(doc=>doc._id).indexOf(cv._id) !== -1 ? [...acc] : [...acc,cv],[])
        const hasMore = data.length >= rowsPerPage * totalPages ? false : true
        this.setState({
          skip,
          data,
          activePage,
          totalPages,
          rowsPerPage,
          hasMore,
          pagination: {
            ...this.state.pagination,
            current: activePage,
            total: rowsPerPage * totalPages,
            pageSize: rowsPerPage,
          },
        })
      })
      .catch(err => {
        message.error('Error getting data');
        console.log(err)
      })
    this.setState({
      ...rowId ? { loadingRows: [] } : { loading: false }
    })
  }

  handleInfiniteOnLoad = async () => {
    let data = this.state.data;
    await this.setState({
      loading: true,
      activePage: this.state.activePage + 1,
    });
    if (!this.state.hasMore) {
      // this.props.id && message.config({
      //   getContainer: () => document.getElementById(this.props.id),
      // });
      // message.warning(this.props.noMoreText || 'All records loaded',8000);
      this.props.addNotification({
        nType: 'notification',
        id: 'scan-log-no-more',
        message: this.props.noMoreText || 'All records loaded',
        onClose: ()=>this.props.removeNotification({id: 'scan-log-no-more',})
      })
      this.setState({
        loading: false,
      });
      return;
    }
    this.handleDataFetch()
  }

  render() {
    return (
      <div className="contain" style={{height: this.props.height || 300,}}>
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          loadMore={this.handleInfiniteOnLoad}
          hasMore={!this.state.loading && this.state.hasMore}
          useWindow={false}
        >
          <List
            size="small"
            dataSource={this.state.data}
            renderItem={item => 
            this.props.renderItem ?
                this.props.renderItem(item, this.state.loading)
              :
              <List.Item key={item._id}>
                <Skeleton paragraph={{ rows: 1, width: '100%' }} title={false} loading={this.state.loading} active>
                <List.Item.Meta
                  style={{alignItems: 'center'}}
                  avatar={<Avatar>{this.props.currentUser.user.email[0]}</Avatar>}
                  title={this.props.itemTitle.split('.').reduce((p, c) => p && p[c] || null, item)}
                  description={this.props.itemDescription.split('.').reduce((p, c) => p && p[c] || null, item)}
                />
                <div>
                  {this.props.itemContent.split('.').reduce((p, c) => p && p[c] || null, item)}
                </div>
                </Skeleton>
              </List.Item>
            }
          >
            {/* {this.state.loading && this.state.hasMore && (
              <div className="flex justify-content-center align-items-center" style={{width: '100%', height: '100%'}}>
                <Spin />
              </div>
            )} */}
          </List>
        </InfiniteScroll>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors,
  };
}

export default connect(mapStateToProps, { queryModelData, addNotification, removeNotification })(InfiniteListExample);
