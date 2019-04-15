import {put, call, all, takeEvery,takeLatest} from 'redux-saga/effects';
import Api from "../../api";
import MyLog from "../../utils/MyLog";
import update from 'immutability-helper';

const _ = require("lodash");

export default function reducer(
    state = {

        actionDone : null,
        notificationCount : 0,
        requestsCount : 0,
        messageCount : 0,
        welcomeNote : true
    },
    action
) {
    switch (action.type)  {
        case 'SET_NOTIFICATIONS':
            return {...state, notifications :_.cloneDeep(action.payload), fetchFinished : true};
            break;

        case 'SET_FETCHING':
            return {...state, fetchFinished: action.payload};
            break;
        case 'SET_USER_NOTIFICATIONS':
            return {...state,
                notificationCount: action.payload.notifications,
                requestsCount: action.payload.friend_requests, messageCount : action.payload.messages};
            break;

        case 'PUT_WELCOME_NOTE': {
            return {...state, welcomeNote : false}
        }
    }

    return state;
}


export function* watchUserStore(action) {
    yield takeEvery("USER_NOTIFICATIONS", function*(action) {
        yield put({type: "SET_USER_NOTIFICATIONS", payload: action.payload});
    });

    yield takeEvery("SET_WELCOME_NOTE", function*(action) {
        put({type: 'PUT_WELCOME_NOTE', payload: false})
    });
}



//api call functions
export const getFriends = payload => {
    return Api.get("profile/friends", {
        the_userid : payload.theUserid,
        userid : payload.userid,
        term : payload.term,
        page : payload.page
    }).then((res) => {
        return res;
    }).catch((e) => {

    });
};


export const acceptRequests = payload => {
    return Api.get("friend/confirm", {
        to_userid : payload.toUserid,
        userid : payload.userid
    })
};

export const deleteRequests = payload => {
    return Api.get("friend/remove", {
        userid : payload.userid,
        to_userid : payload.toUserid
    })
};

export const loadProfile = payload => {
    //console.log('I am here now');
    return Api.get("profile/details", {
        userid : payload.userid,
        the_userid : payload.theUserid
    }).then((res) => {
        //MyLog.e(res);
        return res;
    })
};

export const getProfilePhotos = payload => {
    //MyLog.e("About to fetch Photos - " + payload.userid + "=" + payload.theUserid + "=" + payload.offset);
    return Api.get("profile/photos", {
        userid : payload.userid,
        the_userid : payload.theUserid,
        offset : payload.offset,
        limit : payload.limit
    });
};

export const getProfileAlbums = payload => {
    //MyLog.e("About to fetch Albums - " + payload.userid + "=" + payload.theUserid + "=" + payload.offset);
    return Api.get("profile/albums", {
        userid : payload.userid,
        the_userid : payload.theUserid,
        offset : payload.offset,
        limit : payload.limit
    }).then((res) => {
        //MyLog.e(res);
        return res;
    })
};

export const getAlbumPhotos = payload => {
    //MyLog.e("About to fetch Albums - " + payload.userid + "=" + payload.theUserid + "=" + payload.offset);
    return Api.get("photo/album/photos", {
        userid : payload.userid,
        the_userid : payload.theUserid,
        album_id : payload.albumId,
        offset : payload.offset,
        limit : payload.limit
    }).then((res) => {
        MyLog.e(res);
        return res;
    })
};

export const loadAlbumDetails = payload => {
    return Api.get("photo/album/details", {
        userid : payload.userid,
        album_id : payload.albumId
    }).then((res) => {
        return res;
    })
};

export const createAlbum = payload => {
    return Api.get("photo/album/add", {
        userid : payload.userid,
        title : payload.name,
        desc : payload.description,
        privacy : payload.privacy
    })
};

export const saveAlbum = payload => {
    return Api.get("photo/album/edit", {
        userid : payload.userid,
        title : payload.name,
        album_id : payload.albumId,
        desc : payload.description,
        privacy : payload.privacy
    })
};

export const deleteAlbum = payload => {
    return Api.get("photo/album/delete", {
        userid : payload.userid,
        album_id : payload.albumId,
    });
};

export const uploadPhotoAlbum = payload => {
    const formData = new FormData();
    formData.append("userid", payload.userid);
    formData.append("album_id", payload.albumId);
    formData.append('photo', {
        uri: payload.path,
        type: payload.mime, // or photo.type
        name: payload.path
    });

    return Api.post("photo/album/upload", formData).then((res) => {
        //console.log(res);
        return res;
    });
};

export const loadPhotoDetails = payload => {
    return Api.get("photo/details", {
        userid : payload.userid,
        photo : payload.photo
    });
};

export const deletePhoto = payload => {
    return Api.get("photo/delete", {
        userid : payload.userid,
        photo_id : payload.photoId
    });
};


export const setPhoto = payload => {
    return Api.get("photo/set/dp", {
        userid : payload.userid,
        photo_id : payload.photo_id
    });
};

export const follow = payload => {
    return Api.get("friend/follow", {
        userid : payload.userid,
        to_userid : payload.theUserid,
        type : payload.type
    })
};

export const addFriend = payload => {
    return Api.get("friend/add", {
        userid : payload.userid,
        to_userid : payload.theUserid
    })
};