import React from 'react';
import { apiCall, setTokenHeader } from '../../services/api';
import { SET_CURRENT_USER } from '../actionTypes';
import { addError, removeError} from './errors';
import { addNotification } from './notifications';
import { Link } from 'react-router-dom';
 
export function setCurrentUser(user, dispatch) {
	user.emailVerified === false && dispatch && dispatch(addNotification({ banner: true, type: 'warning', message: (<Link to="/app/account" style={{ color: 'rgb(47, 41, 54)', borderBottom: '1px dotted black' }}>You're almost there! Please verify your email address.</Link>), id: 'verify-email' }))
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

export function authUser(type, userData) {
	return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', `/api/auth/${type}`, userData)
			.then(({token, ...user}) => {
				localStorage.setItem('jwtToken', token);
				setAuthorizationToken(token);
				dispatch(setCurrentUser(user, dispatch));
				dispatch(removeError());
				resolve();
			})
			.catch(err => {
				dispatch(addError(err.message));
				reject();
			})
		});
	}
};
