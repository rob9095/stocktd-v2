import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '../store';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import { setCurrentUser, setAuthorizationToken } from '../store/actions/auth';
import Main from './Main';
import jwtDecode from 'jwt-decode';
import { render } from 'react-dom';
import { addNotification } from '../store/actions/notifications';
import { Icon } from 'antd'

const store = configureStore();

if(localStorage.jwtToken) {
	setAuthorizationToken(localStorage.jwtToken);
	// prevent someone from manually tampering with the key of jwtToken in localStorage
	try {
		let user = jwtDecode(localStorage.jwtToken)
		store.dispatch(setCurrentUser(user));
		user.emailVerified === false && store.dispatch(addNotification({ showIcon: false, banner: true, type: 'warning', message: (<div className="flex align-items-center"><Icon type="exclamation-circle" style={{ marginRight: 5, fontSize: 20 }} /> <Link to="/app/account" style={{ color: 'rgb(47, 41, 54)', borderBottom: '1px dotted black' }}>You're almost there! Please verify your email address.</Link></div>), id: 'verify-email' }))
	} catch(e) {
		store.dispatch(setCurrentUser({}));
	}
}

const App = () => (
	<Provider store={store}>
		<Router>
      <Main />
		</Router>
	</Provider>
);

export default App;
