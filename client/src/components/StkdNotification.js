import React, { Component } from 'react';
import { notification, Alert, message, Modal, Drawer } from 'antd';

class StkdNotification extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount(){
    const { config, nType } = this.props
    switch (nType) {
      case 'alert':
        this.setState({stkdNote: <Alert {...config} />})
        break;
      case 'notification':
        notification.open(config)
        this.setState({stkdNote: <div />})
        break;
      case 'message':
        message.open(config)
        this.setState({ stkdNote: <div /> })
        break;
      case 'modal':
        this.setState({ stkdNote:<Modal {...config}>{config.content}</Modal>})
        break;
      case 'drawer':
        this.setState({
          stkdNote:<Drawer {...config}>
            {config.content}
          </Drawer>
        })
        break;
      default:
        this.setState({stkdNote:<Alert {...config} banner />})
    }
  }

  render() {
    let { stkdNote = <div /> } = this.state
    return stkdNote
  }
}

export default StkdNotification