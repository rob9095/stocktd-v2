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
      <div>
        <h2>Account Details</h2>
        <div>
          <div>
          <BasicNavigation />
          </div>
          <div>
            content
          </div>
        </div>
      </div>
    )
  }
}

export default AccountPage