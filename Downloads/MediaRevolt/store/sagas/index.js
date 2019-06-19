import {put, call, all, takeEvery,takeLatest,fork} from 'redux-saga/effects';
import {watchFeeds} from "../../modules/feed/store";
import {watchUserStore} from "../../modules/user/store";


const watchAuthDetails = function* watchAuthDetails() {
    yield takeLatest("AUTH_DETAILS",  function*(action) {
        yield put({ type: "SET_AUTH_DETAILS", payload: action.payload });
    });


};

export default function* rootSaga() {
    yield all([
        fork(watchAuthDetails),
        fork(watchFeeds), //for feed,comment,like/reaction requests e.t.c
        fork(watchUserStore), //for user requests like notifications,settings update,friend requests e.t.c
    ]);
}