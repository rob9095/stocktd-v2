import { ADD_ERROR, REMOVE_ERROR } from '../actionTypes';

export const addError = error => ({
	type: ADD_ERROR,
	error: {
		message: error ? error.message : 'Something went wrong',
		status: error ? error.status : 'error',
	}
})

export const removeError = () => ({
	type: REMOVE_ERROR
})
