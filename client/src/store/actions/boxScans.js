import { apiCall } from '../../services/api';

export function addBoxScan(scan, company){
  return dispatch => {
		return new Promise((resolve,reject) => {
			return apiCall('post', `/api/scans/`, {scan,company})
			.then((res) => {
				resolve(res);
			})
			.catch(err => {
				reject({...err});
			})
		});
	}
}