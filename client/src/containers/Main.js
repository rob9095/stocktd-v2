import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { authUser } from '../store/actions/auth';
import { removeError } from '../store/actions/errors';
import Dashboard from './Dashboard';
import DashboardLegacy from './DashboardLegacy';
import WrappedAuthForm from '../components/AuthForm';
import WrappedForgotPassword from '../components/ForgotPassword';
import NotFound from '../components/NotFound';

const Main = props => {
	const { authUser, errors, removeError, currentUser } = props;
	return(
			<Switch>
				<Route path="/app" render={props => <Dashboard currentUser={currentUser} {...props} />} />
				<Route path="/app-old" render={props => <DashboardLegacy currentUser={currentUser} {...props} />} />
				<Route
					exact
					path="/(signin|login)/"
					render={props => {
						return (
							<WrappedAuthForm
								removeError={removeError}
								errors={errors}
								onAuth={authUser}
								buttonText="Log in"
								heading="Log In"
								{...props}
							/>
						);
					}}
				/>
				<Route
					exact
					path="/signup"
					render={props => {
						return (
							<WrappedAuthForm
								removeError={removeError}
								errors={errors}
								onAuth={authUser}
								signUp
								buttonText="Sign up"
								heading="Create Account"
								{...props}
							/>
						);
					}}
				/>
				<Route
					exact path="/reset-password"
					render={props =>
							<WrappedForgotPassword
								currentUser={currentUser}
								removeError={removeError}
								errors={errors} {...props}
							/>
						}
					/>
				<Route render={props => <NotFound currentUser={currentUser} {...props} />} />
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
