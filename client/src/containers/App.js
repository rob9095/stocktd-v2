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
      collapsed: clientWidth <= 600 ? true : this.state.collapsed,
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
          <Menu theme="dark" mode="inline">
            <Menu.Item className="stkd-dark menu-item" key="dashboard">
              <Icon type="appstore" theme="outlined" />
              <span>Dashboard</span>
            </Menu.Item>
            <SubMenu
              className="stkd-dark menu-item"
              key="orders"
              title={<span><Icon type="shopping-cart" theme="outlined" /><span>Orders</span></span>}
            >
              <Menu.Item className="stkd-dark sub-menu-item" key="openOrders">Open Orders</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="orderHistory">Order History</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="addOrder">Add Order</Menu.Item>
            </SubMenu>
            <SubMenu
              className="stkd-dark menu-item"
              key="products"
              title={<span><Icon type="tags" theme="outlined" /><span>Inventory</span></span>}
            >
              <Menu.Item className="stkd-dark sub-menu-item" key="manageProducts">Manage Products</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="updateQuantity">Update Quantity</Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="scanner">Scanner</Menu.Item>
            </SubMenu>
            <Menu.Item className="stkd-dark menu-item" key="purchaseOrders">
              <Icon type="file-done" theme="outlined" />
              <span>Purhcase Orders</span>
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
              <Content className="container" style={{padding: '100px 30px 0 30px'}}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                  <Breadcrumb.Item>User</Breadcrumb.Item>
                  <Breadcrumb.Item>Bill</Breadcrumb.Item>
                </Breadcrumb>
                <Row>
                  <Col lg={24} xl={8}>
                    <div className="stkd-content" style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                      Bill is a cat.
                    </div>
                  </Col>
                  <Col lg={24} xl={8}>
                    <div className="stkd-content" style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                      Bill is a cat.
                    </div>
                  </Col>
                  <Col lg={24} xl={8}>
                    <div className="stkd-content" style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                      Bill is a cat.
                    </div>
                  </Col>
                </Row>
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
