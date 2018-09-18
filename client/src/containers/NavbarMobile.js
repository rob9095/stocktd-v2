import React, { Component } from 'react';
import { Layout, Menu, Icon, Row, Col, Popover, Input, Timeline } from 'antd';
import RightDrawer from './RightDrawer';
import NavMenu from './NavMenu';
const SubMenu = Menu.SubMenu;
const { Header } = Layout;

const menuSvg = () => (
  <svg viewBox="0 0 50 50" width="1em" height="1em">
  <g id="surface1">
  <path d="M 0 9 L 0 11 L 50 11 L 50 9 Z M 0 24 L 0 26 L 50 26 L 50 24 Z M 0 39 L 0 41 L 50 41 L 50 39 Z "/>
  </g>
  </svg>
)

const MenuIcon = props => (
  <span className="custom-icon">
    <Icon component={menuSvg} {...props} />
  </span>
);


class NavbarMobile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: this.props.collapsed,
      drawerOpen: false,
      showMore: false,
    }
  }
  static getDerivedStateFromProps(props,state) {
    if (props.collapsed !== state.collapsed) {
      return {
        collapsed: !state.collapsed,
      }
    } else {
      return null;
    }
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
    this.props.onSiderToggle()
  }
  toggleDrawer = () => {
    this.setState({
      drawerOpen: !this.state.drawerOpen,
    })
  }
  toggleShowMore = () => {
    this.setState({
      showMore: !this.state.showMore,
    })
  }
  render() {
    return(
      <span>
        <Header className="stkd-navbar">
          <Row className={this.state.collapsed ? 'dash-menu-container-mobile' : 'dash-menu-container-mobile open'}>
            {this.state.drawerOpen && (
              <RightDrawer
                onClose={this.toggleDrawer}
              />
            )}
            <Col span={8}>
              <Icon
                className="sidebar-trigger"
                type={this.state.collapsed ? 'double-right' : 'double-left'}
                onClick={this.toggle}
              />
            </Col>
            <Col span={8} className="center-a">
              logo
            </Col>
            <Col span={8} className="right-a">
              <span className="icon-nav primary-hover">
                <MenuIcon
                  onClick={this.toggleDrawer}
                />
              </span>
              <span className="icon-nav primary-hover">
                <Icon onClick={this.toggleShowMore} type="ellipsis" className="rotate-90" />
              </span>
            </Col>
          </Row>
        </Header>
        {this.state.showMore && (
          <Row className={this.state.collapsed ? "mobile show-more center-a" : "mobile show-more center-a sider-open"}>
            <Col span={24}>
              <Popover trigger="click" arrowPointAtLeft placement="bottomLeft" content={(
                <div className="drop-search mobile">
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
              <Popover className="notifications-popover" placement={this.props.clientWidth <= 399 ? 'bottom' : 'bottomRight' } trigger="click" content={(
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
        )}
      </span>
    )
  }
}

export default NavbarMobile;
