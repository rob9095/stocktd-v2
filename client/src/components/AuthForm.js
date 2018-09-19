import React, { Component } from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';

const FormItem = Form.Item;

class AuthForm extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="auth-form-container">
        <Form onSubmit={this.handleSubmit} className="auth-form">
          <FormItem>
            {getFieldDecorator('userName', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
            )}
          </FormItem>
          <FormItem className="form-actions">
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox>Remember me</Checkbox>
            )}
            <a className="auth-form-forgot" href="">Forgot password</a>
            <Button type="primary" htmlType="submit" className="auth-form-button">
              Log in
            </Button>
            <div className="auth-form-or">
              Or <a href="">register now!</a>
            </div>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedAuthForm = Form.create()(AuthForm);

export default WrappedAuthForm;
