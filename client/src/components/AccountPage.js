import React, { Component } from 'react'
import BasicNavigation from './BasicNavigation'
import BasicWidget from './BasicWidget';

class AccountPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: {
        selectedKeys: ['Account Details'],
        key: 'Account Details'
      },
    }
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
              <BasicWidget />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AccountPage