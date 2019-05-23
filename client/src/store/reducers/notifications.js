import { ADD_NOTIFICATION, REMOVE_NOTIFICATION } from '../actionTypes';

export default (state = [], action) => {
  if (action.config) {
    console.log(action)
  }
  switch (action.type) {
    case ADD_NOTIFICATION:
      return [action.config, ...state];
    case REMOVE_NOTIFICATION:
      return state.filter(n=>n.id !== action.config.id)
    default:
      return state;
  }
};
