import {applyMiddleware, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers/root';

const appStore = createStore(rootReducer, {}, applyMiddleware(thunkMiddleware));

export default appStore;
