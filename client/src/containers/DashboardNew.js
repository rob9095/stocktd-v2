import React, { Component } from 'react' ;
import { Switch, Route, withRouter, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../store/actions/auth';
import { Layout, Menu, Breadcrumb, Icon, Row, Col } from 'antd'
import NotFound from '../components/NotFound';
import ProductTable from '../components/ProductTable';
import ProductTableNew from '../components/ProductTableNew';
import PurchaseOrderTable from '../components/PurchaseOrderTable';
import PoProductTable from '../components/PoProductTable';
import PoProductTableNew from '../components/PoProductTableNew';
import PoTableNew from '../components/PoTableNew';
import ProductTableLegacy from '../components/ProductTableLegacy';
import ReceiveInventory from '../components/ReceiveInventory';
import ScanTable from '../components/ScanTable';
import AccountPage from '../components/AccountPage';
import StkdNotification from '../components/StkdNotification';
import DashboardHeader from '../components/DashboardHeader';
import Svg from '../svg/svgs';


const { homeSvg, basketSvg, upDown, sliders, logoWhite, stocktdLogoWhite, arrowCircle } = Svg
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

class DashboardNew extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {
      collapsed: false,
      clientWidth: 0,
      loginRedirect: false,
      activeMenuItems: [],
      openMenuKeys: [],
      siderTopMenuOptions: [
        { id: 'appHome', title: 'Home', to: "/app", icon: <Icon style={{width: 14}} component={homeSvg} />, },
        { title: 'Orders', icon: <Icon style={{width: 14}} component={basketSvg} />, },
        {
          type: 'subMenu', title: 'Inventory', icon: <Icon style={{width: 14}} component={upDown} />, children: [
            { title: 'Products', },
            { title: 'Scans', },
            { title: 'Purchase Orders', },
            { title: 'Receive Inventory', },
            { title: 'PO Products', id: 'po-products', hidden: true},
          ]
        },
        {
          type: 'subMenu', title: 'Settings', icon: <Icon style={{width: 14}} component={sliders} />, children: [
            { title: 'Account', },
          ]
        },
      ],
    }
  }

  setActiveMenuItem = (pathname) => {
    let pathArr = pathname.split('/');
    let activeMenuItems = pathArr.map(arg => {
      if (arg === 'app' && pathArr.length === 2) {
        return arg + 'Home';
      } else {
        return arg.replace(' ','-').toLowerCase()
      }
    })
    let openMenuKeys = this.state.openMenuKeys
    for (let arg of activeMenuItems) {
      let foundParent = this.state.siderTopMenuOptions.find(op => op.children && op.children.filter(c => c.title.toLowerCase().replace(' ', '-') === arg || c.id === arg).length)
      if (foundParent) {
        let key = foundParent.id || foundParent.title.toLowerCase().replace(' ', '-')
        //openMenuKeys.push(foundParent.id || foundParent.title.toLowerCase().replace(' ', '-'))
        openMenuKeys = [...openMenuKeys.filter(k => k !== key), key]
      }
    }
    this.setState({
      activeMenuItems,
      openMenuKeys,
    })
  }

  checkAuth = () => {
    if (!this.props.currentUser.isAuthenticated && this._isMounted) {
      console.log('check auth failed!')
      console.log({currentUser: this.props.currentUser})
      this.setState({
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
    this.setActiveMenuItem(this.props.location.pathname)
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
    if (this.state.loginRedirect) {
      return (
        <Redirect to={this.state.redirectPath} />
      )
    }
    let siderTopMenuItems = this.state.siderTopMenuOptions.map((mi, i) => {
      let to = mi.to || "/app/" + mi.title.toLowerCase().replace(' ','-')
      let miKey = mi.id || mi.title.toLowerCase().replace(' ', '-') || i 
      if (mi.type === 'subMenu') {
        return (
          <SubMenu
            key={miKey}
            title={<span>{mi.icon && mi.icon}<span>{mi.title}</span></span>}
          >
            {mi.children.map((c, ci) => {
              let cTo = c.to || "/app/" + c.title.toLowerCase().replace(' ', '-')
              let cKey = c.id || c.title.toLowerCase().replace(' ','-') || ci
              return <Menu.Item
                style={{...c.hidden && {display: 'none'}}}
                key={cKey}
              >
                <Link to={cTo}>
                  {c.icon && c.icon}
                  {c.title}
                </Link>
              </Menu.Item>
            })}
          </SubMenu>
        )
      } else {
        return (
          <Menu.Item
            key={miKey}
          >
            <Link to={to}>
              {mi.icon && mi.icon}
              <span>{mi.title}</span>
            </Link>
          </Menu.Item>
        )
      }
    })
    return(
      <Layout style={{overflow: 'hidden'}}>
        {this.props.notifications.length > 0 && (
          this.props.notifications.map((n, i) => (
            <StkdNotification key={n.id + i} config={n} nType={n.nType} />
          ))
        )}
        <DashboardHeader {...this.props} />
        <Layout>
          <Sider
            width="200"
            collapsedWidth={this.state.clientWidth >= 1000 ? '80' : '0'}
            className="stkd-sidebar"
            trigger={null}
            collapsible
            collapsed={this.state.collapsed}
          >
            <div className="flex space-between flex-col" style={{height: '99%'}}>
              <Menu onOpenChange={(openMenuKeys)=>this.setState({openMenuKeys})} theme="light" mode="inline" openKeys={this.state.collapsed ? [] : this.state.openMenuKeys} selectedKeys={this.state.activeMenuItems}>
                {siderTopMenuItems}
                {/* <Menu.Item key="appHome">
                  <Link to="/app">
                    <Icon component={homeSvg} />
                    <span>Home</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key="orders">
                  <Icon component={basketSvg} />
                  <span>Orders</span>
                </Menu.Item>
                <SubMenu
                  key="products"
                  title={<span><Icon component={upDown} /><span>Inventory</span></span>}
                >
                  <Menu.Item key="products-new">Products</Menu.Item>
                  <Menu.Item key="scans">Scans</Menu.Item>
                  <Menu.Item key="purchase-orders">Purchase Orders</Menu.Item>
                  <Menu.Item key="receive-inventory">Receive Inventory</Menu.Item>
                </SubMenu>
                <SubMenu
                  key="settings"
                  title={<span><Icon component={sliders} /><span>Settings</span></span>}
                >
                  <Menu.Item className="stkd-dark sub-menu-item" key="account">Account</Menu.Item>
                </SubMenu>
              </Menu> */}
              </Menu>
              <Menu>
                <Menu.Item onClick={this.toggle}>
                  <Icon style={{width: 12,...this.state.collapsed && { transform: 'rotate(180deg)' }}} component={arrowCircle} />
                  <span>{this.state.collapsed ? 'Expand' : 'Collapse'}</span>
                </Menu.Item>
              </Menu>
            </div>
          </Sider>
          <Layout style={{overflow: 'auto', background: '#fefefe', height: '100%' }}>
            <div style={{height: '100%'}}>
              <Switch>
                <Route exact path="/app/po-products-old" render={props => (
                  <PoProductTable showHeader {...props} />
                )} />
                <Route exact path="/app/po-products" render={props => (
                  <PoProductTableNew {...props} />
                )} />
                <Route exact path="/app/po-products/:po" render={props => (
                  <PoProductTableNew {...props} />
                )} />
                <Route exact path="/app/purchase-orders-old" render={props => (
                  <PurchaseOrderTable {...props} />
                )} />
                <Route exact path="/app/purchase-orders" render={props => (
                  <PoTableNew {...props} />
                )} />
                <Route exact path="/app/products-old" render={props => (
                  <ProductTable {...props} />
                )} />
                <Route exact path="/app/products" render={props => (
                  <ProductTableNew {...props} />
                )} />
                <Route exact path="/app/receive-inventory" render={props => (
                  <ReceiveInventory {...props} />
                )} />
                <Route exact path="/app/scans" render={props => (
                  <ScanTable {...props} />
                )} />
                <Route exact path="/app/account" render={props => (
                  <AccountPage clientWidth={this.state.clientWidth} {...props} />
                )} />
                <Route exact path="/app" render={props => (
                  <div>
                    <Row>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Content
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Content
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Content
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Content
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Content
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Content
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Content
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Content
                        </div>
                      </Col>
                      <Col lg={24} xl={8}>
                        <div className="stkd-content stkd-widget" style={{ minHeight: 360 }}>
                          Content
                        </div>
                      </Col>
                    </Row>
                  </div>
                )} />
                <Route render={props => <NotFound currentUser={this.props.currentUser} {...props} />} />
              </Switch>
            </div>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}
function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors,
    notifications: state.notifications,
  };
}

export default withRouter(connect(mapStateToProps, { logout, })(DashboardNew));