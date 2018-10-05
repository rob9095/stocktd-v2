import React, { Component } from 'react';
import { Switch, Route, withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Layout, Menu, Icon, Breadcrumb, Row, Col } from 'antd';
import Navbar from './Navbar';
import NavbarMobile from './NavbarMobile';
import NotFound from '../components/NotFound';
import ProductTable from '../components/ProductTable';
const { Sider, Content, Footer } = Layout;
const SubMenu = Menu.SubMenu;

class DashboardLegacy extends Component {
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
      this.state({
        loginRedirect: true,
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

  handleXScroll = (e) => {
    // this.setState({
    //   collapsed: true,
    // })
    console.log(e.target)
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
    window.scrollLeft = (e) => {
      this.handleXScroll();
    }
    if (this.state.loginRedirect){
      return (
        <Redirect to={this.state.redirectPath} />
      )
    }
    return (
      <Layout hasSider>
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
              <Menu.Item className="stkd-dark sub-menu-item" key="scanner">Scanner</Menu.Item>
            </SubMenu>
            <Menu.Item className="stkd-dark menu-item" key="purchase-orders">
              <Icon type="file-done" theme="outlined" />
              <span>Purchase Orders</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className={
          this.state.clientWidth >= 1000 ?
            this.state.collapsed ? 'layout desktop' : 'layout desktop sider-open'
            :
            this.state.collapsed ? 'layout mobile' : 'layout mobile sider-open'
        }>
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
              <Content className="app-container">
                <Switch>
                  <Route path="/app-old/products" render={props => (
                    <ProductTable />
                  )} />
                  <Route exact path="/app-old" render={props => (
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
              </Content>
          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2018 Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    );
  }
}


function mapStateToProps(state) {
	return {
		currentUser: state.currentUser,
		errors: state.errors
	};
}

export default withRouter(connect(mapStateToProps, {})(DashboardLegacy));
