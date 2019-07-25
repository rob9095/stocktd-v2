import React from 'react';
import { apiCall } from '../../services/api';
import { addError } from './errors';
import { addNotification, removeNotification } from './notifications';
import { authUser } from './auth';
import { Link } from 'react-router-dom';

export function verifyUserEmail(token_id, user){
  return dispatch => {
		return new Promise(async (resolve,reject) => {
			try {
				let res = await apiCall('post', `/api/account/verify`, {token_id})
				user.id ? await dispatch(authUser('signin', { ...user, silentAuth: true })) : dispatch(addError({ message: 'Email Verified', status: 'success' }))
				dispatch(removeNotification({ id: 'verify-email' }))
				dispatch(addNotification({ closable: true, onClose: () => dispatch(removeNotification({ id: 'verify-email-confirm' })), banner: true, type: 'success', message: 'Thanks for confirming your email.', id: 'verify-email-confirm' }));
				resolve(res);
			} catch(err) {
				user.id ? dispatch(addNotification({ closable: true, onClose: () => dispatch(removeNotification({ id: 'verify-email-failed' })), banner: true, type: 'error', message: 'Failed to confirm email. The link was invalid or expired.', id: 'verify-email-failed' }))
				:
				dispatch(addError('Failed to confirm email. The link was invalid or expired.'))
				reject(err)
			}
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
			return apiCall('post', `/api/account/update`, { user, update })
				.then((res) => {
					update.email && dispatch(authUser('signin', { ...user, email: update.email, silentAuth: true })) && dispatch(addNotification({ banner: true, type: 'warning', message: (<Link to="/app/account" style={{ color: 'rgb(47, 41, 54)', borderBottom: '1px dotted black' }}>You're almost there! Please verify your email address.</Link>), id: 'verify-email' }))
					resolve(res);
				})
				.catch(err => {
					reject(err);
				})
		});
	}
}

export function getAccountDetails(config) {
	return dispatch => {
		return new Promise((resolve, reject) => {
			const { user } = config
			return apiCall('post', `/api/account`, { user })
				.then((res) => {
					resolve(res);
				})
				.catch(err => {
					reject(err);
				})
		});
	}
}
