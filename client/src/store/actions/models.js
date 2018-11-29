import { apiCall } from '../../services/api';
import { addError } from './errors';

export function queryModelData(model, query, sortBy, sortDirection, activePage, rowsPerPage, company){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', `/api/models/query/`, {model, query, sortBy, sortDirection, activePage, rowsPerPage, company})
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				dispatch(addError(err.message));
				reject(err.message);
			})
		});
	}
}

export function deleteModelDocuments(model, data, currentUser){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', '/api/models/delete', {model, data, company: currentUser.user.company})
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				dispatch(addError(err.message));
				reject(err.message);
			})
		});
	}
}

export function getAllModelDocuments(model, documentRef, company, regex, limit){
  return new Promise((resolve,reject) => {
		return apiCall('post', '/api/models/get-all', {model, documentRef, company, regex, limit})
		.then((res) => {
			resolve(res);
		})
		.catch(err => {
			reject(err.message);
		})
	});
}

export function upsertModelDocuments(model, data, company, filterRef){
	return new Promise((resolve,reject) => {
		return apiCall('post', '/api/models/upsert', {model, data, company, filterRef})
		.then((res) => {
			resolve(res);
		})
		.catch(err => {
			reject(err.message);
		})
	});
}
