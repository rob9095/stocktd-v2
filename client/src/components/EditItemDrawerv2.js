import React, { Component } from 'react';
import { Alert, Drawer, Form, Button, Col, Row, Input } from 'antd';

const FormItem = Form.Item;

class DrawerForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: true,
      alertText: '',
      alertType: '',
      showAlert: false,
     }
  }

  toggle = () => {
    this.setState({
      visible: !this.state.visible,
    });
    this.props.onClose();
  };

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

  handleSubmit = (e) => {
    e.preventDefault();
    this.hideAlert();
    this.props.form.validateFields((err, inputs) => {
      console.log('Received values of form: ', inputs);
      // fitler out any empty entries or equal selects
      if (inputs.sku === '' || inputs.sku === undefined) {
        this.handleAlert('SKU cannot be blank', 'error')
        return
      }
      // fitler out any empty entries or values that are the same
      const values = Object.entries(inputs).filter(val=>val[1] !== undefined && val[1] !== this.props.item[val[0]])
      if (values.length === 0) {
        this.handleAlert('No Updates Found','warning');
        return
      }
      let update = {
        id: this.props.item._id,
      }
      for (let val of values) {
        update = {
          ...update,
          [val[0]]: val[1],
        }
      }
      console.log(update)
      this.props.onSave(this.props.create ? [inputs] : [update])
      .then(res=>{
        this.handleAlert('Changes Saved','success')
      })
      .catch(err=>{
        console.log(err)
        this.handleAlert(err[0],'error')
      })
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let item = this.props.item
    let inputs = this.props.inputs.map(i=>{
      return (
        <Col xs={i.span*3} sm={i.span} key={i.id}>
          <FormItem label={`${i.text}`}>
            {getFieldDecorator(i.id, { initialValue: item[i.id] }, {
               rules: [{
                 required: i.required,
                 message: i.message,
               }],
             })(
               i.type === 'textarea' ?
                 <Input.TextArea
                   rows={i.textRows}
                   placeholder={i.text}
                 />
                 :
                 <Input
                   type={i.type}
                   placeholder={i.text}
                 />
             )}
          </FormItem>
        </Col>
      )
    })
    return (
        <Drawer
          title={this.props.title}
          width={document.documentElement.clientWidth < 720 ? '100%' : 720}
          placement="right"
          onClose={this.toggle}
          maskClosable={false}
          visible={this.state.visible}
          style={{
            height: 'calc(100% - 55px)',
            overflow: 'auto',
            paddingBottom: 53,
          }}
        >
          {this.state.showAlert && (
            <Alert style={{margin: '-10px 0px 10px 0px'}} closable afterClose={this.hideAlert} message={this.state.alertText} type={this.state.alertType} showIcon />
          )}

          <Form layout="vertical" onSubmit={this.handleSubmit}>
            <Row gutter={24}>{inputs}</Row>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px',
              }}
            >
              <Button
                style={{
                  marginRight: 8,
                }}
                onClick={this.toggle}
                icon="close"
              >
                Cancel
              </Button>
              <Button htmlType="submit" onClick={this.handleSubmit} type="primary" icon="save">Save</Button>
            </div>
          </Form>
        </Drawer>
    );
  }
}

const EditItemDrawerv2 = Form.create()(DrawerForm);
export default EditItemDrawerv2;