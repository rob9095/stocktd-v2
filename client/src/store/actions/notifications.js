import { ADD_NOTIFICATION, REMOVE_NOTIFICATION } from '../actionTypes';

export const addNotification = config => ({
  type: ADD_NOTIFICATION,
  config
})

export const removeNotification = config => ({
  type: REMOVE_NOTIFICATION,
  config
})
