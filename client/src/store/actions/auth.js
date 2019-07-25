import { apiCall, setTokenHeader } from '../../services/api';
import { SET_CURRENT_USER } from '../actionTypes';
import { addError, removeError} from './errors';
import { message } from 'antd';
 
export function setCurrentUser(user) {
	return{
		type: SET_CURRENT_USER,
		user
	};
};

export function setAuthorizationToken(token) {
	setTokenHeader(token);
}

export function logout(){
	return dispatch => {
		localStorage.clear();
		setAuthorizationToken(false);
		dispatch(setCurrentUser({}));
	}
}

export function authUser(type, data) {
	return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', `/api/auth/${type}`, data)
			.then(({token, ...user}) => {
				localStorage.setItem('jwtToken', token);
				setAuthorizationToken(token);
				dispatch(setCurrentUser({...user.signature}));
				dispatch(removeError());
				resolve();
			})
			.catch(err => {
				dispatch(addError({...err, status: 'error'}));
				reject(err);
			})
		});
	}
};
