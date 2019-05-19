import React, { Component } from 'react'
import BasicNavigation from './BasicNavigation'

class AccountPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      
    }
  }
  render() {
    return (
      <div style={{height: '100%', background: '#fff', flexDirection: 'column'}} className="flex">
        <div className="flex space-between" style={{height: '100%'}}>
          <div style={{ minWidth: 220, height: '100%', borderRight: '1px solid #dad2e0', padding: '24px 0px'}}>
            <BasicNavigation
              defaultSelectedKeys={['Account Details']}
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
          <div className="flex align-items-center" style={{height: '100%', width: '100%'}}>
            content
          </div>
        </div>
      </div>
    )
  }
}

export default AccountPage