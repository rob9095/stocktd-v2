import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addError, removeError } from '../store/actions/errors';
import { Link } from 'react-router-dom';
import { Alert, Form, Icon, Input, Button, Checkbox, Spin } from 'antd';

const FormItem = Form.Item;

class AuthForm extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({
      loading: true,
    })
    this.props.form.validateFields( async (err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const authType = this.props.signUp ? 'signup' : 'signin';
        await this.props.onAuth(authType, values).then(() => {
          this.props.history.push('/app');
        })
        .catch(() => {
        });
      }
      this._isMounted && this.setState({
        loading: false,
      })
    })
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  clearErrors = () => {
    this.props.removeError();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { signUp, heading, buttonText, errors, history, removeError } = this.props;
    history.listen(() => {
      errors.message && removeError();
    });
    return (
      <div className="centered-container">
        <Spin spinning={this.state.loading}>
          <Form onSubmit={this.handleSubmit} className="auth-form">
            <h1>{heading}</h1>
            {errors.message && (
              <Alert
                style={{marginBottom: '1em'}}
                message={errors.message}
                type={errors.status}
                closable
                afterClose={()=>removeError()}
              />
            )}
            <FormItem>
              {getFieldDecorator('email', {
                rules: [{ type: 'email', required: true, message: this.props.form.getFieldValue('email') ? 'The email address is invalid' : 'This field is required' }],
                validateTrigger: 'onBlur',
              })(
                <Input prefix={<Icon type="mail" theme="twoTone" twoToneColor={this.props.form.getFieldError('email') ? "#f5222d" : "#716aca"}/>} placeholder="Email" />
              )}
            </FormItem>
            {signUp && (
              <FormItem>
                {getFieldDecorator('company', {
                  rules: [{ required: true, message: 'This field is required' }],
                  validateTrigger: 'onBlur',
                })(
                  <Input prefix={<Icon type="shop" theme="twoTone" twoToneColor={this.props.form.getFieldError('company') ? "#f5222d" : "#716aca"} />} placeholder="Company" />
                )}
              </FormItem>
            )}
            <FormItem>
              {getFieldDecorator('password', {
                rules: [{ min: signUp ? 6 : 0, required: true, message: signUp ? 'Password must be longer than 6 characters' : 'This field is required' }],
                validateTrigger: 'onBlur',
              })(
                <Input prefix={<Icon type="lock" theme="twoTone" twoToneColor={this.props.form.getFieldError('password') ? "#f5222d" : "#716aca"} />} type="password" placeholder="Password" />
              )}
            </FormItem>
            <FormItem className="form-actions">
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true,
              })(
                <Checkbox>Remember me</Checkbox>
              )}
              <Link className="auth-form-forgot" to="/forgot-password">Forgot password</Link>
              <Button type="primary" htmlType="submit" className="auth-form-button">
                {buttonText}
              </Button>
              <div className="auth-form-or">
                {signUp ?
                  <span>Already have an account? <Link className="underline" to="/signin">Log in</Link></span>
                  :
                  <span>Don’t have an account yet? <Link className="underline" to="/signup">Sign up</Link></span>
                }
              </div>
            </FormItem>
          </Form>
        </Spin>
      </div>
    );
  }
}

const WrappedAuthForm = Form.create()(AuthForm);

function mapStateToProps(state) {
	return {
		errors: state.errors,
	};
}

export default connect(mapStateToProps, {addError, removeError})(WrappedAuthForm);
