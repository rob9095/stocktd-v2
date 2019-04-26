import React, { Component } from 'react';
import { Layout, Menu, Icon, Row, Col, Popover, Input, Timeline } from 'antd';
import RightDrawer from './RightDrawer';
import NavMenu from './NavMenu';
import UserCard from '../components/UserCard';
const SubMenu = Menu.SubMenu;
const { Header } = Layout;

const menuSvg = () => (
  <svg viewBox="0 0 384.97 384.97" fill="currentColor" width="1em" height="1em">
    <g>
    	<g id="Menu">
    		<path d="M12.03,84.212h360.909c6.641,0,12.03-5.39,12.03-12.03c0-6.641-5.39-12.03-12.03-12.03H12.03
    			C5.39,60.152,0,65.541,0,72.182C0,78.823,5.39,84.212,12.03,84.212z"/>
    		<path d="M372.939,180.455H12.03c-6.641,0-12.03,5.39-12.03,12.03s5.39,12.03,12.03,12.03h360.909c6.641,0,12.03-5.39,12.03-12.03
    			S379.58,180.455,372.939,180.455z"/>
    		<path d="M372.939,300.758H12.03c-6.641,0-12.03,5.39-12.03,12.03c0,6.641,5.39,12.03,12.03,12.03h360.909
    			c6.641,0,12.03-5.39,12.03-12.03C384.97,306.147,379.58,300.758,372.939,300.758z"/>
    	</g>
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
        {this.state.drawerOpen && (
          <RightDrawer
            onClose={this.toggleDrawer}
          />
        )}
        <Header className="stkd-navbar">
          <div className="dash-menu-container-mobile">
            <div>
              <Icon
                className="sidebar-trigger"
                type={'menu'}
                onClick={this.toggle}
              />
            </div>
            <div>
              logo
            </div>
            <div>
              <span className="icon-nav primary-hover">
                <Icon
                  onClick={this.toggleDrawer}
                  type="menu"
                />
              </span>
              <span className="icon-nav primary-hover">
                <Icon onClick={this.toggleShowMore} type="ellipsis" className="rotate-90" />
              </span>
            </div>
          </div>
        </Header>
        {this.state.showMore && (
          <Row className="mobile show-more center-a">
            <Col span={24} className={this.state.collapsed ? '' : 'slider-open'}>
              <Popover overlayClassName="nav-popover mobile" trigger="click" arrowPointAtLeft placement="bottomLeft" content={(
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
              <Popover overlayClassName="nav-popover mobile" className="notifications-popover" placement={this.props.clientWidth <= 399 ? 'bottom' : 'bottomRight' } trigger="click" content={(
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
              <Popover overlayClassName="nav-popover mobile" trigger="click" placement="bottomRight" content={(
                <div className="drop-account">
                  <UserCard currentUser={this.props.currentUser} />
                </div>
              )}
              >
                <span className="icon-nav primary-hover">
                  <Icon type="user" />
                </span>
              </Popover>
            </Col>
          </Row>
        )}
      </span>
    )
  }
}

export default NavbarMobile;
