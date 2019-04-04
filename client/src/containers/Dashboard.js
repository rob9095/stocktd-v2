import React, { Component } from 'react';
import { Switch, Route, withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Layout, Menu, Icon, Breadcrumb, Row, Col } from 'antd';
import Navbar from './Navbar';
import NavbarMobile from './NavbarMobile';
import NotFound from '../components/NotFound';
import ProductTable from '../components/ProductTable';
import PurchaseOrderTable from '../components/PurchaseOrderTable';
import PoProductTable from '../components/PoProductTable';
import ProductTableLegacy from '../components/ProductTableLegacy';
import ReceiveInventory from '../components/ReceiveInventory';
const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: true,
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

  componentDidMount() {
    if(!this.props.currentUser.isAuthenticated) {
      this.setState({
        loginRedirect: true,
        redirectPath: '/signin',
      })
    }
    this.setState({
      clientWidth: document.documentElement.clientWidth,
    })
    if (this.props.history.location.pathname){
      this.setActiveMenuItem(this.props.location.pathname)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setActiveMenuItem(nextProps.location.pathname)
    }
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
            <Menu onClick={this.handleMenuClick} theme="dark" mode="inline" selectedKeys={this.state.activeMenuItems}>
              <Menu.Item className="stkd-dark menu-item" key="appHome">
                <Icon type="appstore" theme="outlined" />
                <span>Dashboard</span>
              </Menu.Item>
              <SubMenu
                className="stkd-dark menu-item"
                key="orders"
                title={<span><Icon type="shopping-cart" theme="outlined" /><span>Orders</span></span>}
              >
                <Menu.Item className="stkd-dark sub-menu-item" key="orders">Open Orders</Menu.Item>
                <Menu.Item className="stkd-dark sub-menu-item" key="order-history">Order History</Menu.Item>
                <Menu.Item className="stkd-dark sub-menu-item" key="add-order">Add Order</Menu.Item>
              </SubMenu>
              <SubMenu
                className="stkd-dark menu-item"
                key="products"
                title={<span><Icon type="tags" theme="outlined" /><span>Inventory</span></span>}
              >
                <Menu.Item className="stkd-dark sub-menu-item" key="products">Manage Products</Menu.Item>
                <Menu.Item className="stkd-dark sub-menu-item" key="purchase-orders">Update Quantity</Menu.Item>
                <Menu.Item className="stkd-dark sub-menu-item" key="receive-inventory">Receive Inventory</Menu.Item>
              </SubMenu>
              <Menu.Item className="stkd-dark menu-item" key="purchase-orders">
                <Icon type="file-done" theme="outlined" />
                <span>Purchase Orders</span>
              </Menu.Item>
            </Menu>
          </Sider>
        </div>
        <div id="app-content" className="app-column">
          <div className="top">
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
          <div className="bottom">
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
              <Route exact path="/app/receive-inventory" render={props => (
                <ReceiveInventory {...props} />
              )} />
              <Route exact path="/app" render={props => (
                <div>
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
                </div>
              )} />
              <Route render={props => <NotFound currentUser={this.props.currentUser} {...props} />} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
	return {
		currentUser: state.currentUser,
		errors: state.errors
	};
}

export default withRouter(connect(mapStateToProps, {})(Dashboard));
