import { apiCall } from '../../services/api';
import { addError } from './errors';
import { setCurrentUser } from './auth';

export function verifyUserEmail(token_id){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', `/api/account/verify/${token_id}`)
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				dispatch(addError(err.message));
				reject();
			})
		});
	}
}

export function resendUserVerificationEmail(email){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', `/api/account/resend-emailver`, {email})
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				dispatch(addError(err.message));
				reject();
			})
		});
	}
}

export function resetPassword(data) {
	return dispatch => {
		return new Promise((resolve, reject) => {
			const { email, token, update } = data
			return apiCall('post', `/api/account/reset-password`, { email, token, update })
				.then((res) => {
					resolve(res);
				})
				.catch(err => {
					dispatch(addError(err.message));
					reject(err);
				})
		});
	}
}

export function sendVerficationEmail(config) {
	return new Promise((resolve, reject) => {
		const { user } = config
		return apiCall('post', `/api/account/email-verification`, { user })
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				reject(err);
			})
	});
}

export function updateAccount(config) {
	return new Promise((resolve, reject) => {
		const { user, update } = config
		return apiCall('post', `/api/account/update-account`, { user, update })
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				reject(err);
			})
	});
}
