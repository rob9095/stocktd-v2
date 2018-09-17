import React, { Component } from 'react';
import { Button, Layout, Menu, Icon, Breadcrumb, Row, Col, Popover, Input, Timeline } from 'antd';
import NavMenu from './NavMenu';
import RightDrawer from './RightDrawer';
const { Header, Sider, Content, Footer } = Layout;
const SubMenu = Menu.SubMenu;

class App extends Component {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    let width = document.documentElement.clientWidth;
    return (
      <Layout>
        <Sider
          width="255"
          collapsedWidth={width >= 1000 ? '80' : '0'}
          className="stkd-sidebar"
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
        >
          {width >= 1000 ? <div className="logo" /> : null}
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
          <Header className="stkd-navbar">
            <Row>
              <Col span={1}>
                <Icon
                  className="sidebar-trigger"
                  type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                  onClick={this.toggle}
                />
              </Col>
              <Col span={15}>
                <NavMenu />
              </Col>
              <Col span={8}>
                <Popover trigger="click" placement="bottom" content={(
                  <div className="drop-search">
                    <Input
                      placeholder="Search..."
                      className="no-border"
                    />
                    <Icon type="close" />
                  </div>
                )}
                >
                  <span className="icon-nav primary-hover">
                    <Icon type="search" className="x-reverse"/>
                  </span>
                </Popover>
                <Popover className="notifications-popover" trigger="click" placement="bottom" content={(
                  <div className="drop-notifications">
                    <div className="notifications-header">
                      User Notifications
                    </div>
                    <Timeline>
                      <Timeline.Item color="green">Create a services site 2015-09-01</Timeline.Item>
                      <Timeline.Item color="green">Create a services site 2015-09-01</Timeline.Item>
                      <Timeline.Item color="red">Solve initial network problems 1</Timeline.Item>
                      <Timeline.Item>Technical testing 3 2015-09-01</Timeline.Item>
                    </Timeline>
                  </div>
                )}
                >
                  <span className="icon-nav primary-hover">
                    <Icon type="bell" />
                  </span>
                </Popover>
                <span className="icon-nav primary-hover">
                  <Icon type="user" />
                </span>
              </Col>
            </Row>
          </Header>
          <Content style={{padding: '100px 30px 0 30px'}}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb>
            <RightDrawer />
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
