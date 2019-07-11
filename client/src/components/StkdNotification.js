import React, { Component } from 'react';
import { notification, Alert, message, Modal, Drawer } from 'antd';

class StkdNotification extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    const { config, nType } = this.props
    switch (nType) {
      case 'alert':
        return <Alert {...config} />
      case 'notification':
        notification.open(config)
        return <div />
      case 'message':
        message.open(config)
        return <div />
      case 'modal':
        return <Modal {...config}>{config.content}</Modal>
      case 'drawer':
        return <Drawer {...config}>
                {config.content}
              </Drawer>
      default:
        return <Alert {...config} banner />
    }
  }
}

export default StkdNotification