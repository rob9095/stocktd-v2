import React, { Component } from 'react';
import { Switch, Route, withRouter, Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Layout, Menu, Icon, Breadcrumb, Row, Col, Popover, Input, Timeline } from 'antd';
import Navbar from './Navbar';
import NavbarMobile from './NavbarMobile';
import NotFound from '../components/NotFound';
const { Header, Sider, Content, Footer } = Layout;
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
    console.log({
      activeMenuItems,
      pathname,
    })
    console.log(this.state)
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

  render() {
    window.onresize = (e) => {
      this.handleWindowResize();
    }
    if (this.state.loginRedirect) {
      <Redirect to="/signin" />
    }
    return (
      <Layout>
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
          <Menu theme="dark" mode="inline" defaultSelectedKeys={this.state.activeMenuItems}>
            <Menu.Item className="stkd-dark menu-item" key="appHome">
              <Link to="/app">
                <Icon type="appstore" theme="outlined" />
                <span>Dashboard</span>
              </Link>
            </Menu.Item>
            <SubMenu
              className="stkd-dark menu-item"
              key="orders"
              title={<span><Icon type="shopping-cart" theme="outlined" /><span>Orders</span></span>}
            >
              <Menu.Item className="stkd-dark sub-menu-item" key="orders"><Link to="/app/orders">Open Orders</Link></Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="order-history"><Link to="/app/order-history">Order History</Link></Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="add-order"><Link to="/app/add-order">Add Order</Link></Menu.Item>
            </SubMenu>
            <SubMenu
              className="stkd-dark menu-item"
              key="products"
              title={<span><Icon type="tags" theme="outlined" /><span>Inventory</span></span>}
            >
              <Menu.Item className="stkd-dark sub-menu-item" key="products"><Link to="/app/products">Manage Products</Link></Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="purchase-orders"><Link to="/app/purchase-orders">Update Quantity</Link></Menu.Item>
              <Menu.Item className="stkd-dark sub-menu-item" key="scanner"><Link to="/app/scanner">Scanner</Link></Menu.Item>
            </SubMenu>
            <Menu.Item className="stkd-dark menu-item" key="purchase-orders">
              <Link to="/app/purchase-orders">
                <Icon type="file-done" theme="outlined" />
                <span>Purhcase Orders</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
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
                  <Route path="/app/products" render={props => (<p>products</p>)} />
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

export default withRouter(connect(mapStateToProps, {})(Dashboard));
