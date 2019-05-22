import React from 'react'
import { Progress, Spin, Icon } from 'antd';

const CircularProgress = (props) => (
  <div style={props.style}>
    {/* <Icon type="check-circle" style={{ fontSize: 24, color: '#52c41a' }} /> */}
    {/* <Progress type="circle" percent={props.percent || '100'} status={props.status} width={24} /> */}
    {props.status ? 
      <Spin indicator={props.indicator || props.status === 'error' ? <Icon type="close" style={{ fontSize: 16, color: '#f5222d' }} /> : <Icon type="check" style={{ fontSize: 16, color: '#52c41a' }} />} />
      :
      <Spin indicator={props.indicator || <Icon type="loading" style={{ fontSize: 16 }} spin />} />
    }
    <span style={{fontSize: 'small',...props.status === 'error' && { color: '#f5222d'}}}>{props.message}</span>
  </div>
)

export default CircularProgress