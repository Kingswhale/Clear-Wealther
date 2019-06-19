import {put, call, all, takeEvery,takeLatest} from 'redux-saga/effects';
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
        feedErrors : false,
        feedFetchStart : false,
        feedRefreshing : false,
        feedUpdated : false,
        feedPosted : [],
        feedPostError : false,
        feedLinkPreview: null
    },
    action
) {
    switch (action.type)  {
        case 'SET_FEED_LISTS':{
            if(action.payload.type == 'profile') {
                return { ...state,
                    profileFeeds : action.payload.lists
                };
            } else {
                return { ...state,
                    feeds : action.payload.lists
                };
            }
            break;
        }
        case 'FEED_FETCH_ERROR':{
            return {...state, feedErrors: true};
            break;
        }

        case 'FEED_FETCH_START':{
            return {...state, feedFetchStart: action.payload};
            break;
        }
        case 'FEED_REFRESHING': {
            //console.log('I am refreshing')
            return {...state, feedFetchStart: action.payload};
            break;
        }

        case 'SET_FEED_POST': {
            let lists = [];
            lists.push(action.payload);
            return {...state, feedPosted:lists, feedPostError: false};
            break;
        }
        case 'SET_FEED_POST_FINISHED': {

            return {...state, feedPosted:[], feedPostError: false};
            break;
        }
        case 'SET_FEED_POST_ERROR':{
            return {...state, feedPostError: action.payload}
        }
        case 'SET_FEED_LINK_PREVIEW': {
            return {...state, feedLinkPreview: action.payload}
        }

        case 'SET_FEED_REACT': {
            return update(state, {
                feeds : {
                    [action.payload.index]: {
                        has_react : {$set: action.payload.action}
                    }
                }
            })
        }

    }
    return state;
}

export function* watchFeeds(action) {
    yield takeEvery("FEED_POST_LIKE",  function*(action) {
        let posts = action.payload.lists;
        //console.log("We are liking item");
        posts[action.payload.index].has_like = 'true';
        yield put({ type: "SET_FEED_LISTS", payload: {
                type : action.payload.type,
                lists : posts
            } });
    });

    yield takeEvery("POST_ACTION", function*(action) {
        let actionType = action.payload.actionType;
        let payload = action.payload;

        let feedLists = payload.feedLists;

        if (actionType === 'unpin' || actionType === 'pin') {
            actionType = 'pin';
            feedLists[payload.index].is_pinned = (actionType !== 'unpin')
        }

        if (actionType === 'subscribe' || actionType === 'unsubscribe') {

            feedLists[payload.index].has_subscribed = (actionType !== 'unsubscribe')
        }

        if (actionType === 'hide' || actionType === 'remove') {
            feedLists.splice( feedLists.indexOf(payload.index), 1 );
        }

        //lets update the UI with our new list
        yield put({ type: "SET_FEED_LISTS", payload: {
                type : payload.feedType,
                lists : feedLists
            } });

        //send action to server
        yield call(doFeedAction.bind(this, {
            userid : payload.userid,
            action : payload.type,
            feed_id : payload.feedId,

        }));

    });

    yield  takeEvery("POST_REACT", function*(action) {
        let payload = action.payload;
        if (payload.feedLists !== undefined) {
            //we are processing for a feed only, reason is bcos its a flatList item
            let feedLists = payload.feedLists;
            let action = false;
            if (payload.reactType !== 0) {
                action = true
            }

            //lets update the UI with our new list
            yield put({ type: "SET_FEED_REACT", payload: {
                    type : payload.feedType,
                    action: action,
                    id : feedLists[payload.index].id,
                    index : payload.index
                } });

            //send to server and server
            yield call(doReact.bind(this, {
                userid : payload.userid,
                type : payload.type,
                typeId : payload.typeId,
                code : payload.reactType
            }));

            //load the recent reacts
            let reactMembers = yield call(loadReactMembers.bind(this, {
                userid : payload.userid,
                type : payload.type,
                typeId : payload.typeId,
            }));
            //lets update the UI
            feedLists[payload.index].react_members = reactMembers['members'];
            yield put({ type: "SET_FEED_LISTS", payload: {
                    type : payload.feedType,
                    lists : feedLists
                } });
        } else {
            //we are process for general case use
        }
    });

    yield takeEvery("POST_LIKE", function*(action) {
        if (payload.feedLists !== undefined) {
            //we are processing for a feed only, reason is bcos its a flatList item
            let feedLists = payload.feedLists;
            if (payload.liked) {
                //we are removing reaction
                feedLists[payload.index].has_like = false;
            } else {
                feedLists[payload.index].has_like = true;
            }

            //lets update the UI with our new list
            yield put({ type: "SET_FEED_LISTS", payload: {
                    type : payload.feedType,
                    lists : feedLists
                } });

            //send to server and server
            let result = yield call(doLike.bind(this, {
                userid : payload.userid,
                type : payload.type,
                typeId : payload.typeId
            }));

            feedLists[payload.index].like_count = result['likes'];
            yield put({ type: "SET_FEED_LISTS", payload: {
                    type : payload.feedType,
                    lists : feedLists
                } });
        } else {
            //we are process for general case use
        }
    });

    yield takeEvery("FEED_LISTS",  function*(action) {
        let payload = {
            type : action.payload.type,
            lists : action.payload.lists
        };
        //console.log('I am working here')
        if (action.payload.action === 'refreshing') {
            yield put({type : 'FEED_REFRESHING', payload : true})
        } else {
            yield put({type : 'FEED_FETCH_START', payload : true})
        }
        try {

            let feeds = yield call(fetchFeeds.bind(this, action.payload));

            if (action.payload.action === 'refreshing') {
                yield put({type : 'FEED_REFRESHING', payload : false})
            } else {
                yield put({type : 'FEED_FETCH_START', payload : false})
            }
            if (feeds.length > 0) {
                if (action.payload.action === 'more') {
                    payload.lists.push(...feeds);
                } else {
                    let result = [];

                    Storage.set("newsfeed_cache", JSON.stringify(feeds));

                    result.push(...feeds);
                    payload.lists = result;
                }

                yield put({ type: "SET_FEED_LISTS", payload: payload });
            } else {

                if (cachedFeeds !== null && action.payload.action !== 'more') {
                    feeds = JSON.parse(cachedFeeds);
                    payload.lists = feeds;
                    yield put({ type: "SET_FEED_LISTS", payload: payload });
                }
            }

        } catch(error) {

            if (action.payload.action === 'refreshing') {
                yield put({type : 'FEED_REFRESHING', payload : false})
            } else {
                yield put({type : 'FEED_FETCH_START', payload : false})
            }

            yield put({type : 'FEED_FETCH_ERROR'});
            if (action.payload.action !== "more") {
                if (cachedFeeds !== null) {
                    let feeds = JSON.parse(cachedFeeds);
                    payload.lists = feeds;
                    yield put({ type: "SET_FEED_LISTS", payload: payload });
                }
            }
        }
    });

    yield takeLatest("POST_FEED", function*(action) {
        try{
            let post = action.payload.data;
            //console.log(post.privacy);
            let postedFeed = yield call(postFeed.bind(this, action.payload));

            if(postedFeed.status === 1) {
                yield put({type : 'SET_FEED_POST', payload : postedFeed.feed})
            } else {
                yield put({type : 'SET_FEED_POST_ERROR', payload : true});
            }
        } catch (e) {
            console.log(e);
            yield put({type : 'SET_FEED_POST_ERROR', payload : true});
        }
    });

    yield takeLatest("POST_FEED_CLEAR_ERROR", function*(action) {
        yield put({type : 'SET_FEED_POST_ERROR', payload : false});
    });

    yield takeLatest("NEW_FEED_ADDED", function*(action) {
        let payload = {
            type : action.payload.type,
            lists : action.payload.lists
        };

        payload.lists.unshift(action.payload.feed);

        yield put({ type: "SET_FEED_LISTS", payload: payload });
        yield put({type : 'SET_FEED_POST_FINISHED', payload : {}});
        yield put({ type: "SET_FEED_LINK_PREVIEW", payload: null });

    });

    yield takeLatest("CLEAR_LINK_PREVIEW", function*(action) {
        yield put({ type: "SET_FEED_LINK_PREVIEW", payload: null });
    });

    yield takeLatest("GET_FEED_LINK_PREVIEW", function*(action) {
        try{
            let result = yield call(fetchLinkPreview.bind(this, action.payload));

            if (result.status === 1) {
                yield put({ type: "SET_FEED_LINK_PREVIEW", payload: result });
            }
        } catch(e) {

        }
    });


}


