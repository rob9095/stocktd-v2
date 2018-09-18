import React, { Component } from 'react';
import { Button, Layout, Menu, Icon, Breadcrumb, Row, Col, Popover, Input, Timeline } from 'antd';
import Navbar from './Navbar';
import NavbarMobile from './NavbarMobile';
const { Header, Sider, Content, Footer } = Layout;
const SubMenu = Menu.SubMenu;

class App extends Component {
  state = {
    collapsed: true,
    clientWidth: 0,
  };

  componentDidMount() {
    this.setState({
      clientWidth: document.documentElement.clientWidth,
    })
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  handleWindowResize = () => {
    const clientWidth = document.documentElement.clientWidth;
    this.setState({
      clientWidth,
      collapsed: clientWidth <= 550 ? true : this.state.collapsed,
    })
  }

  render() {
    window.onresize = (e) => {
      this.handleWindowResize();
    }
    return (
      <Layout>
        <Sider
          width="255"
          collapsedWidth={this.state.clientWidth >= 1000 ? '80' : '0'}
          className="stkd-sidebar"
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
        >
          {this.state.clientWidth >= 1000 ? <div className="logo" /> : null}
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item className="stkd-dark menu-item" key="1">
              <Icon type="pie-chart" />
              <span>Option 1</span>
            </Menu.Item>
            <Menu.Item className="stkd-dark menu-item" key="2">
              <Icon type="desktop" />
              <span>Option 2</span>
            </Menu.Item>
            <SubMenu
              className="stkd-dark menu-item"
              key="sub1"
              title={<span><Icon type="user" /><span>User</span></span>}
            >
              <Menu.Item className="stkd-dark sub-menu-item" key="3">Tom</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="4">Bill</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="5">Alex</Menu.Item>
            </SubMenu>
            <SubMenu
              className="stkd-dark menu-item"
              key="sub2"
              title={<span><Icon type="team" /><span>Team</span></span>}
            >
              <Menu.Item className="stkd-dark sub-menu-item" key="6">Team 1</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="8">Team 2</Menu.Item>
            </SubMenu>
            <Menu.Item className="stkd-dark menu-item" key="9">
              <Icon type="file" />
              <span>File</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          {this.state.clientWidth >= 1000 ?
            <Navbar
              onSiderToggle={this.toggle}
              collapsed={this.state.collapsed}
              clientWidth={this.state.clientWidth}
            />
            :
            <NavbarMobile
              onSiderToggle={this.toggle}
              collapsed={this.state.collapsed}
              clientWidth={this.state.clientWidth}
            />
          }
          <Content style={{padding: '100px 30px 0 30px'}}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
              Bill is a cat.
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2018 Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

export default App;
