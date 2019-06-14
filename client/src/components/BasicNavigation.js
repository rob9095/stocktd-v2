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
          <Menu.ItemGroup title={mi.title} key={mi.id || mi.title || i}>
            {mi.children.map((c, ci) => (
              <Menu.Item
                style={{paddingRight: 24}}
                key={c.id || c.title || ci}
              >
                {c.icon && c.icon}
                {c.title}
              </Menu.Item>
            ))}
          </Menu.ItemGroup>
        )
      } else {
        return (
          <Menu.Item
            key={mi.id || mi.title || i}
            style={{ paddingRight: 24 }}
          >
            {mi.icon && mi.icon}
            {mi.title}
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
        >
          {menuItems}
        </Menu>
      </div>
    );
  }
}

export default BasicNavigation