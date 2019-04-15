import {AsyncStorage} from 'react-native';

export const STORAGE_NAME = "@crea8socialAPP";

export class Storage {
    constructor() {
        this.storageName = STORAGE_NAME;
    }

    multiGet(keys, callback) {
        let newKeys = [];

        for (i = 0; i <= keys.length;i++) {
            newKeys.push(this.format(keys[i]));
        }
        //console.log(newKeys);
        return AsyncStorage.multiGet(newKeys, callback);
    }

    get(name, defaultValue) {
        return AsyncStorage.getItem(`${this.storageName}:${name}`);
    }

    async set(name, value) {
       await AsyncStorage.setItem(`${this.storageName}:${name}`, value);
    }

    remove(name) {
        return  AsyncStorage.removeItem(`${this.storageName}:${name}`);
    }

    format(name) {
        return this.storageName + ':' + name;
    }

    getPreData(func) {
        return this.multiGet(['login_userid', 'login_password','need_membership','has_getstarted','user_name','avatar','newsfeed_cache','cover'], func)
    }

    isLoggedIn() {
        return this.get('login_userid', false)
    }

    logout() {

        this.remove('login_password');
        return this.remove('login_userid');
    }

    loginUser(id, pass) {
        this.set('login_userid', id);
        this.set('login_password', pass);
    }

    getUserid() {
        return this.isLoggedIn();
    }
}

const storage = new Storage();

export default  storage;