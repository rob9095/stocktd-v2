import React, { Component } from 'react'
import BasicNavigation from './BasicNavigation'
import BasicWidget from './BasicWidget';
import { connect } from "react-redux";
import { getAllModelDocuments } from '../store/actions/models';
import { updateAccount, sendVerficationEmail } from '../store/actions/account';
import { addNotification, removeNotification } from '../store/actions/notifications';
import BasicForm from './BasicForm';
import CircularProgress from './CircularProgress';
import { Tag, Tabs, Icon } from 'antd';
const TabPane = Tabs.TabPane;

class AccountPage extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      selected: {
        selectedKeys: ['General'],
        key: 'General'
      },
      account: {},
    }
  }

  fetchData = async () => {
    this.setState({
      loading: true,
    })
    const { id, company } = this.props.currentUser.user || {}
    if (!id || !company) {
      console.log('error!')
      return
    }
    await getAllModelDocuments({ model: 'User', documentRef: { _id: id, }, company, populateArray: [{ path: 'companyId', populate: [{path: 'users'}] }], })
    .then(res=>{
      const [account, ...rest] = res.data
      this._isMounted && this.setState({account, loading: false})
    }).catch(error=>{
      console.log(error)
      this._isMounted && this.setState({error, loading: false})
    })
  }

  componentDidMount() {
    this._isMounted = true
    this.fetchData()
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  handleInputUpdate = (update,handler,nConfig) => {
    return new Promise(async (resolve,reject) => {
      if (handler) {
        handler({ user: this.props.currentUser.user, update})
        .then(res=>{
          nConfig && this.props.addNotification({
            message: nConfig.message || 'Changes Saved',
            id: nConfig.message,
            banner: true,
            closable: true,
            type: 'success',
            onClose: () => this.props.removeNotification({id: nConfig.message}),
          })
          this.setState({
            account: {
              ...this.state.account,
              ...!update.password && {...update},
            }
          })
          resolve(res)
        })
        .catch(err=>{
          nConfig && this.props.addNotification({
            message: nConfig.errMessage || err.message.toString() || 'Changes Failed',
            id: nConfig.errMessage,
            banner: true,
            closable: true,
            type: 'error',
            onClose: () => this.props.removeNotification({ id: nConfig.errMessage }),
          })
          reject(err)
        })
      } else {
        console.log('onBlur triggered without handler for change!')
        reject({message: 'Unable failed'})
      }
    })
  }

  handleEmailVerification = async () => {
    this.setState({
      sendEmail: true
    })
    await sendVerficationEmail({user: this.props.currentUser.user})
    .then(res=>{
      console.log({res})
      this.setState({
        sendEmail: {
          status: 'done',
          message: 'Email Sent',
        }
      })
    })
    .catch(err => {
      console.log({err})
      this.setState({
        sendEmail: {
          status: 'error',
          message: err.message.toString(),
        }
      })
    })
    setTimeout(()=>{
      this.setState({
        sendEmail: null,
      })
    },3000)
  }

  handleNavigationUpdate = (selected) => {
    //maybe fetch new data here for now just suedo loading effect
    this.setState({ selected, loading: true })
    setTimeout(()=>{
      this.setState({loading: false})
    },500)
  }

  render() {
    const account = this.state.account || {}
    return (
      <div style={{ background: '#fff', flexDirection: 'column', height: '100%'}} className="flex">
        <div className="flex space-between" style={{height: '100%'}}>
          <div style={{ minWidth: 220,}}>
            <BasicNavigation
              defaultSelectedKeys={this.state.selected.selectedKeys}
              onSelect={this.handleNavigationUpdate}
              data={[
                { title: 'General', icon: <Icon type="profile" /> },
                { title: 'Security', icon: <Icon type="unlock" /> },
                { title: 'Notifications', icon: <Icon type="notification" /> },
              ]}
            />
          </div>
          <div className="flex full-pad" style={{ width: '100%', paddingTop: 0}}>
            <div style={{width: '100%', maxWidth: 1200}}>
              <h2 style={{marginBottom: 0}}>{this.state.selected.key}</h2>
              <Tabs animated={false} renderTabBar={()=><div />} activeKey={this.state.selected.key} tabPosition={'top'}>
                <TabPane tab="General" key="General">
                  <BasicWidget
                    style={{margin: '12px 0px'}}
                    title="General"
                    contentLoading={this.state.loading}
                    renderContent={() =>
                      <div>
                        <BasicForm
                          onBlur={this.handleInputUpdate}
                          inputs={[
                            { id: 'email', text: 'Email', span: 24, validType: 'email', labelCol: { span: 12 }, wrapperCol: { span: 12 }, required: true, initialValue: account.email, handler: this.props.updateAccount, ...!this.props.currentUser.user.emailVerified && { extra: (<div className="flex align-items-center flex-wrap" style={{ fontSize: 'small' }}><Tag style={{ opacity: 1 }} color="volcano">unverified</Tag><a onClick={this.handleEmailVerification}>Resend Email</a>{this.state.sendEmail && (<span><CircularProgress style={{ marginRight: 5 }} {...this.state.sendEmail} /></span>)}</div>) } },
                            { id: 'firstName', confirm: true, text: 'First Name', span: 24, labelCol: { span: 12 }, wrapperCol: { span: 12 }, initialValue: account.firstName, handler: this.props.updateAccount },
                            { id: 'lastName', text: 'Last Name', span: 24, labelCol: { span: 12 }, wrapperCol: { span: 12 }, initialValue: account.lastName, handler: this.props.updateAccount },
                          ]}
                        />
                      </div>
                    }
                  />
                  <BasicWidget
                    style={{ margin: '12px 0px' }}
                    title="Preferences"
                    contentLoading={this.state.loading}
                    renderContent={() =>
                      <div>
                        <BasicForm
                          inputs={[
                            { id: 'language', text: 'Language', showSearch: true, type: 'select', values: [{ id: 'english', text: 'English' }], span: 24, labelCol: { span: 12 }, wrapperCol: { span: 12 }, initialValue: 'english' },
                            { id: 'timezone', text: 'Timezone', showSearch: true, type: 'select', values: [{ id: 'test', text: 'test' }], span: 24, labelCol: { span: 12 }, wrapperCol: { span: 12 }, initialValue: 'test' },
                          ]}
                        />
                      </div>
                    }
                  />
                </TabPane>
                <TabPane tab="Security" key="Security">
                  <BasicWidget
                    style={{ margin: '12px 0px' }}
                    title="Password"
                    contentLoading={this.state.loading}
                    renderContent={() =>
                      <div>
                        <BasicForm
                          inputs={[
                            { id: 'currentPassword', text: 'Current Password', span: 24, inputType: 'password', labelCol: { span: 12 }, wrapperCol: { span: 12 }, required: true, },
                            { id: 'password', text: 'New Password', span: 24, rules: { min: 6 }, validationRender: (i) => i ? 'Password must be longer than 6 characters' : 'Password is required', inputType: 'password', labelCol: { span: 12 }, wrapperCol: { span: 12 }, required: true, },
                            { id: 'passwordConfirm', text: 'Confirm Password', validationRender: (i) => i ? i.length > 6 ? 'Passwords must match' : 'Password must be longer than 6 characters' : 'Password Confirm is required', rules: { min: 6 }, span: 24, mustMatch: [{ input: 'password' }], inputType: 'password', labelCol: { span: 12 }, wrapperCol: { span: 12 }, required: true, },
                            { id: 'submit', type: 'content', span: 24, labelCol: { span: 0 }, wrapperCol: { span: 24 }, submit: 'Change Password', config: {loadInputs: true}, submitProps: { style: { float: 'right' }, type: 'primary', size: 'large', } }
                          ]}
                          onSubmit={(update)=>this.handleInputUpdate(update,this.props.updateAccount,{ message: 'Password Updated', errMessage: 'Password Update Failed'})}
                        />
                      </div>
                    }
                  />
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser,
    errors: state.errors
  };
}

export default connect(mapStateToProps, { updateAccount, addNotification, removeNotification })(AccountPage);
