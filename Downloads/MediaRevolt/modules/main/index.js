import React, {Component} from 'react';
import { connect } from "react-redux";
import firebase from 'react-native-firebase';

import {
    Text, Animated,FlatList,Dimensions,Image,TouchableOpacity,Platform,View
} from 'react-native';
import {
    Container,
    Header,
    Button,
    Body,
    Icon,
    Tabs,Tab,
    TabHeading,
    Left,
    Right,
    Badge,
    Fab,
    Thumbnail,Toast
} from 'native-base';
import {drawer} from "./index";
import material from "../../native-base-theme/variables/material";
import FeedComponent from '../feed/components/feed'
import Requests from '../user/requests';
import Messages from '../message/messages';
import Notification from '../notification/notification';
import BaseComponent from "../../utils/BaseComponent";
import FastImage from 'react-native-fast-image'
import Api from "../../api";
import type { RemoteMessage } from 'react-native-firebase';
import EventBus from 'eventing-bus'
import notificationHelper from "../notification/helper";
import storage from "../../store/storage";
import {NavigationActions, StackActions} from "react-navigation";

const COLOR = material.brandPrimary;


const stateMap = (state) => {
    //console.log('state', state);
    return {
        userid : state.auth.userid,
        username : state.auth.username,
        password : state.auth.password,
        avatar : state.auth.avatar,
        notificationCount : state.user.notificationCount,
        requestsCount : state.user.requestsCount,
        messageCount : state.user.messageCount
    };
};

class Homescreen extends BaseComponent {

    tabView = null;
    constructor(props) {
        super(props);
        this.state.initPage = 0;
        this.state.page = this.props.navigation.getParam("page", 0);
        this.state.showFeedAdd = true;
        this.state.title = this.lang.t("home");
        switch(this.state.initPage) {
            case 1:
                this.state.title = this.lang.t("friend_requests");
                break;
            case 2:
                this.state.title = this.lang.t("notifications");
                break;
            case 3 :
                this.state.title = this.lang.t("messages");
                break;
        }
    }

