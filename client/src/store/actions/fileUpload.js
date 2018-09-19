import { apiCall } from '../../services/api';
import { addError } from './errors';

export function uploadLocalFile(type, path, file, currentUser){
  return dispatch => {
		return new Promise((resolve,reject) => {
      const formData = new FormData();
      formData.append('file', file, file.filename);
      formData.append('company', currentUser.user.company);
      formData.append('id', currentUser.user.id);
			return apiCall(type, path, formData)
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
