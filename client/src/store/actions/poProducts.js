import { apiCall } from '../../services/api';

export function updatePoProducts(updates,company) {
  return dispatch => {
    return new Promise((resolve,reject) => {
      return apiCall('post','/api/po-products/update',{updates,company})
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err)
      })
    })
  }
}
