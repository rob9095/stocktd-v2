import { apiCall } from '../../services/api';
import { addError } from './errors';

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