    componentDidMount() {
        this.fetchNotifications();
        firebase.messaging().hasPermission()
            .then(enabled => {
                if (enabled) {
                    // user has permissions
                    this.getPushToken()
                } else {
                    // user doesn't have permission
                    firebase.messaging().requestPermission()
                        .then(() => {
                            this.getPushToken()
                        });
                }
            });

        this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
            //console.log('Notification just entered');
            EventBus.publish("pushNotification", message.data.message);
        });

        firebase.notifications().onNotificationOpened((notificationOpen) => {
            // notificationOpen.action will equal 'snooze'
            firebase.notifications().removeDeliveredNotification(notificationOpen.notification.data.id);
            let notify = notificationOpen.notification.data;
            if (notify.id === 'message') {
                this.props.navigation.push("chat", {
                    userid : notify.data.user.id,
                    avatar : notify.data.user.avatar,
                    cid : '',
                    name : notify.data.user.name
                })
            } else if(notify.id === 'request') {
                this.props.navigation.push("main", {page: 1});
            } else if (notify.id === 'notification') {
                notificationHelper.action(notify.data.notification, this.props.navigation);
            } else if (notify.id === 'push') {
                this.props.navigation.push("push", {message: notify.data.message});
            }

        });

        EventBus.on("pushNotification", (message) => {
            this.fetchNotifications();
            let json = JSON.parse(message);
            if (json.type === 'notification') {
                let notify = {
                    id : 'notification',
                    data : json
                };

                firebase.notifications().removeDeliveredNotification('notification');
                let message = notificationHelper.getTitle(json.notification.title_spec);
                const notification = new firebase.notifications.Notification()
                    .setNotificationId(notify.id)
                    .setTitle(json.user.name)
                    .setBody(message)
                    .setSound("default")
                    .setData(notify);
                notification
                    .android.setChannelId('crea8social')
                    .android.setLargeIcon(json.user.avatar);
                //.android.setSmallIcon(json.chat.avatar);
                notification
                    .ios.setBadge(2);

                firebase.notifications().displayNotification(notification);
            } else if (json.type === 'chat') {
                let notify = {
                    id : 'message',
                    data : json
                };
                firebase.notifications().removeDeliveredNotification('message');
                let message =this.lang.t('new_message') + ': ' + json.chat.text;
                if (json.chat.image !== '') message = "Image";
                const notification = new firebase.notifications.Notification()
                    .setNotificationId(notify.id)
                    .setTitle(json.user.name)
                    .setBody(message)
                    .setSound("default")
                    .setData(notify);
                notification
                    .android.setChannelId('crea8social')
                    .android.setLargeIcon(json.chat.avatar);
                    //.android.setSmallIcon(json.chat.avatar);
                notification
                    .ios.setBadge(2);

                firebase.notifications().displayNotification(notification);

            } else if (json.type === 'friend-request') {
                let notify = {
                    id : 'request',
                    data : json
                };
                firebase.notifications().removeDeliveredNotification('request');
                let message =this.lang.t('from') + ': ' + json.user.name;
                const notification = new firebase.notifications.Notification()
                    .setNotificationId(notify.id)
                    .setTitle(this.lang.t('new_friend_request'))
                    .setBody(message)
                    .setSound("default")
                    .setData(notify);
                notification
                    .android.setChannelId('crea8social')
                    .android.setLargeIcon(json.user.avatar);
                //.android.setSmallIcon(json.chat.avatar);
                notification
                    .ios.setBadge(2);

                firebase.notifications().displayNotification(notification);
            } else if(json.type === 'push-notification') {
                let notify = {
                    id : 'push',
                    data : json
                };
                const notification = new firebase.notifications.Notification()
                    .setNotificationId(notify.id)
                    .setTitle(this.lang.t('notification'))
                    .setBody(json.message)
                    .setSound("default")
                    .setData(notify);
                notification
                    .android.setChannelId('crea8social');
                //.android.setSmallIcon(json.chat.avatar);
                notification
                    .ios.setBadge(2);

                firebase.notifications().displayNotification(notification);
            }

        });


        this.props.navigation.addListener('didFocus', (status: boolean) => {
            this.fetchNotifications();
        });

        setTimeout(() => {
            if (this.state.initPage !== this.state.page) {
                this.tabView.goToPage(this.state.page)
            }
        }, 100)
    }

    componentWillUnmount() {
        this.messageListener();
    }

    fetchNotifications() {
        Api.get("check/login", {
            userid : this.props.userid
        }).then((res) => {
            if (this.props.password !== res.password) {
                //logout this user
                storage.logout();
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'start' })],
                });
                this.props.navigation.dispatch(resetAction);
            }  else {
                this.props.dispatch({type : "USER_NOTIFICATIONS", payload: res})
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    getPushToken() {
        firebase.messaging().getToken()
            .then(fcmToken => {
                if (fcmToken) {
                    console.log('Fcm Token Refreshed');
                    this.setToken(fcmToken)
                }
            });

        //also register for refresh token
        firebase.messaging().onTokenRefresh(fcmToken => {
            this.setToken(fcmToken);
        });
    }

    setToken(fcmToken) {
        Api.get("set/fcm/token", {
            userid : this.props.userid,
            token : fcmToken,
            device : (Platform.OS === 'ios') ? 'ios' : 'android'
        }).then((res) => {
            console.log('FCM = ' + fcmToken)
        });
    }


    render() {


        return (

            <Container style={{backgroundColor: 'white'}}>
                <Animated.View style={{
                    width: "100%",
                    elevation: 0,
                    height: Dimensions.get('window').height + 60,
                    transform: [{translateY: this.state.imageTranslate}],
                    backgroundColor: COLOR
                }}>
                    <Header   hasTabs style={{elevation: 0,height:60}}>
                        <Left>
                            <TouchableOpacity
                                onPress={() => {this.props.navigation.openDrawer()}}
                                activeOpacity={0.75}
                            >
                                <FastImage source={{uri: this.props.avatar}}
                                            style={{width:28,height:28,borderRadius:14,bottom:5,marginTop:(Platform.OS === 'ios' ? 0 : 10)}}/>
                            </TouchableOpacity>
                        </Left>

                        <Body>
                            <Text style={{fontSize:15,color:'white',bottom:5}}>{this.state.title}</Text>
                        </Body>

                        <Right>
                            <Button transparent onPress={() => {
                                this.props.navigation.push("search")
                            }}>
                                <Icon name="magnifier" type="SimpleLineIcons" style={{ color: 'white',fontSize: 20}}/>
                            </Button>
                            <Button transparent onPress={() => {
                                this.props.navigation.push("find_friends", {
                                    type : 'online'
                                })
                            }}>
                                <Icon name="ios-disc-outline"  style={{ color: 'white',fontSize: 25, marginLeft:0}}/>
                                <View style={{backgroundColor:material.accentTextColor, width:10,height:10,borderRadius: 5,position: 'absolute',top:9,right:13}}/>
                            </Button>
                        </Right>
                    </Header>

                    <Tabs
                        ref={(tabView)  => {this.tabView = tabView}}
                        scrollWithoutAnimation={true}
                        onChangeTab={(i) =>  {
                            console.log('tabbb');
                            switch(i.i) {
                                case 0:
                                    this.resetHeader();
                                    this.updateState({title: this.lang.t('home'),showFeedAdd:true,page : i.i});
                                    break;
                                case 1:
                                    this.resetHeader();
                                    this.updateState({title: this.lang.t('friend_requests'),showFeedAdd:false,page : i.i});
                                    break;
                                case 2:
                                    this.resetHeader();
                                    this.updateState({title: this.lang.t('notifications'),showFeedAdd:false,page : i.i});
                                    break;
                                case 3:
                                    this.resetHeader();
                                    this.updateState({title: this.lang.t('messages'),showFeedAdd:false,page : i.i});
                                    break;
                            }
                        }}

                        initialPage={0} page={this.state.page} style={{
                        paddingTop: 0,
                        backgroundColor: 'white',
                        elevation: 0,shadowOffset: {height: 0, width: 0},
                        shadowOpacity: 0,flex:1}}>
                        <Tab style={{backgroundColor: '#DEDCDD'}}  heading={ <TabHeading><Icon name="credit-card" type="Octicons" style={{fontSize:22}} /></TabHeading>} >
                            <FeedComponent
                                ref={(c) => this.feedComponent = c}
                                navigation={this.props.navigation}
                                type="feed"
                                feedType="feed"
                                feedTypeId={this.props.userid}
                                entityId={this.props.userid}
                                entityType="user"
                                toUserid=""
                                showFab={true}
                                style={{flex: 1}} component={this}/>
                        </Tab>
                        <Tab heading={ <TabHeading><Icon style={{fontSize:22}} name="user-follow" type="SimpleLineIcons" />
                            {this.props.requestsCount > 0 ? ( <Badge warning style={{marginTop:10,marginLeft: 4, height:20,backgroundColor:material.accentBgColor}}>
                                <Text style={{fontSize: 10,color:'white', top: (Platform.OS === 'android') ? 4 : 0}}>{this.props.requestsCount}</Text>
                            </Badge>) : null}
                            </TabHeading>} >
                            <Requests  navigation={this.props.navigation} style={{flex: 1}} component={this}/>
                        </Tab>

                        <Tab heading={ <TabHeading><Icon style={{fontSize:22}} name="bell" type="SimpleLineIcons" />
                            {this.props.notificationCount > 0 ? (<Badge warning style={{marginTop:10,marginLeft: 4, height:20,backgroundColor:material.accentBgColor}}>
                                <Text style={{fontSize: 10,color:'white', top: (Platform.OS === 'android') ? 4 : 0}}>{this.props.notificationCount}</Text>
                            </Badge>) : null}
                            </TabHeading>}>
                            <Notification navigation={this.props.navigation} style={{flex: 1}} component={this}/>
                        </Tab>
                        <Tab heading={ <TabHeading><Icon name="bubbles" type="SimpleLineIcons" style={{fontSize:22}} />
                            {this.props.messageCount > 0 ? (<Badge warning style={{marginTop:10,marginLeft: 4, height:20,backgroundColor:material.accentBgColor}}>
                                <Text style={{fontSize: 10,color:'white', top: (Platform.OS === 'android') ? 4 : 0}}>{this.props.messageCount}</Text>
                            </Badge>) : null}
                        </TabHeading>} >
                            <Messages navigation={this.props.navigation} style={{flex: 1}} component={this}/>
                        </Tab>

                    </Tabs>
                </Animated.View>
            </Container>
        )

    }
}


export default connect(stateMap)(Homescreen);