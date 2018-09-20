import React, { Component } from 'react';
import { Button, Menu, Icon, Avatar } from 'antd';

const UserCard = ({currentUser}) => (
  <div className="user-card-container">
    {/* <div className="user-card-header">
      <div className="avatar">
        <Avatar style={{ color: '#716aca', backgroundColor: 'rgb(243, 240, 255)' }}>{currentUser.user.company[0]}</Avatar>
      </div>
      <div className="user-card-details">
        <h2>{currentUser.user.company}</h2>
        <h4 className="grey-color">{currentUser.user.email}</h4>
      </div>
    </div> */}
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
