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
      if (inputs.sku === '') {
        delete inputs.sku
      }
      // fitler out any empty entries or values that are the same
      const values = Object.entries(inputs).filter(val=>val[1] !== undefined)
      if (values.length === 0) {
        this.handleAlert('No Updates Found','warning');
        return
      }
      let update = {
        id: this.props.product._id,
      }
      for (let val of values) {
        update = {
          ...update,
          [val[0]]: val[1],
        }
      }
      console.log(update)
      this.props.onSave([update])
      .then(res=>{
        console.log(res)
        console.log('product updated!')
      })
      .catch(err=>{
        console.log(err)
      })
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { title, sku, quantity, weight, barcode, price, supplier, brand } = this.props.product
    return (
        <Drawer
          title={this.props.title}
          width={720}
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
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem label="SKU">
                  {getFieldDecorator('sku', {
                     rules: [{
                       required: false,
                       message: '',
                     }],
                   })(
                     <Input
                       type='text'
                       placeholder={sku}
                     />
                   )}
                </FormItem>
              </Col>
              <Col span={16}>
                <FormItem label="Title">
                  {getFieldDecorator('title', {
                     rules: [{
                       required: false,
                       message: '',
                     }],
                   })(
                     <Input
                       type='text'
                       placeholder={title}
                     />
                   )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="Quantity">
                  {getFieldDecorator('quantity', {
                     rules: [{
                       required: false,
                       message: '',
                     }],
                   })(
                     <Input
                       type='number'
                       placeholder={quantity}
                     />
                   )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="Weight">
                  {getFieldDecorator('weight', {
                     rules: [{
                       required: false,
                       message: '',
                     }],
                   })(
                     <Input
                       type='number'
                       placeholder={weight}
                     />
                   )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="Price">
                  {getFieldDecorator('price', {
                     rules: [{
                       required: false,
                       message: '',
                     }],
                   })(
                     <Input
                       type='number'
                       placeholder={price}
                     />
                   )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="Barcode">
                  {getFieldDecorator('barcode', {
                     rules: [{
                       required: false,
                       message: '',
                     }],
                   })(
                     <Input
                       type='text'
                       placeholder={barcode}
                     />
                   )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="Brand">
                  {getFieldDecorator('brand', {
                     rules: [{
                       required: false,
                       message: '',
                     }],
                   })(
                     <Input
                       type='text'
                       placeholder={brand}
                     />
                   )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="Supplier">
                  {getFieldDecorator('supplier', {
                     rules: [{
                       required: false,
                       message: '',
                     }],
                   })(
                     <Input
                       type='text'
                       placeholder={supplier}
                     />
                   )}
                </FormItem>
              </Col>
              <Col span={24}>
                <Form.Item label="Description">
                  {getFieldDecorator('description', {
                    rules: [
                      {
                        required: false,
                        message: '',
                      },
                    ],
                  })(<Input.TextArea rows={4} placeholder="Description" />)}
                </Form.Item>
              </Col>
            </Row>
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

const EditItemDrawer = Form.create()(DrawerForm);
export default EditItemDrawer;
