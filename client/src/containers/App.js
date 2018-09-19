import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '../store';
import { BrowserRouter as Router } from 'react-router-dom';
import { setCurrentUser, setAuthorizationToken } from '../store/actions/auth';
import Main from './Main';
import jwtDecode from 'jwt-decode';
import { render } from 'react-dom';

const store = configureStore();

if(localStorage.jwtToken) {
	setAuthorizationToken(localStorage.jwtToken);
	// prevent someone from manually tampering with the key of jwtToken in localStorage
	try {
		store.dispatch(setCurrentUser(jwtDecode(localStorage.jwtToken)));
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