//functions
const fetchLinkPreview = payload => {
    return Api.get("feed/link/preview", {
        link : payload
    }).then((res) => {
        return res;
    })
};
const postFeed = payload => {
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
    formData.append("link_details", payload.data.linkDetails);
    if (payload.data.background !== 0) {
        formData.append("background", "color"+payload.data.background);
    }

    if (payload.data.showPollOptions) {
        formData.append("is_poll", true);
        formData.append("poll_option_one", payload.data.option1);
        formData.append("poll_option_two", payload.data.option2);
        formData.append("poll_option_three", payload.data.option3);
        formData.append("poll_multiple", payload.data.pollMultiple);
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

        }
    }

    const config = {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    };

    return Api.post("feed/add", formData).then((res) => {
        return res;
    });
};

const fetchFeeds = payload => {
    return Api.get('feeds', {
        userid : payload.userid,
        offset : payload.offset,
        type : payload.feedType,
        type_id : payload.feedTypeId,
        limit: 5
    }).then((response) => {
        //console.log('Iam here now');
        //console.log(response);
        return response;
    }).catch((error) => {
        //console.log(error);
    });
};

const doReact = payload => {
    return Api.get("react/item", {
        userid : payload.userid,
        type : payload.type,
        type_id : payload.typeId,
        code : payload.code
    }).then((res) => {
        //react is successfull
    })
};

const doFeedAction = payload => {
    return Api.get("feed/action", {
        userid : payload.userid,
        action : payload.action,
        feed_id : payload.feedId
    }).then((res) => {
        //react is successfull
    })
};

const doLike = payload => {
    return Api.get('like/item', {
        userid : payload.userid,
        type : payload.type,
        type_id : payload.typeId,
    }).then((res) => {
        return res;
    })
};

const loadReactMembers =  payload => {
    return Api.get('react/load', {
        userid : payload.userid,
        type : payload.type,
        type_id: payload.typeId
    }).then((res) => {
        return res;
    })
};