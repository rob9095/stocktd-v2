import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { authUser } from '../store/actions/auth';
import { removeError, addError } from '../store/actions/errors';
import Dashboard from './Dashboard';
import DashboardNew from './DashboardNew';
import DashboardLegacy from './DashboardLegacy';
import WrappedAuthForm from '../components/AuthForm';
import WrappedForgotPassword from '../components/ForgotPassword';
import NotFound from '../components/NotFound';
import VerifyEmail from '../components/VerifyEmail';

const Main = props => {
	const { authUser, errors, removeError, addError, currentUser } = props;
	return(
			<Switch>
				<Route path="/app-old" render={props => <Dashboard currentUser={currentUser} {...props} />} />
				<Route path="/app" render={props => <DashboardNew currentUser={currentUser} {...props} />} />
				<Route path="/app-legacy" render={props => <DashboardLegacy currentUser={currentUser} {...props} />} />
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
					exact path="/forgot-password"
					render={props =>
							<WrappedForgotPassword
								removeError={removeError}
								errors={errors}
								btnText={'Send Email'}
								btnLoadingText={'Sending...'}
								btnCompleteText={'Back to login'}
								{...props}
							/>
						}
					/>
				<Route
					exact path="/reset-password/:token"
					render={props =>
						<WrappedForgotPassword
							reset={true}
							currentUser={currentUser}
							removeError={removeError}
							addError={addError}
							errors={errors}
							btnText={'Reset Password'}
							btnLoadingText={'Resetting...'}
							btnCompleteText={'Back to login'}
							{...props}
						/>
					}
				/>
				<Route
					exact path="/verify-email/:token"
					render={props =>
						<VerifyEmail
							{...props}
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

export default withRouter(connect(mapStateToProps, { authUser, removeError, addError })(Main));
