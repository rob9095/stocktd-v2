import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '../store';
import { BrowserRouter as Router } from 'react-router-dom';
import { setCurrentUser, setAuthorizationToken } from '../store/actions/auth';
import Main from './Main';
import jwtDecode from 'jwt-decode';
import { addNotification } from '../store/actions/notifications';
import { Link } from 'react-router-dom';

const store = configureStore();

if(localStorage.jwtToken) {
	setAuthorizationToken(localStorage.jwtToken);
	// prevent someone from manually tampering with the key of jwtToken in localStorage
	try {
		let user = jwtDecode(localStorage.jwtToken)
		if (!user.emailVerified) {
			store.dispatch(addNotification({ banner: true, type: 'warning', message: (<Link to="/app/account" style={{ color: 'rgb(47, 41, 54)', borderBottom: '1px dotted black' }}>You're almost there! Please verify your email address.</Link>), id: 'verify-email' }))
		}
		store.dispatch(setCurrentUser(user));
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
