import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Modal, Button, Upload, Icon, message, Alert } from 'antd';
import { parseCSV, validateInputs, validateHeaders } from '../services/parseCSV';

const Dragger = Upload.Dragger;

class ImportModal extends Component {
  state = { visible: true }

  toggle = () => {
    this.setState({
      visible: !this.state.visible,
    });
    this.props.onClose();
  }

  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
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

  handleFileUpload = async (e) => {
    this.hideAlert();
    this.setState({
      loading: true,
    })
    this.props.parseCSV(e)
    .then(async ({json, jsonLowerCase}) => {
      console.log(jsonLowerCase)
      let headerCheck = await this.props.validateHeaders(jsonLowerCase, this.props.headers)
      console.log(headerCheck)
      if (headerCheck.errorType === 'warning') {
        let list = headerCheck.errorList.map((e,i)=>(
          <li key={i}>{e}</li>
        ))
        //display warnings
        this.setState({
          showAlert: true,
          alertType: headerCheck.errorType,
          errorHeader: headerCheck.errorHeader,
          alertText: <ul>{list}</ul>,
          submitButtonText: 'Submit File with Warnings',
        })
      }
      let inputCheck = await this.props.validateInputs(jsonLowerCase, this.props.validInputs)
      if (inputCheck.isValid) {
        console.log({
          showCompleteImportButton: true,
          json,
          submitButtonText: 'Submit File',
          loading: false,
        })
      }
    })
    .catch(err => {
      let list = err.errorList.map((e,i)=>(
        <li key={i}>{e}</li>
      ))
      console.log({
        showAlert: true,
        alertType: err.errorType,
        errorHeader: err.errorHeader,
        alertText: <ul>{list}</ul>,
        showCompleteImportButton: false,
        loading: false,
      })
    })
  }

  render() {
    const draggerProps = {
      name: 'file',
      multiple: false,
      customRequest: this.handleFileUpload,
      onChange(info) {
        const status = info.file.status;
        if (status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          Open Modal
        </Button>
        <Modal
          title={this.props.title}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.toggle}
        >
          {this.state.showAlert && (
            <Alert style={{margin: '-10px 0px 10px 0px'}} closable afterClose={this.hideAlert} message={this.state.alertText} type={this.state.alertType} showIcon />
          )}
          <label htmlFor="upload">
            <div className="ant-upload ant-upload-drag">
              <span className="ant-upload ant-upload-btn">
                <input
                  hidden
                  id="upload"
                  type="file"
                  onChange={(event)=> {
                    this.handleFileUpload(event)
                  }}
                  onClick={(event)=> {
                    event.target.value = null
                  }}
                />
                <p className="ant-upload-drag-icon">
                  <Icon type="file-add" theme="twoTone" twoToneColor="#716aca" />
                </p>
                <p className="ant-upload-text">Click here to upload your file</p>
                <p className="ant-upload-hint">Only valid <a href="#">.csv</a> files will be accepted and one file can be uploaded at a time. See out our <a href="#">import guide</a> for details and examples</p>
              </span>
            </div>
          </label>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
	return {
		currentUser: state.currentUser,
  errors: state.errors,
};
}

export default connect(mapStateToProps, {parseCSV, validateHeaders, validateInputs})(ImportModal);
