import React, { Component } from 'react';
import { Menu } from 'antd';

class BasicNavigation extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    let items = this.props.data || []
    let menuItems = items.map((mi, i) => {
      if (mi.type === 'itemGroup') {
        return (
          <Menu.SubMenu title={<span>{mi.icon}<span>{mi.title}</span></span>} key={mi.id || mi.title || i}>
            {mi.children.map((c, ci) => (
              <Menu.Item
                style={{paddingRight: 24}}
                key={c.id || c.title || ci}
              >
                {c.icon}
                {c.title}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )
      } else {
        return (
          <Menu.Item
            key={mi.id || mi.title || i}
            style={{ paddingRight: 24 }}
          >
            {mi.icon}
            <span>{mi.title}</span>
          </Menu.Item>
        )
      }
    })
    return (
      <div className="basic-menu">
        <Menu
          onSelect={(selected) => this.props.onSelect(selected)}
          style={{ border: 'none',}}
          defaultSelectedKeys={this.props.defaultSelectedKeys}
          defaultOpenKeys={this.props.defaultSelectedKeys}
          mode={this.props.mode || 'inline'}
          theme={this.props.theme || 'light'}
          inlineCollapsed={this.props.collapsed}
        >
          {menuItems}
        </Menu>
      </div>
    );
  }
}

export default BasicNavigation