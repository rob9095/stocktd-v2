import React, { Component } from 'react';
import { Alert, Modal, Form, Row, Col, Input, Skeleton } from 'antd';
import AutoCompleteInput from './AutoCompleteInput';

const FormItem = Form.Item;

class ModalForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: true,
      values: {},
    }
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
      console.log('Received values of form: ', {...data,});
      if (err) {
        return
      }
      //need to loop this.props.inputs and update nestedKeys with correct key
      for (let input of this.props.inputs) {
        if (data[input.id + input.nestedKey] !== undefined) {
          data[input.id] = data[input.id + input.nestedKey]
          delete data[input.id + input.nestedKey]
        }
      }
      const values = Object.entries(data).filter(val => val[1] !== undefined && val[1] !== '')
      if (values.length === 0) {
        this.handleAlert('No Updates found', 'warning')
        return
      }
      this.props.onSave({ ...data, })
      .then(res => {
        this.handleAlert(res.text, res.status)
      })
      .catch(err => {
        console.log(err)
        this.handleAlert(err.text, err.status)
      })
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

  handleAutoUpdate = (clicked, id, nestedKey) => {
    let poArr = id === 'currentPOs' && [clicked.data]
    this.props.form.setFieldsValue({ [id]: poArr || Array.isArray(clicked.id) && clicked.id.map(c => c.id) || clicked.data[nestedKey || id] || ''})
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let inputs = this.props.inputs.map(i=>{
      let id = i.nestedKey ? i.id + i.nestedKey : i.id
      if (i.type === 'autoComplete') {
        return (
          <Col xs={i.span*3} key={id}>
            <FormItem key={i.id} label={`${i.text}`}>
              {getFieldDecorator(id, {
                 rules: [{
                  required: i.required,
                  message: i.message,
                 }],
               })(
                 <AutoCompleteInput
                   queryModel={i.queryModel}
                   searchKey={i.nestedKey || i.searchKey || i.id}
                   placeholder={i.text}
                   mode={i.autoCompleteMode || i.mode}
                   selected={i.selected}
                   renderOption={i.renderOption || false}
                   notFound={i.notFound || false}
                   onUpdate={(clicked) => this.handleAutoUpdate(clicked, id, i.nestedKey || i.searchKey)}
                   onAddItemInputChange={(value) => this.props.form.setFieldsValue({ [id]: value })}
                   showAddOption={i.showAddOption}
                 >
                   <Input style={{ display: 'none' }} />
                 </AutoCompleteInput>
               )}
            </FormItem>
          </Col>
        )
      } else {
        return (
          <Col xs={i.span*3} key={id}>
            <FormItem key={id} label={`${i.text}`}>
              {getFieldDecorator(id, {
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