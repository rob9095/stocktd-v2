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
      <div className="stkd-widget stkd-content" style={{padding: 0}}>
        <div className="half-pad widget-header border-bottom">
          <Skeleton loading={this.props.titleLoading} paragraph={false} active>
            {this.props.renderTitle ? this.props.renderTitle() : this.props.title || ''}
          </Skeleton>
        </div>
        <div className="widget-content">
          {this.props.contentLoading ? 
          Array(contentRows).fill({}).map((s,i)=>(
            <div key={i} className="flex align-items-center" style={{ padding: '30px 30px 15px', height: 70, width: '100%', }}>
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