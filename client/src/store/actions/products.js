import { apiCall } from '../../services/api';
import { addError } from './errors';

export function fetchAllProducts(query, sortBy, sortDirection, activePage, rowsPerPage, company){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', `/api/products`, {query, sortBy, sortDirection, activePage, rowsPerPage, company})
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

export function importProducts(data, currentUser, update){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', '/api/products/import-csv', {data, update, company: currentUser.user.company})
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

export function updateProducts(updates, currentUser){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', '/api/products/update', {updates, company: currentUser.user.company})
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

export function deleteProducts(products, currentUser){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', '/api/products/delete', {products, company: currentUser.user.company})
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
