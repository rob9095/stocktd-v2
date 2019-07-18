import { apiCall } from '../../services/api';

export function addBoxScan(scan, company){
	return new Promise((resolve, reject) => {
		return apiCall('post', `/api/scans`, { scan, company })
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				reject({ ...err });
			})
	});
}

export function deleteBoxScans(data,company){
	return new Promise((resolve,reject) => {
		return apiCall('post', `/api/scans/delete`, {data,company})
		.then((res) => {
			resolve(res);
		})
		.catch(err => {
			reject({...err});
		})
	});
}

export function updateBoxScans(data, user) {
	return new Promise((resolve, reject) => {
		return apiCall('post', `/api/scans/update`, { data, company: user.company, user: user.id })
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				reject({ ...err });
			})
	});
}

export function importBoxScans(data, user) {
	return new Promise((resolve, reject) => {
		return apiCall('post', `/api/scans/import`, { data, company: user.company, user: user.id })
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				reject({ ...err });
			})
	});
}