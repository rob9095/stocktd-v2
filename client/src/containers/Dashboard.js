import React, { Component } from 'react';
import { Switch, Route, withRouter, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Layout, Menu, Icon, Breadcrumb, Row, Col, Alert } from 'antd';
import { logout } from '../store/actions/auth';
import Navbar from './Navbar';
import NavbarMobile from './NavbarMobile';
import NotFound from '../components/NotFound';
import ProductTable from '../components/ProductTable';
import ProductTableNew from '../components/ProductTableNew';
import PurchaseOrderTable from '../components/PurchaseOrderTable';
import PoProductTable from '../components/PoProductTable';
import ProductTableLegacy from '../components/ProductTableLegacy';
import ReceiveInventory from '../components/ReceiveInventory';
import ScanTable from '../components/ScanTable';
import AccountPage from '../components/AccountPage';
import StkdNotification from '../components/StkdNotification';
import Svg from '../svg/svgs';
const { homeSvg, basketSvg, tags, sliders, logoWhite, stocktdLogoWhite } = Svg
const { Sider } = Layout;
const SubMenu = Menu.SubMenu;


class Dashboard extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {
      collapsed: false,
      clientWidth: 0,
      loginRedirect: false,
      activeMenuItems: [],
    }
  }

  setActiveMenuItem = async (pathname) => {
    let pathArr = pathname.split('/');
    let activeMenuItems = pathArr.map(arg=>{
      if (arg === 'app' && pathArr.length === 2) {
        return arg + 'Home';
      } else {
        return arg
      }
    })
    await this.setState({
      activeMenuItems,
    })
  }

  checkAuth = () => {
    if (!this.props.currentUser.isAuthenticated) {
      this._isMounted && this.setState({
        loginRedirect: true,
        redirectPath: '/signin',
      })
      return
    }
    //isAuthenticated is true but we don't have user id or company, can add authCheck check here. just logout for now
    const { id, company } = this.props.currentUser.user || {}
    if (!id || !company) {
      console.log('logging out')
      this.props.logout()
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.checkAuth()
    this.setState({
      clientWidth: document.documentElement.clientWidth,
    })
  }

  componentDidUpdate(prevProps) {
    if (!Object.is(prevProps.location, this.props.location)) {
      this._isMounted && this.setActiveMenuItem(this.props.location.pathname)
    }
    //if current user has changed, check the auth
    if (!Object.is(prevProps.currentUser, this.props.currentUser)) {
      this.checkAuth()
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  toggle = () => {
    this._isMounted && this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  handleWindowResize = () => {
    const clientWidth = document.documentElement.clientWidth;
    this._isMounted && this.setState({
      clientWidth,
      collapsed: clientWidth <= 600 ? true : this.state.collapsed,
    })
  }

  handleMenuClick = ({ item, key, keyPath }) => {
    if (key === 'appHome') {
      this.props.history.push(`/app`)
      return
    }
    this.props.history.push(`/app/${key}`)
  }

  render() {
    window.onresize = (e) => {
      this.handleWindowResize();
    }
    if (this.state.loginRedirect){
      return (
        <Redirect to={this.state.redirectPath} />
      )
    }
    return (
      <div style={{height: '100%', overflow: 'hidden'}}>
        <div className="flex space-between align-items-center" style={{ color: "#fff", background: '#7933e1', height: 60, padding: '0px 15px'}}>
          {/* <img style={{ height: 30 }} src={require("../images/logo-clear-white.png")}></img> */}
          {/* <Icon component={stocktdLogoWhite} /> */}
          <div />
          <div>
            options
          </div>
        </div>
        <div className="app-dashboard">
          <div id="app-sidebar" className="app-column">
            <Sider
              width="255"
              collapsedWidth={this.state.clientWidth >= 1000 ? '80' : '0'}
              className="stkd-sidebar"
              trigger={null}
              collapsible
              collapsed={this.state.collapsed}
            >
              <div className="logo">
                {/* {this.state.collapsed ? <img src={check} width='30px' /> : <img src={logo} width='130px' /> } */}
              </div>
              <Menu onClick={this.handleMenuClick} theme="light" mode="inline" selectedKeys={this.state.activeMenuItems}>
                <Menu.Item className="stkd-menu-item" key="appHome">
                  {/* <Icon type="dashboard" theme="twoTone" twoToneColor={this.state.activeMenuItems.includes("appHome") ? "#7933e1" : "#5a6195"} /> */}
                  <Icon component={homeSvg} />
                  <span>Home</span>
                </Menu.Item>
                <Menu.Item className="stkd-menu-item" key="orders">
                  <Icon component={basketSvg} />
                  <span>Orders</span>
                </Menu.Item>
                <SubMenu
                  className="stkd-dark menu-item"
                  key="products"
                  title={<span><Icon component={tags} /><span>Inventory</span></span>}
                >
                  <Menu.Item key="products-new">Products</Menu.Item>
                  <Menu.Item key="scan-table">Scans</Menu.Item>
                  <Menu.Item key="purchase-orders">Purchase Orders</Menu.Item>
                  <Menu.Item key="receive-inventory">Receive Inventory</Menu.Item>
                </SubMenu>
                <SubMenu
                  className="stkd-dark menu-item"
                  key="settings"
                  title={<span><Icon component={sliders} /><span>Settings</span></span>}
                >
                  <Menu.Item className="stkd-dark sub-menu-item" key="account">Account</Menu.Item>
                </SubMenu>
              </Menu>
            </Sider>
          </div>
          <div id="app-content" className="app-column">
            {this.props.notifications.length > 0 && (
              this.props.notifications.map((n,i)=>(
                <StkdNotification key={n.id+i} config={n} nType={n.nType} />
              ))
            )}
            <div className="top" style={{}}>
              {this.state.clientWidth >= 1000 ?
                <Navbar
                  onSiderToggle={this.toggle}
                  collapsed={this.state.collapsed}
                  clientWidth={this.state.clientWidth}
                  currentUser={this.props.currentUser}
                />
                :
                <NavbarMobile
                  onSiderToggle={this.toggle}
                  collapsed={this.state.collapsed}
                  clientWidth={this.state.clientWidth}
                  currentUser={this.props.currentUser}
                />
              }
            </div>
            <div className="app-body" className="full-pad">
              <Switch>
                <Route exact path="/app/po-products" render={props => (
                  <PoProductTable showHeader {...props} />
                )} />
                <Route exact path="/app/purchase-orders" render={props => (
                  <PurchaseOrderTable {...props} />
                )} />
                <Route exact path="/app/products" render={props => (
                  <ProductTable {...props} />
                )} />
                <Route exact path="/app/products-new" render={props => (
                  <ProductTableNew {...props} />
                )} />
                <Route exact path="/app/receive-inventory" render={props => (
                  <ReceiveInventory {...props} />
                )} />
                <Route exact path="/app/scan-table" render={props => (
                  <ScanTable {...props} />
                )} />
                <Route exact path="/app/account" render={props => (
                  <AccountPage {...props} />
                )} />
                <Route exact path="/app" render={props => (
                  <div>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                      <Breadcrumb.Item>User</Breadcrumb.Item>
                      <Breadcrumb.Item>Bill</Breadcrumb.Item>
                    </Breadcrumb>
                    <Row gutter={16}>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Bill is a cat.
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Bill is a cat.
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Bill is a cat.
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Bill is a cat.
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Bill is a cat.
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Bill is a cat.
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Bill is a cat.
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Bill is a cat.
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Bill is a cat.
                        </div>
                      </Col>
                    </Row>
                  </div>
                )} />
                <Route render={props => <NotFound currentUser={this.props.currentUser} {...props} />} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
	return {
		currentUser: state.currentUser,
    errors: state.errors,
    notifications: state.notifications,
	};
}

export default withRouter(connect(mapStateToProps, {logout,})(Dashboard));
