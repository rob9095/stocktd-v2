import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class NavMenu extends Component {
  state = {
    current: '',
  }

  handleClick = (e) => {
    console.log('click ', e);
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
            <Menu.Item key="sales"> Sales</Menu.Item>
            <Menu.Item key="inventory"> Inventory</Menu.Item>
            <Menu.Item key="shipping"> Shipping</Menu.Item>
            {/* <SubMenu key="sub3" title="Sales">
              <Menu.Item key="7">Orders</Menu.Item>
              <Menu.Item key="8">Option 8</Menu.Item>
            </SubMenu> */}
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
