import React, { Component } from 'react'
import { Spin, Icon } from 'antd';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

class VerifyEmail extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    this._isMounted = true
    if (this.props.match.params.token.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('token good!')
    } else {
      console.log('bad token!')
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    return(
      <div className="centered-container">
        <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} tip="Verifying Email..." />
      </div>
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

export default connect(mapStateToProps, {})(VerifyEmail);