import React, { Component } from 'react';
import { Modal, Form, Row, Col, Input } from 'antd';
import { upsertModelDocuments } from '../store/actions/models';

const FormItem = Form.Item;

class ModalForm extends Component {
  constructor(props) {
    super(props)
    this.state = { visible: true }
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
      upsertModelDocuments('BoxPrefix', [data], this.props.currentUser.company)
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let inputs = this.props.inputs.map(i=>{
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
            <Row gutter={24}>{inputs}</Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

const InsertDataModal = Form.create()(ModalForm);
export default InsertDataModal