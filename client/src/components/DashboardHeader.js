import React, { Component } from 'react';
import { logout } from '../store/actions/auth';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Avatar, Popover, Icon, Menu, } from 'antd';
import Svg from '../svg/svgs';


const { rocketSvg, queRocketLogoSvg, stocktdLogoWhite } = Svg

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
        {/* <div className="flex align-items-center">
          <Icon component={()=>rocketSvg({color: '#fff'})} style={{ width: 18, marginRight: 5 }} />
          <Icon component={()=>queRocketLogoSvg({color: '#fff'})} style={{width: 105}} />
        </div> */}
        <div style={{ width: 140, height: 30, backgroundColor: 'rgba(255,255,255,.35)' }}></div>
        <Popover overlayClassName={'popover-no-arrow'} onVisibleChange={(profilePopover)=>this.setState({profilePopover})} className="Test" placement="bottomRight" content={
          <div style={{ minWidth: 150, maxWidth: 300, margin: '0px -12px' }}>
            <div className="flex align-items-center" style={{padding: '0px 12px 8px 12px'}}>
              <Avatar size={40} shape={"square"} style={{ backgroundColor: '#a6aed8', marginRight: 10 }}>
                <Icon type="shop" style={{ fontSize: 25, marginTop: 7 }} />
              </Avatar>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, maxWidth: 220 }} className="overflow-e">{this.props.currentUser.user.company}</div>
                <div style={{ fontSize: 14, maxWidth: 220 }} className="overflow-e">{this.props.currentUser.user.email}</div>
              </div>
            </div>
            <div>
              <Menu onSelect={({profilePopover = false}) => this.setState({ profilePopover })} selectedKeys={[]} className="small-menu">
                <Menu.Item>
                  <Link to="/app/account">Account</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/app/team">Team</Link>
                </Menu.Item>
                <Menu.Item>
                  <a href="#" onClick={() => this.props.logout()}>Logout</a>
                </Menu.Item>
              </Menu>
            </div>
          </div>
        } trigger="click" visible={this.state.profilePopover}>
          <div onClick={({profilePopover = true}) => this.setState({ profilePopover })} className="flex align-items-center link half-pad" style={{
            height: '100%', ...this.state.profilePopover && {
              background: '#0000002b'
            }}}>
            <span className="overflow-e" style={{fontWeight: 600, maxWidth: 75}}>{this.props.currentUser.user.company}</span>
            <Avatar icon={'user'} style={{ marginLeft: 10, backgroundColor: 'rgba(255,255,255,.35)' }} />
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