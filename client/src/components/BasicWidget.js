import React, { Component } from 'react';
import { Skeleton, Empty } from 'antd'

const headerStyles = {
  background: 'rgb(248, 247, 250)',
  borderBottom: '1px solid rgb(218, 210, 224)',
  color: '#5e4e70',
  fontWeight: 600,
  textTransform: 'uppercase',
}

class BasicWidget extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }

  render() {
    let content = this.props.renderContent ? this.props.renderContent() : this.props.content || <Empty description={'Nothing to see here'} />
    return(
      <div className="stkd-widget">
          <div className="half-pad" style={headerStyles}>
            <Skeleton loading={this.props.titleLoading} paragraph={false} active>
              {this.props.renderTitle ? this.props.renderTitle() : this.props.title || '404'}
            </Skeleton>
          </div>
          <div className="half-pad" style={{background: '#fff'}}>
            <Skeleton loading={this.props.loading} title={false} paragraph={{ rows: this.props.skelRows || 3, width: this.props.skelWidth || ['50%'] }} active>
              {content}
            </Skeleton>
          </div>
      </div>
    )
  }
}

export default BasicWidget