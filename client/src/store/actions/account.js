import { apiCall } from '../../services/api';
import { addError } from './errors';
import { addNotification, removeNotification } from './notifications';
import { authUser } from './auth';

export function verifyUserEmail(token_id, user){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', `/api/account/verify/${token_id}`)
			.then((res) => {
				resolve(res);
				user.id ? dispatch(authUser('signin',{...user, silentAuth: true})) : dispatch(addError({message: 'Email Verified', status: 'success'}))
				dispatch(removeNotification({id: 'verify-email'}))
				dispatch(addNotification({ closable: true, onClose: ()=> removeNotification({ id:'verify-email-confirm'}), banner: true, type: 'success', message: 'Thanks for confirming your email.', id: 'verify-email-confirm' }));
			})
			.catch(err => {
				dispatch(addNotification({ closable: true, onClose: removeNotification({ id: 'verify-email-failed' }), banner: true, type: 'error', message: 'Failed to confirm email.', id: 'verify-email-failed' }));
				reject(err);
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
	return dispatch => {
		return new Promise((resolve, reject) => {
			const { user, update } = config
			return apiCall('post', `/api/account/update-account`, { user, update })
				.then((res) => {
					update.email && dispatch(authUser('signin', { ...user, email: user.email, silentAuth: true }))
					resolve(res);
				})
				.catch(err => {
					reject(err);
				})
		});
	}
}
