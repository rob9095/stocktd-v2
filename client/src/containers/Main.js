import React from 'react';
import { Switch, Route, withRouter, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { authUser } from '../store/actions/auth';
import { removeError } from '../store/actions/errors';
import Dashboard from './Dashboard';
import WrappedAuthForm from '../components/AuthForm';

const Main = props => {
	const { authUser, errors, removeError, currentUser } = props;
	return(
			<Switch>
				<Route exact path="/" render={props => <Dashboard currentUser={currentUser} {...props} />} />
				<Route path="/signin" render={props => <WrappedAuthForm currentUser={currentUser} {...props} />} />
			</Switch>
	);
};

function mapStateToProps(state) {
	return {
		currentUser: state.currentUser,
		errors: state.errors
	};
}

export default withRouter(connect(mapStateToProps, { authUser, removeError })(Main));
