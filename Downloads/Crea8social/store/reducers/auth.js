export default function reducer(
    state = {
        userid : '',
        username : '',
        password : '',
        avatar : '',
        cover : '',
        menus : [],

        //needMembership : false,
        //hasGetstarted : true
    },
    action
) {
    switch (action.type)  {
        case 'SET_AUTH_DETAILS': {
            return { ...state,
                username: action.payload.username,
                userid : action.payload.userid,
                password: action.payload.password,
                avatar : action.payload.avatar,
                cover : action.payload.cover
                //needMembership: action.payload.needMembership,
                //hasGetstarted: action.payload.hasGetstarted
            };
            break;
        }

        case 'SET_MENU_ITEMS': {
            return {...state, menus : action.payload}
        }



    }
    return state;
}

export function* watchAuth(action) {
    yield takeEvery("GET_MENU_ITEMS", function*(action) {
       try{
           const menus = yield call(loadMenus);
           if (menus.length > 0) {
               put({type: 'SET_MENU_ITEMS', payload: menus})
           }
       } catch (e) {
           //we need to be silent about this
       }
    });
}

