import { combineReducers } from 'redux'
import auth from './auth';
import feed from '../../modules/feed/store'
import user from '../../modules/user/store'
//import reducers from 'red'

export default combineReducers({
    auth,
    feed,
    user,
});