import { apiCall } from '../../services/api';
import { addError } from './errors';

export function queryModelData(model, query, sortBy, sortDirection, activePage, rowsPerPage, company, populateArray){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', `/api/models/query/`, {model, query, sortBy, sortDirection, activePage, rowsPerPage, company, populateArray})
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

export function getAllModelDocuments(config){
	// in config { model, documentRef, groupBy, company, regex, limit }
  return new Promise((resolve,reject) => {
		return apiCall('post', '/api/models/get-all', {...config})
		.then((res) => {
			resolve(res);
		})
		.catch(err => {
			reject(err.message);
		})
	});
}

export function upsertModelDocuments(model, data, company, filterRef,refUpdates,refModel){
	return new Promise((resolve,reject) => {
		return apiCall('post', '/api/models/upsert', { model, data, company, filterRef, refUpdates, refModel})
		.then((res) => {
			resolve(res);
		})
		.catch(err => {
			reject(err.message);
		})
	});
}
