import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import { logout } from '../store/actions/auth';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

class UserCard extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  logout = () => {
    this.props.logout()
  }
  render() {
    return (
      <div className="user-card-container">
        <div className="user-card-menu">
          <div className="ant-menu-item">
            <span>
              <Link className="no-color" to="/app/account">
                <Icon type="idcard" theme="twoTone" twoToneColor="#716aca" />
                <span>My Account</span>
              </Link>
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
          <div style={{ height: 1 }} />
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
          <div style={{ height: 10 }} />
          <Button onClick={this.logout} block type="primary">Logout</Button>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors
  };
}

export default withRouter(connect(mapStateToProps, { logout })(UserCard));
