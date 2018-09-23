import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const shipSvg = () => (
  <svg viewBox="0 0 467.2 467.2" width="1em" height="1em" fill="currentColor">
    <g>
    	<g>
    		<path d="M455.146,120.9l-91.7-116.3c-2.3-2.9-5.7-4.6-9.4-4.6h-240.8c-3.7,0-7.1,1.7-9.4,4.6l-91.7,116.3
    			c-1.7,2.1-2.6,4.7-2.6,7.4v326.9c0,6.6,5.4,12,12,12h424.1c6.6,0,12-5.4,12-12V128.3C457.746,125.6,456.846,123,455.146,120.9z
    			 M422.546,118.3h-176.9V24h102.6L422.546,118.3z M119.046,24h102.6v94.3h-176.9L119.046,24z M33.546,443.2V142.3h400.1v300.9
    			L33.546,443.2L33.546,443.2z"/>
    		<path d="M290.546,238.9l-80.4,80.4l-33.4-33.4c-4.7-4.7-12.3-4.7-17,0s-4.7,12.3,0,17l41.9,41.9c2.3,2.3,5.4,3.5,8.5,3.5
    			s6.1-1.2,8.5-3.5l88.8-88.8c4.7-4.7,4.7-12.3,0-17C302.846,234.2,295.246,234.2,290.546,238.9z"/>
    	</g>
    </g>
  </svg>
)

const ShipIcon = props => (
  <span className="custom-icon">
    <Icon component={shipSvg} {...props} />
  </span>
);

class NavMenu extends Component {
  state = {
    current: '',
  }

  handleClick = (e) => {
    this.setState({
      current: e.key,
    });
  }

  render() {
    return (
      <Menu className="stkd-menu" onClick={this.handleClick} mode="horizontal">
        <SubMenu key="actions" title={<span><Icon type="rocket" /><span>Actions</span></span>}>
          <Menu.Item key="orders"><Icon type="info-circle" theme="outlined" /> Unshipped Orders</Menu.Item>
          <Menu.Item key="adjust"><Icon type="tool" theme="outlined" /> Adjust Quantity</Menu.Item>
          <Menu.Item key="scan"><Icon type="barcode" theme="outlined" /> Scan Inventory</Menu.Item>
          <Menu.Item key="addOrders"><Icon type="shopping-cart" theme="outlined" /> Add Orders</Menu.Item>
          <Menu.Item key="addProducts"><Icon type="diff" theme="outlined" /> Add Products</Menu.Item>
        </SubMenu>
        <SubMenu key="reports" title={<span><Icon type="fund" /><span>Reports</span></span>}>
          <Menu.Item key="sales"><Icon type="shopping" theme="outlined" /> Sales</Menu.Item>
          <Menu.Item key="inventory"><Icon type="tags" theme="outlined" /> Inventory</Menu.Item>
          <Menu.Item key="shipping"><ShipIcon /> Shipping</Menu.Item>
        </SubMenu>
        <SubMenu key="settings" title={<span><Icon type="sliders" /><span>Settings</span></span>}>
          <Menu.Item key="account"><Icon type="user" theme="outlined" /> My Account</Menu.Item>
          <Menu.Item key="billing"><Icon type="credit-card" theme="outlined" /> Billing</Menu.Item>
          <Menu.Item key="notifications"><Icon type="bell" theme="outlined" /> Notifications</Menu.Item>
          <Menu.Item key="permisssions"><Icon type="team" theme="outlined" /> Permisssions</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

export default NavMenu;
