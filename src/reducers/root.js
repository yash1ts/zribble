import {combineReducers} from 'redux';
import room from './room';
import chat from './chat';
import user from './user';

const appReducer = combineReducers({
  room,
  chat,
  user
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

export default rootReducer;
