import React from 'react';
import { Button, Icon } from 'antd';

const UserCard = ({currentUser}) => (
  <div className="user-card-container">
    <div className="user-card-menu">
      <div className="ant-menu-item">
        <span>
          <Icon type="idcard" theme="twoTone" twoToneColor="#716aca" />
          <span>My Account</span>
        </span>
      </div>
      <div className="ant-menu-item">
        <span>
          <Icon type="thunderbolt" theme="twoTone" twoToneColor="#716aca" />
          <span>Activity</span>
        </span>
      </div>
      <div className="ant-menu-item">
        <span>
          <Icon type="mail" theme="twoTone" twoToneColor="#716aca" />
          <span>Messages</span>
        </span>
      </div>
      <div style={{height: 1}} />
      <div className="ant-menu-item">
        <span>
          <Icon type="question-circle" theme="twoTone" twoToneColor="#716aca" />
          <span>FAQ</span>
        </span>
      </div>
      <div className="ant-menu-item">
        <span>
          <Icon type="message" theme="twoTone" twoToneColor="#716aca" />
          <span>Help</span>
        </span>
      </div>
      <div style={{height: 10}} />
      <Button block type="primary">Logout</Button>
    </div>
  </div>
)

export default UserCard;
