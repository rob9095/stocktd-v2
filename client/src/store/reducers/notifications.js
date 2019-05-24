import { ADD_NOTIFICATION, REMOVE_NOTIFICATION } from '../actionTypes';

export default (state = [], action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return state.find(n => n.id === action.config.id) ? [action.config, ...state.filter(n => n.id !== action.config.id)] : [action.config, ...state];
    case REMOVE_NOTIFICATION:
      return state.filter(n=>n.id !== action.config.id)
    default:
      return state;
  }
};
