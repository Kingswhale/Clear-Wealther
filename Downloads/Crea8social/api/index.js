import Frisbee from "frisbee";
import {Platform} from "react-native";
import MyLog from "../utils/MyLog";

export const API_KEY = "meetKey";
export const WEBSITE = "https://meetfaced.com/";
export const BASE_URL = WEBSITE + "api/" + API_KEY + "/";
export const GOOGLE_KEY = "";
export const LIKE_TYPE = "reaction"; //can be reaction or like
export const BASE_CURRENCY = '$';
export const ADMOB_ID = '';
export const TWITTER_COMSUMER_KEY =  "";
export const TWITTER_CONSUMER_SECRET =  "";
export const IOS_CLIENT_ID = '';
export const ENABLE_SOCIAL_INTEGRATION = false;
const Api = {
    api:  () => {
        let api = new Frisbee({
            baseURI: BASE_URL, // optional
            headers: {
                'Accept': 'application/text',
                'Content-Type': 'application/text'
            }
        });

        api.interceptor.register({
            response : (response) => {
                let text = response.body;
                console.log('can you see me here')
                console.log(response);
                if (Platform.OS === 'android') {
                    text = text.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, ''); // If android , I've removed unwanted chars.
                }
                return JSON.parse(text);
            },
            request: function (path, options) {
                // Read/Modify the path or options
                return [path, options];
            },
        });

        return api;
    },

    noBaseApi: function() {
        let api = new Frisbee({
            headers: {
                'Accept': 'application/text',
                'Content-Type': 'application/text'
            }
        });

        api.interceptor.register({
            response : (response) => {
                let text = response.body;
                return text;
                if (Platform.OS === 'android') {
                    text = text.replace(/\r?\n/g, '').replace(/[\u0080-\uFFFF]/g, ''); // If android , I've removed unwanted chars.
                }
                return JSON.parse(text);
            },
            request: function (path, options) {
                // Read/Modify the path or options
                return [path, options];
            },
        });

        return api;
    },

    get : async function(url, param, withBase) {
        if (withBase === undefined || withBase) {
            return  this.api().get(url, {
                body: param
            });
        } else {
            return  this.noBaseApi().get(url, {
                body: param
            });
        }
    },

    post : async function(url, param) {
        return  this.api().post(url, {
            body: param,
            headers: {
                'Content-Type': 'multipart/form-data; charset=utf-8;',
            },
        });
    },

    //api endpoints declaration
    login :  'login'
};


export  default Api;