import React, { Component } from 'react';
import { Alert, Form, Button, Icon, Input } from 'antd';
import { Link } from 'react-router-dom';

const FormItem = Form.Item;

class ForgotPassword extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  handleBack = () => {
    this.props.history.goBack();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { errors, history, removeError } = this.props;
    history.listen(() => {
      removeError();
    });
    return(
      <div className="centered-container center-a">
        <Form onSubmit={this.handleSubmit} className="reset-pass-form">
          <h1>Reset Password</h1>
          {errors.message && (
            <Alert
              message={errors.message}
              type="error"
              closable
              afterClose={this.handleClose}
            />
          )}
          <p>Please enter your email and we will send a link to reset your password.</p>
          <FormItem>
            {getFieldDecorator('email', {
              rules: [{ type: 'email', required: true, message: 'Email is required' }],
            })(
              <Input prefix={<Icon type="mail" theme="twoTone" twoToneColor="#716aca"/>} placeholder="Email" />
            )}
          </FormItem>
          <FormItem className="form-actions">
            <Button type="primary" htmlType="submit" className="reset-pass-form-button">
              Reset Password
            </Button>
            <div className="reset-pass-form-or">
              <Link to="/signin">Back to Log in</Link>
            </div>
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

export default WrappedForgotPassword;
