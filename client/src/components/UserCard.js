import React, { Component } from 'react';
import { Menu, Icon, Avatar } from 'antd';

const UserCard = ({currentUser}) => (
  <div className="user-card-container">
    <div className="user-card-header">
      <div className="avatar">
        <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
      </div>
      <div className="user-card-details">
        <h2>{currentUser.user.company}</h2>
        <h4 className="grey-color">{currentUser.user.email}</h4>
      </div>
    </div>
    <div className="user-card-menu">
      {/* <Menu>
        <Menu.Item key="account">
          <Icon type="user" theme="outlined" />
          My Account
        </Menu.Item>
        <Menu.Item key="activity">
          <Icon type="sync" theme="outlined" />
          Activity
        </Menu.Item>
        <Menu.Item key="messages">
          <Icon type="mail" theme="outlined" />
          Messages
        </Menu.Item>
        <div />
        <Menu.Item key="faqs">
          <Icon type="question-circle" theme="outlined" />
          FAQ
        </Menu.Item>
        <Menu.Item key="help">
          <Icon type="message" theme="outlined" />
          Get Help
        </Menu.Item>
      </Menu> */}
    </div>
  </div>
)

export default UserCard;
