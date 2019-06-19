import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Root,StyleProvider} from 'native-base';
import getTheme from './native-base-theme/components';
import material from './native-base-theme/variables/material'
import {createStackNavigator,createDrawerNavigator} from 'react-navigation';

import {Platform,View,KeyboardAvoidingView} from 'react-native';
import routes from './menu'
import store from './store';
import storage from "./store/storage";
import Menu from "./modules/main/menu";
import StatusBarBackground from "./modules/main/statusbar";
import { MenuProvider } from 'react-native-popup-menu';
import SplashScreen from 'react-native-splash-screen'


console.disableYellowBox = true;
export let userid = null;
export let avatar = null;
export let password = null;
export let username = null;
export let cachedFeeds = null;
export let cover = null;

export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            preChecked : false
        };
        //storage.loginUser('12','22221221021');
        //storage.logout();

        this.needMembership = null;
        this.hasGetstarted = null;
        storage.getPreData((error, result)  => {
            userid = result[0][1];
            password = result[1][1];
            username = result[4][1];
            avatar = result[5][1];
            cachedFeeds = result[6][1];
            cover = result[7][1];
            this.needMembership = result[2][1];
            this.hasGetstarted = result[3][1];
            if (userid != null) {
                store.dispatch({type: 'AUTH_DETAILS', payload : {
                        userid : userid,
                        username : username,
                        password : password,
                        avatar : avatar,
                        cover : cover
                        //needMembership : this.needMembership,
                        // hasGetstarted : this.hasGetstarted
                    }});
            }
            //console.log("I am here- " + this.hasGetstarted + 'userid-  ' + this.userid);
            this.updateState({
                preChecked : true
            });
        });
    }

    updateState(va) {
        this.setState(va);
    }

    componentDidMount() {
        SplashScreen.hide();
    }


    render() {


        if (this.state.preChecked) {
            let param = {
                initialRouteName: 'main',
                headerMode: 'none',
            };

            if (!userid) {
                param.initialRouteName = 'start';
            } else {
                if (this.needMembership === "1") {
                    param.initialRouteName = 'membership';
                } else if(this.hasGetstarted === "0") {
                    param.initialRouteName = 'getstarted';
                } else {
                    param.initialRouteName = 'main';
                }
            }

            const stackNav = createStackNavigator(routes, param);
            const Drawers = createDrawerNavigator({
                main : stackNav
            }, {
                contentComponent: props => <Menu {...props}/>,
                initialRouteName: 'main',
                headerMode: 'none',
            });
            return (
                <Root >
                    {Platform.OS == 'ios' ? (
                        <KeyboardAvoidingView style={{flex: 1,overflow: 'hidden'}}  behavior="padding" enabled>
                            <StyleProvider style={getTheme(material)}>
                                <MenuProvider>
                                    <Provider store={store} >
                                        <View style={{flex: 1}}>
                                            <StatusBarBackground/>
                                            <View style={{flex: 1,overflow: 'hidden'}}>
                                                <Drawers />
                                            </View>
                                        </View>
                                    </Provider>
                                </MenuProvider>
                            </StyleProvider>
                        </KeyboardAvoidingView>
                    ) : (<View style={{flex:1}}>
                        <StyleProvider style={getTheme(material)}>
                            <MenuProvider>
                                <Provider store={store} >
                                    <View style={{flex: 1}}>
                                        <StatusBarBackground/>
                                        <View style={{flex: 1,overflow: 'hidden'}}>
                                            <Drawers />
                                        </View>
                                    </View>
                                </Provider>
                            </MenuProvider>
                        </StyleProvider>
                    </View>)}
                </Root>
            );
        }
        return null;
    }

}