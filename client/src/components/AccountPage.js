import React, { Component } from 'react'
import BasicNavigation from './BasicNavigation'
import BasicWidget from './BasicWidget';
import { connect } from "react-redux";
import { getAllModelDocuments } from '../store/actions/models';
import { resetPassword } from '../store/actions/account';
import InsertDataModal from './AccountPage';
import UserCard from '../components/UserCard';

class AccountPage extends Component {
  _isMounted = false
  constructor(props) {
    super(props)
    this.state = {
      selected: {
        selectedKeys: ['Account Details'],
        key: 'Account Details'
      },
    }
  }

  fetchData = () => {
    this.setState({
      loading: true,
    })
    const { id, company } = this.props.currentUser.user || {}
    if (!id || !company) {
      console.log('error!')
      return
    }
    getAllModelDocuments({ model: 'User', documentRef: { _id: id, }, company, populateArray: [{ path: 'companyId', populate: [{path: 'users'}] }], })
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

  render() {
    return (
      <div style={{height: '100%', background: '#fff', flexDirection: 'column'}} className="flex">
        <div className="flex space-between" style={{height: '100%'}}>
          <div style={{ minWidth: 220, height: '100%', padding: '24px 0px'}}>
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
          <div className="flex full-pad" style={{ height: '100%', width: '100%', borderLeft: '1px solid #dad2e0', marginLeft: 1}}>
            <div style={{width: '100%'}}>
              <h2>{this.state.selected.key}</h2>
              <BasicWidget
                title="Account Details"
                contentLoading={this.state.loading}
                renderContent={()=>
                  <div>
                  hi
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
