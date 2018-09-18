import React, { Component } from 'react';
import { Layout, Menu, Icon, Row, Col, Popover, Input, Timeline } from 'antd';
import NavMenu from './NavMenu';
const SubMenu = Menu.SubMenu;
const { Header } = Layout;

class Navbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: this.props.collapsed || true,
    }
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
    this.props.onSiderToggle()
  }
  render() {
    return(
      <Header className="stkd-navbar">
        <Row>
          <Col span={2}>
            <Icon
              className="sidebar-trigger"
              type={this.state.collapsed ? 'double-right' : 'double-left'}
              onClick={this.toggle}
            />
          </Col>
          <Col span={21} className="dash-menu-container">
            <NavMenu />
            <div className="right-menu-container">
              <Popover trigger="click" arrowPointAtRight placement="bottomRight" content={(
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
              <Popover className="notifications-popover" arrowPointAtRight trigger="click" placement="bottomRight" content={(
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
            </div>
          </Col>
          {/* <Col span={8} className="center-a">
          </Col> */}
        </Row>
      </Header>
    )
  }
}

export default Navbar;
