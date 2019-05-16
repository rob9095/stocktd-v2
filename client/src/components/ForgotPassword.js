import React, { Component } from 'react';
import { Alert, Form, Button, Icon, Input, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { resetPassword } from '../store/actions/account';

const FormItem = Form.Item;

class ForgotPassword extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.removeError()
    if (this.state.emailSent) {
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
      await this.props.resetPassword(values)
      .then(res=>{
        this.setState({
          emailSent: true,
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
    const { errors, history, removeError } = this.props;
    history.listen(() => {
      removeError();
    });
    return(
      <div className="centered-container">
        <Form onSubmit={this.handleSubmit} style={{textAlign: 'center',maxWidth: 320}}>
          <h1>Forgot Password?</h1>
          {errors.message && (
            <Alert
              style={{margin: '10px 0px'}}
              message={errors.message}
              type="error"
              closable
              afterClose={()=>removeError()}
            />
          )}
          {this.state.emailSent ?
            <p>Great, we have emailed you instructions to reset your password.</p>
          :
            <p>Please enter the email you signed up with and we will send a link to reset your password.</p>
          }
          {!this.state.emailSent && (
            <FormItem style={{ textAlign: 'left' }}>
              {getFieldDecorator('email', {
                rules: [{ type: 'email', required: true, message: this.props.form.getFieldValue('email') ? 'The email address is invalid' : 'Please fill out this field' }],
                validateTrigger: 'onBlur',
              })(
                <Input prefix={<Icon type="mail" theme="twoTone" twoToneColor={this.props.form.getFieldError('email') ? "#f5222d" : "#716aca"} />} placeholder="Email" />
              )}
            </FormItem>
          )}
          <FormItem className="form-actions">
            <Button loading={this.state.loading} type="primary" htmlType="submit" block>
              {this.state.emailSent ? 'Close' : this.state.loading ? 'Sending...' : 'Send Email'}
            </Button>
            <Link to="/signin">Back to Log in</Link>
          </FormItem>
        </Form>
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
