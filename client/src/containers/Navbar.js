import React, { Component } from 'react';
import { Layout, Icon, Popover, Input, Timeline } from 'antd';
import NavMenu from './NavMenu';
import UserCard from '../components/UserCard';
const { Header } = Layout;

class Navbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: this.props.collapsed,
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
  render() {
    return(
      <Header className="stkd-navbar">
        <div>
          <Icon
            className="sidebar-trigger"
            type={'menu'}
            onClick={this.toggle}
          />
        </div>
        <div className={this.state.collapsed ? 'dash-menu-container' : 'dash-menu-container open'}>
          <NavMenu />
          <div className="right-menu-container">
            <Popover overlayClassName="nav-popover" trigger="click" placement="bottomRight" content={(
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
            <Popover overlayClassName="nav-popover" trigger="click" placement="bottomRight" content={(
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
            <Popover overlayClassName="nav-popover" trigger="click" placement="bottomRight" content={(
              <div className="drop-account">
                <UserCard currentUser={this.props.currentUser} />
              </div>
            )}
            >
              <span className="icon-nav primary-hover">
                <Icon type="user" />
              </span>
            </Popover>
          </div>
        </div>
      </Header>
    )
  }
}

export default Navbar;
