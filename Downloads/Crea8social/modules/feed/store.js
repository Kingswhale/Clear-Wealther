import {put, call, all, takeEvery,takeLatest,fork} from 'redux-saga/effects';
import Api from "../../api";
import Storage from "../../store/storage";
import {cachedFeeds} from "../../App";
import MyLog from "../../utils/MyLog";
import update from 'immutability-helper';

const _ = require("lodash");

export default function reducer(
    state = {
        feeds : [],
        profileFeeds : [],
        comments : [],
    },
    action
) {
    switch (action.type)  {

    }
    return state;
}

export function* watchFeeds(action) {
}


//functions
export const fetchLinkPreview = payload => {
    let formData = new FormData();
    formData.append("link", payload);
    return Api.post("feed/link/preview",formData).then((res) => {
        return res;
    })
};
export const postFeed = payload => {
    const formData = new FormData();
    formData.append("userid", payload.userid);
    formData.append("type", payload.type);
    formData.append("type_id", payload.typeId);
    formData.append("entity_id", payload.entityId);
    formData.append("entity_type", payload.entityType);
    formData.append("to_user_id", payload.toUserid);
    formData.append("privacy", payload.data.privacy);
    formData.append("feeling_type", payload.data.feeling_type);
    formData.append("feeling_text", payload.data.feeling_text);
    formData.append("text", payload.data.text);
    formData.append("tags", payload.data.tags);
    formData.append("location", payload.data.location);
    if (payload.data.linkDetails !== null) {
        formData.append("link_details", payload.data.linkDetails.details);
    }

    if (payload.data.gif !== null) {
        formData.append("gif", payload.data.gif);
    }
    if (payload.data.background !== 0) {
        formData.append("background", "color"+payload.data.background);
    }

    if (payload.data.showPollOptions) {
        formData.append("is_poll", (payload.data.pollMultiple) ? 2 : 1);
        formData.append("poll_option_one", payload.data.option1);
        formData.append("poll_option_two", payload.data.option2);
        formData.append("poll_option_three", payload.data.option3);
        //formData.append("poll_multiple", payload.data.pollMultiple);
    }

    if (payload.data.images.length > 0) {
        let images = payload.data.images;
        formData.append('image1', {
            uri: images[0].path,
            type: images[0].mime, // or photo.type
            name: images[0].path
        });

        if (images.length > 1) {
            formData.append('image2', {
                uri: images[1].path,
                type: images[1].mime, // or photo.type
                name: images[1].path
            });
        }

        if (images.length > 2) {
            formData.append('image3', {
                uri: images[2].path,
                type: images[2].mime, // or photo.type
                name: images[2].path
            });
        }

        if (images.length > 3) {
            formData.append('image4', {
                uri: images[3].path,
                type: images[3].mime, // or photo.type
                name: images[3].path
            });
        }

        if (images.length > 4) {
            formData.append('image5', {
                uri: images[4].path,
                type: images[4].mime, // or photo.type
                name: images[4].path
            });
        }


    } else {
        if (payload.data.video != null) {
            //video_attach
            formData.append('video', {
                uri: payload.data.video.path,
                type: payload.data.video.mime, // or photo.type
                name: payload.data.video.path
            });
        }
    }

    if (payload.data.record !== null) {
        formData.append('voice', {
            uri: payload.data.record,
            type: 'audio/aac', // or photo.type
            name: payload.data.record
        });
    }
    console.log(formData);
    return Api.post("feed/add", formData).then((res) => {
        console.log(res);
        return res;
    });
    
};

export const fetchFeeds = payload => {
    return Api.get('feeds', {
        userid : payload.userid,
        offset : payload.offset,
        type : payload.feedType,
        type_id : payload.feedTypeId,
        limit: 5,
        sortby : (payload.sortBy === undefined) ? '' : payload.sortBy
    }).then((response) => {
        //console.log('Iam here now');
        //console.log(response);
        return response;
    }).catch((error) => {
        //console.log(error);
    });
};

export const doReact = payload => {
    return Api.get("react/item", {
        userid : payload.userid,
        type : payload.type,
        type_id : payload.typeId,
        code : payload.code
    }).then((res) => {
        //react is successfull
    })
};

export const doFeedAction = payload => {
    return Api.get("feed/action", {
        userid : payload.userid,
        action : payload.action,
        feed_id : payload.feedId
    });
};

export const doLike = payload => {
    return Api.get('like/item', {
        userid : payload.userid,
        type : payload.type,
        type_id : payload.typeId,
    }).then((res) => {
        return res;
    })
};

export const loadReactMembers =  payload => {
    return Api.get('react/load', {
        userid : payload.userid,
        type : payload.type,
        type_id: payload.typeId
    }).then((res) => {
        return res;
    })
};