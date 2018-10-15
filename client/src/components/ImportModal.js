import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Avatar, Modal, Button, Upload, Icon, Alert, Spin, List } from 'antd';
import { parseCSV, validateInputs, validateHeaders } from '../services/parseCSV';
import { importProducts } from '../store/actions/products';

const Dragger = Upload.Dragger;


class ImportModal extends Component {
  state = {
    visible: true,
    loading: false,
    activeKey: "1",
    json: [],
    fileList: [],
    message: '',
   }

  toggle = () => {
    this.setState({
      visible: !this.state.visible,
    });
    this.props.onClose();
  }

  clearFiles = () => {
    this.setState({
      fileList: [],
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

  handleFileUpload = async (e) => {
    let fileList = [{name: e.target.files[0].name, size: parseFloat(e.target.files[0].size * 0.001).toFixed(2)+ ' KB'}]
    this.hideAlert();
    this.setState({
      loading: true,
      fileList: [],
      message: '',
    })
    this.props.parseCSV(e)
    .then(async ({json, jsonLowerCase}) => {
      let headerCheck = await this.props.validateHeaders(jsonLowerCase, this.props.headers)
      if (headerCheck.errorType === 'warning') {
        let list = headerCheck.errorList.map((e,i)=>(
          <li key={i}>{e}</li>
        ))
        //display warnings
        this.handleAlert(<ul>{list}</ul>, headerCheck.errorType)
        // this.setState({
        //   showAlert: true,
        //   alertType: headerCheck.errorType,
        //   errorHeader: headerCheck.errorHeader,
        //   alertText: <ul>{list}</ul>,
        //   submitButtonText: 'Submit File with Warnings',
        // })
      }
      let inputCheck = await this.props.validateInputs(jsonLowerCase, this.props.validInputs)
      if (inputCheck.isValid) {
        this.setState({
          fileList,
          json,
          loading: false,
        })
      }
    })
    .catch(err => {
      let list = err.errorList.map((e,i)=>(
        <li key={i}>{e}</li>
      ))
      this.handleAlert(<ul>{list}</ul>, err.errorType)
      this.setState({
        loading: false,
      })
    })
  }

  handleImport = (chunks) => {
    let progress = 0;
    return new Promise( async (resolve,reject) => {
      for (let batch of chunks) {
        await this.props.onSubmit(batch)
        .then(res=>{
          progress = progress + batch.length
        })
        .catch(err=>{
          console.log(err)
          let list = err.message.map((e,i)=>(
            <li key={i}>{e}</li>
          ))
          this.handleAlert(<ul>{list}</ul>,'error')
          this.setState({
            loading: false,
          })
          reject(err);
        })
      }
      resolve(progress)
    })
  }

  handleSubmitFileClick = async () => {
    this.setState({
      loading: true,
    })
    this.hideAlert()
    if (this.state.fileList.length === 0) {
      this.handleAlert('Please Upload a File','error')
      this.setState({
        loading: false,
      })
      return
    }
    let i,j;
    let chunk = 7000;
    let allChunks = []
    for (i=0,j=this.state.json.length; i<j; i+=chunk) {
      allChunks.push(this.state.json.slice(i,i+chunk));
    }
    let result = await this.handleImport(allChunks)
    this.setState({
      loading: false,
      fileList: [],
      message: <span>
        <h2>Import Success</h2>
        <h4><Icon className="md" type="check-circle" theme="twoTone" twoToneColor="rgb(135, 208, 104)" /></h4>
        <h4>{result} records processed</h4>
      </span>
    })
    this.props.onSuccess()
  }

  handleGoBack = () => {
    const activeKey = this.state.activeKey -1
    this.setState({
      activeKey: activeKey.toString()
    })
  }

  render() {
    return (
      <div>
        <Modal
          title={this.props.title}
          visible={this.state.visible}
          onOk={this.toggle}
          onCancel={this.toggle}
          footer={null}
        >
          {this.state.showAlert && (
            <Alert style={{margin: '-10px 0px 10px 0px'}} closable afterClose={this.hideAlert} message={this.state.alertText} type={this.state.alertType} />
          )}
          <Spin spinning={this.state.loading}>
            {this.state.message && (
              <div className="track-file">{this.state.message}</div>
            )}
            {this.state.fileList.length > 0 && (
              <div className="file-list">
                <List
                  itemLayout="horizontal"
                  dataSource={this.state.fileList}
                  renderItem={item => (
                    <List.Item actions={[<Icon onClick={this.clearFiles} type="delete" theme="filled" />]}>
                      <List.Item.Meta
                        avatar={<Avatar style={{background: 'rgb(135, 208, 104)'}} icon="file-add" />}
                        title={`File Name: ${item.name}`}
                        description={`File Size: ${item.size}`}
                      />
                    </List.Item>
                  )}
                />
              </div>
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
            <div className="center-a centered-container" style={{height: 80, marginBottom: -25}}>
              <Button type="primary" style={{width: 175}} onClick={this.handleSubmitFileClick}>Submit</Button>
            </div>
          </Spin>
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

export default connect(mapStateToProps, {parseCSV, validateHeaders, validateInputs, importProducts})(ImportModal);
