import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import { Link } from 'react-router-dom';
class NotFound extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  handleBack = () => {
    this.props.history.goBack();
  }
  render() {
    return(
      <div className="centered-container col center-a not-found">
        <h1>404</h1>
        <Icon type="warning" theme="twoTone" className="lg" twoToneColor="#faad14" />
        <h2>Something went wrong</h2>
        <h3>We didn't find the page you were looking for.</h3>
        <div className="action-group centered-container">
          <Button type="primary" onClick={this.handleBack}>Go Back</Button>
          <Link to="/contact">
            <Button>Contact Support</Button>
          </Link>
        </div>
      </div>
    )
  }
}

export default NotFound;
