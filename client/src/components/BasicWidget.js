import React, { Component } from 'react';
import { Skeleton, Empty } from 'antd'

class BasicWidget extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }

  render() {
    let contentRows = this.props.contentRows || 3
    let content = this.props.renderContent ? this.props.renderContent() : this.props.content || <Empty description={'Nothing to see here'} />
    return(
      <div className="stkd-widget stkd-content" style={{padding: 0, ...this.props.style && this.props.style}}>
        <div className="half-pad widget-header border-bottom">
          <Skeleton loading={this.props.titleLoading} paragraph={false} active>
            {this.props.renderTitle ? this.props.renderTitle() : this.props.title || ''}
          </Skeleton>
        </div>
        <div className="widget-content">
          {this.props.contentLoading ? 
          Array(parseInt(contentRows)).fill({}).map((s,i)=>(
            <div key={i} className="flex align-items-center skeleton-wrapper" style={{ borderBottom: '1px solid #dee3f2', margin: 0, minHeight: 70, width: '100%', }}>
              <Skeleton paragraph={{ rows: 1, width: '100%' }} title={false} loading={true} active />
              <Skeleton paragraph={{ rows: 1, width: '100%' }} title={false} loading={true} active />
            </div>
          ))
          :
          content
          }
        </div>
      </div>
    )
  }
}

export default BasicWidget