import React, { Component } from 'react'
import BasicNavigation from './BasicNavigation'
import BasicWidget from './BasicWidget';
import { connect } from "react-redux";
import { getAllModelDocuments } from '../store/actions/models';
import { resetPassword, updateAccount } from '../store/actions/account';
import BasicForm from './BasicForm';

class AccountPage extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      selected: {
        selectedKeys: ['Account Details'],
        key: 'Account Details'
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

  handleInputUpdate = (update,handler) => {
    return new Promise(async (resolve,reject) => {
      if (handler) {
        handler({ user: this.props.currentUser.user, update})
        .then(res=>{
          this.setState({
            account: {
              ...this.state.account,
              ...update,
            }
          })
          resolve(res)
        })
        .catch(err=>{
          reject(err)
        })
      } else {
        console.log('onBlur triggered without handler for change!')
        reject({message: 'Unable to save update'})
      }
    })
  }

  render() {
    const account = this.state.account || {}
    return (
      <div style={{ background: '#fff', flexDirection: 'column'}} className="flex">
        <div className="flex space-between">
          <div style={{ minWidth: 220, padding: '24px 0px'}}>
            <BasicNavigation
              defaultSelectedKeys={this.state.selected.selectedKeys}
              onSelect={(selected)=>this.setState({selected})}
              data={[
                {id: 'account-group', title: 'Account', type: 'itemGroup', children: [
                  {title: 'Account Details'},
                  {title: 'Security'},
                  {title: 'Notifications'},
                  {title: 'Email'},
                  {title: 'Close Account'},
                ]}
              ]}
            />
          </div>
          <div className="flex full-pad" style={{ width: '100%', borderLeft: '1px solid #dad2e0', marginLeft: 1}}>
            <div style={{width: '100%', maxWidth: 1200}}>
              <h2>{this.state.selected.key}</h2>
              <BasicWidget
                title="Account Details"
                contentLoading={this.state.loading}
                renderContent={()=>
                  <div>
                  <BasicForm
                    onBlur={this.handleInputUpdate}
                    inputs={[
                      { id: 'email', text: 'Email', span: 24, validType: 'email', labelCol: {span: 12}, wrapperCol: {span: 12}, required: true, initialValue: account.email, handler: updateAccount },
                      { id: 'firstName', confirm: true, text: 'First Name', span: 24, labelCol: { span: 12 }, wrapperCol: { span: 12 }, initialValue: account.firstName, handler: updateAccount },
                      { id: 'lastName', text: 'Last Name', span: 24, labelCol: { span: 12 }, wrapperCol: { span: 12 }, initialValue: account.lastName, handler: updateAccount },
                    ]}
                  />
                  </div>
                }
              />
              <BasicWidget
                title="Preferences"
                contentLoading={this.state.loading}
                renderContent={() =>
                  <div>
                    <BasicForm
                      inputs={[
                        { id: 'language', text: 'Language', showSearch: true, type: 'select', values: [{id: 'english', text: 'English'}], span: 24, labelCol: { span: 12 }, wrapperCol: { span: 12 }, initialValue: 'english' },
                        { id: 'timezone', text: 'Timezone', showSearch: true, type: 'select', values: [{ id: 'test', text: 'test' }], span: 24, labelCol: { span: 12 }, wrapperCol: { span: 12 }, initialValue: 'test' },
                      ]}
                    />
                  </div>
                }
              />
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

export default connect(mapStateToProps, {})(AccountPage);
