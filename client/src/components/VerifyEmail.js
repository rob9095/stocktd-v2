import React, { Component } from 'react'
import { Spin, Icon } from 'antd';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { verifyUserEmail } from '../store/actions/account';
import NotFound from './NotFound';

class VerifyEmail extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  async componentDidMount() {
    this._isMounted = true
    let token = this.props.match.params.token
    if (token.match(/^[0-9a-fA-F]{24}$/)) {
      let user = this.props.currentUser.user
      await this.props.verifyUserEmail(token, user)
      .then(res=>{})
      .catch(err=>{console.log(err)})
      this.setState({
        redirect: {
          ...user.id ? {to: '/app/account'} : {to: '/signin'}
        }
      })
    } else {
      this.setState({
        notFound: true,
      })
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    if (this.state.redirect) {
      return <Redirect {...this.state.redirect} />
    }
    if (this.state.notFound) {
      return <NotFound />
    }
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

export default connect(mapStateToProps, { verifyUserEmail })(VerifyEmail);