import { apiCall } from '../../services/api';
import { addError } from './errors';

export function importPurchaseOrder(json, currentUser){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', '/api/purchase-orders/import-csv', {json, company: currentUser.user.company})
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

export function fetchPurchaseOrders(currentUser){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', '/api/purchase-orders', {company: currentUser.user.company})
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

export function fetchPoProducts(po_id, currentUser){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', '/api/purchase-orders/products', {po_id, company: currentUser.user.company})
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

export function fetchCompanyPoProducts(currentUser, filter){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', '/api/purchase-orders/products-all', {filter, company: currentUser.user.company})
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

export function updatePurchaseOrders(purchaseOrders, poProducts, currentUser){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', '/api/purchase-orders/update', {purchaseOrders, poProducts, company: currentUser.user.company})
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
