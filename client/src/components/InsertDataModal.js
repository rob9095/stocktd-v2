import React, { Component } from 'react';
import { Alert, Modal, Form, Row, Col, Input } from 'antd';
import AutoCompleteInput from './AutoCompleteInput';

const FormItem = Form.Item;

class ModalForm extends Component {
  constructor(props) {
    super(props)
    this.state = { visible: true}
  }

  close = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose()
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, data) => {
      console.log('Received values of form: ', data);
      if (err) {
        return
      } else {
        this.props.onSave(data)
        .then(res =>{
          this.handleAlert(res.text, res.status)
        })
        .catch(err =>{
          console.log(err)
          this.handleAlert(err.text, err.status)
        })
      }
    })
  }

  handleAlert = (alertText, alertType) => {
    this.setState({
      showAlert: true,
      alertText,
      alertType,
    })
  }

  hideAlert = () => {
    this.setState({
      showAlert: false,
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let inputs = this.props.inputs.map(i=>{
      if (i.autoComplete) {
        return (
          <Col xs={i.span*3} md={i.span} key={i.id}>
            <FormItem key={i.id} label={`${i.text}`}>
              {getFieldDecorator(i.id, {
                 rules: [{
                  required: i.required,
                  message: i.message,
                 }],
               })(
                <AutoCompleteInput
                  currentUser={this.props.currentUser}
                  queryModel={i.queryModel}
                  key={i.id}
                >
                 <Input
                   placeholder={i.text}
                   type={i.type}
                 />
                </AutoCompleteInput>
               )}
            </FormItem>
          </Col>
        )
      } else {
        return (
          <Col xs={i.span*3} md={i.span} key={i.id}>
            <FormItem key={i.id} label={`${i.text}`}>
              {getFieldDecorator(i.id, {
                 rules: [{
                  required: i.required,
                  message: i.message,
                 }],
               })(
                 <Input
                   placeholder={i.text}
                   type={i.type}
                 />
               )}
            </FormItem>
          </Col>
        )
      }
    })
    return (
      <div>
        <Modal
          title={this.props.title}
          visible={this.state.visible}
          onOk={this.handleSubmit}
          onCancel={this.close}
          okText={this.props.okText}
          cancelText={this.props.cancelText}
        >
          <Form>
            {this.state.showAlert && (
              <Alert 
                style={{margin: '-10px 0px 10px 0px'}}
                closable
                afterClose={this.hideAlert}
                message={this.state.alertText}
                type={this.state.alertType}
                showIcon
              />
            )}
            <Row gutter={24}>{inputs}</Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

const InsertDataModal = Form.create()(ModalForm);
export default InsertDataModal