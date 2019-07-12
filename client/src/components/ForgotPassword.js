import React, { Component } from 'react';
import { Alert, Form, Button, Icon, Input, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { resetPassword } from '../store/actions/account';
import { getAllModelDocuments } from '../store/actions/models';

const FormItem = Form.Item;

class ForgotPassword extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  fetchToken = () => {
    this.setState({
      fetching: true
    })
    //get the token id from url param
    const _id = this.props.match.params.token
    getAllModelDocuments({ model: 'UserToken', documentRef: { _id, tokenType: 'reset-pw' }, populateArray: [{path: 'user'}] })
    .then(res => {
      const [token,...rest] = res.data
      if (!token._id) throw new Error()
      this.setState({token, fetching: false})
    })
    .catch(err => {
      this.props.addError('Unable to update password becuase request expired or is invalid')
      this.setState({ fetching: false, tokenError: true })
    })
  }

  componentDidMount() {
    if (this.props.reset) {
      this.fetchToken()
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.removeError()
    // we have a saved email address in state and continue button was clicked
    if (this.state.email || this.state.tokenError) {
      this.props.history.push('/signin');
      return
    }
    this.props.form.validateFields(async (err,values)=>{
      if (err) {
        return
      }
      this.setState({
        loading: true
      })
      await this.props.resetPassword({
        ...values,
        ...this.state.token && {token: this.state.token, update: {password: values.password}}
      })
      .then(res=>{
        this.setState({
          email: values.email,
          actionComplete: true,
        })
      }).catch(err=>{
        console.log(err)
      })
      this.setState({
        loading: false
      })
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { errors, history, removeError, btnText, btnLoadingText, btnCompleteText } = this.props;
    history.listen(() => {
      removeError();
    });
    return(
      <div className="centered-container">
        <Spin spinning={this.state.fetching ? true : false}>
          <Form onSubmit={this.handleSubmit} style={{ textAlign: 'center', maxWidth: 320 }}>
            <h1>{this.props.reset ? 'Reset Password' : 'Forgot Password?'}</h1>
            {errors.message && (
              <Alert
                style={{ margin: '10px 0px' }}
                message={errors.message}
                type={errors.status}
                closable
                afterClose={() => removeError()}
              />
            )}
            {/* if there was a token error hide the form and text*/}
            {!this.state.tokenError && (
              <div>
                {this.props.reset ? 
                  this.state.actionComplete ? 
                    <p>Great, we reset your password succesfully.</p>
                    :
                    <p>Please enter a new password.</p>
                  :
                  this.state.actionComplete && this.state.email ? 
                    <p>Great, we just emailed <code>{this.state.email}</code> instructions to reset your password.</p>
                  :
                    <p>Please enter the email you signed up with and we will send a link to reset your password.</p>
                }
                {!this.state.email && (
                  <FormItem style={{ textAlign: 'left' }}>
                    {getFieldDecorator('email', {
                      rules: [{ type: 'email', required: true, message: this.props.form.getFieldValue('email') ? 'The email address is invalid' : 'Please fill out this field' }],
                      validateTrigger: 'onBlur',
                      ...this.props.reset && this.state.token && { initialValue: this.state.token.user.email }
                    })(
                      <Input disabled={this.props.reset} prefix={<Icon type="mail" theme="twoTone" twoToneColor={this.props.form.getFieldError('email') ? "#f5222d" : "#716aca"} />} placeholder="Email" />
                    )}
                  </FormItem>
                )}
                {this.props.reset && !this.state.actionComplete && (
                  <FormItem style={{ textAlign: 'left' }}>
                    {getFieldDecorator('password', {
                      rules: [{ min: 6, required: true, message: this.props.form.getFieldValue('password') ? 'Password must contain at least 6 characters' : 'This field is required' }],
                      validateTrigger: 'onBlur',
                    })(
                      <Input prefix={<Icon type="lock" theme="twoTone" twoToneColor={this.props.form.getFieldError('password') ? "#f5222d" : "#716aca"} />} type="password" placeholder="Password" disabled={this.state.token ? false : true} />
                    )}
                  </FormItem>
                )}  
              </div>
            )}
            <div className="form-actions" style={{ minWidth: 300 }}>
              <Button loading={this.state.loading} type="primary" htmlType="submit" block>
                {this.state.loading ? btnLoadingText || 'loading...' : this.state.actionComplete || this.state.tokenError ? btnCompleteText || 'Close' : btnText || 'Submit'}
              </Button>
              {(!this.state.actionComplete || this.state.tokenError) && (
                <Link to="/signin">Back to Log in</Link>
              )}
            </div>
          </Form>
        </Spin>
      </div>
    )
  }
}

const WrappedForgotPassword = Form.create()(ForgotPassword);

function mapStateToProps(state) {
	return {
		errors: state.errors,
	};
}

export default connect(mapStateToProps, { resetPassword })(WrappedForgotPassword);
