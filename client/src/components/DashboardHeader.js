import React, { Component } from 'react';
import { logout } from '../store/actions/auth';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Avatar, Popover, Icon, Menu } from 'antd';

class DashboardHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return(
      <div className="flex space-between align-items-center dashboard-header" style={{ color: "#fff", background: '#7933e1', height: 60, padding: '0px 15px' }}>
        {/* <img style={{ height: 30 }} src={require("../images/logo-clear-white.png")}></img> */}
        {/* <Icon component={stocktdLogoWhite} /> */}
        <div style={{ width: 140, height: 30, opacity: .3, background: '#fff' }}></div>
        <Popover placement="bottomRight" content={
          <div style={{ minWidth: 150, margin: '0px -12px' }}>
            <div className="flex align-items-center half-pad">
              <Avatar size={40} shape={"square"} style={{ backgroundColor: '#a6aed8', marginRight: 10 }}>
                <Icon type="shop" style={{ fontSize: 25, marginTop: 7 }} />
              </Avatar>
              <div style={{ fontWeight: 700 }}>
                <div style={{ fontSize: 15 }}>{this.props.currentUser.user.company}</div>
                <div style={{ color: '#a6aed8' }}>{this.props.currentUser.user.email}</div>
              </div>
            </div>
            <div>
              <Menu selectedKeys={[]} className="small-menu">
                <Menu.Item>
                 <Link to="/app/account">Account</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/app/team">Team</Link>
                </Menu.Item>
                <Menu.Item>
                  <a href="#" onClick={()=>this.props.logout()}>Logout</a>
                </Menu.Item>
              </Menu>
            </div>
          </div>
        } trigger="click">
          <div className="flex align-items-center link" style={{ padding: 10, height: '100%', fontSize: 15 }}>
            <span>{this.props.currentUser.user.company}</span>
            <Avatar icon={'user'} style={{ marginLeft: 10, backgroundColor: 'rgba(255, 255, 255, 0.33)' }} />
          </div>
        </Popover>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors,
  };
}

export default withRouter(connect(mapStateToProps, { logout })(DashboardHeader));