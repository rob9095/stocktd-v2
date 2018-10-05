import React, { Component } from 'react';
import { Drawer, Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;

class RightDrawer extends Component {
  state = { visible: true };

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };

  render() {
    return (
      <div>
        <Drawer
          className="right-drawer"
          title={null}
          placement="right"
          closable={true}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <SubMenu
              className="stkd-dark menu-item"
              key="sub15"
              title={<span><Icon type="rocket" /><span>Actions</span></span>}
            >
              <Menu.Item className="stkd-dark sub-menu-item" key="13">Tom</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="14">Bill</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="15">Alex</Menu.Item>
            </SubMenu>
            <SubMenu
              className="stkd-dark menu-item"
              key="sub10"
              title={<span><Icon type="fund" /><span>Reports</span></span>}
            >
              <Menu.Item className="stkd-dark sub-menu-item" key="16">Team 1</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="18">Team 2</Menu.Item>
            </SubMenu>
            <SubMenu
              className="stkd-dark menu-item"
              key="sub12"
              title={<span><Icon type="sliders" /><span>Settings</span></span>}
            >
              <Menu.Item className="stkd-dark sub-menu-item" key="26">Team 1</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="28">Team 2</Menu.Item>
            </SubMenu>
          </Menu>
        </Drawer>
      </div>
    );
  }
}

export default RightDrawer;
