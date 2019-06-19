import React from 'react';
import BaseComponent from "../../utils/BaseComponent";

import {FlatList,Animated,ActivityIndicator,Text,View,ScrollView,Image,TouchableOpacity} from 'react-native';
import {connect} from "react-redux";
import {
    Container,
    Toast,
    Item,Button,Thumbnail,Icon
} from 'native-base';

import EmptyComponent from "../../utils/EmptyComponent";
import time from "../../utils/Time";
import Util from "../../utils/Util";
import Api from "../../api";
import EventBus from "eventing-bus";
import notificationHelper from "./helper";
import firebase from 'react-native-firebase';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
class Notification extends BaseComponent {

    page = 1;
    limit = 10;
    offset = 0;
    constructor(props) {
        super(props);

        this.state.fetching = true;
        this.fetchNotifications(false);
        this.props.navigation.addListener('didFocus', (status: boolean) => {
            this.handlerRefresh();
            try{
                firebase.notifications().removeDeliveredNotification('notification');
            } catch (e) {}
        });
    }

    componentWillMount() {
        try{
            firebase.notifications().removeDeliveredNotification('notification');
        } catch (e) {}
        EventBus.on("pushNotification", (name) => {
            if (this.props.navigation.isFocused()) {
                this.fetchNotifications(false);
            }

            try{
                firebase.notifications().removeDeliveredNotification('notification');
            } catch (e) {}
        });
    }

    onScroll(event) {
        return this.props.component.onScroll(event)
    }


    fetchNotifications(type) {
        let pageOffset = this.limit + this.offset;
        console.log('fetching notification');
        this.offset = pageOffset;
        let page  = pageOffset / this.limit;
        Api.get("notifications", {
            page : page,
            userid : this.props.userid,
            type : type
        }).then((res) => {
            if (res.length > 0) {
                let lists = [];

                if (type) {
                    lists.push(...this.state.itemLists);
                    lists.push(...res);
                } else {
                    lists.push(...res);
                }
                this.updateState({itemLists: lists, fetchFinished: true})
            } else {
                this.updateState({fetchFinished: true, itemListNotEnd: true})
            }
        }).catch((e) => {
            this.updateState({fetchFinished: true, itemListNotEnd: true})
        });
    }

    handlerRefresh() {
        this.offset = 0;

        this.fetchNotifications(false);
    }

    render() {

        return (
            <Container>
                <View style={{flex: 1,flexDirection:'column'}}>
                    <AnimatedFlatList
                        scrollEventThrottle={1}
                        overScrollMode="never"
                        onScroll={this.onScroll.bind(this)}
                        style={{flex:1}}
                        onEndReachedThreshold={10}
                        onEndReached={(d) => {
                            //this.fetchNotifications();
                            if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd && this.state.fetchFinished) {

                                this.fetchNotifications(true);
                            }
                            return true;
                        }}
                        ref='_flatList'
                        data={this.state.itemLists}
                        extraData={this.state}
                        refreshing={this.state.refreshing}
                        onRefresh={() => {
                            this.handlerRefresh();
                        }}
                        keyExtractor={(item, index) => item.id}
                        ListEmptyComponent={!this.state.fetchFinished ? (<Text/>) : (
                            <EmptyComponent text={this.lang.t('no_new_notifications')} icon="bell"/>
                        )}
                        ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                            {(!this.state.fetchFinished) ? (
                                <ActivityIndicator size='large' />
                            ) : null}

                        </View>}
                        renderItem={({ item ,index}) => (
                            <Item onPress={() => {
                                this.doAction(item);
                            }} style={{padding: 10,flexDirection: 'row'}}>
                                <TouchableOpacity>
                                    <Thumbnail square source={{uri : item.avatar}}/>
                                </TouchableOpacity>
                                <View style={{flex: 1,marginLeft: 10,flexDirection: 'column'}}>
                                    <Text style={{fontWeight: 'bold', color:'black'}}>{item.name} <Text style={{fontWeight: 'normal'}}>{this.getTitle(item.title_spec)}</Text></Text>
                                    <View style={{flexDirection: 'row',marginTop:7}}>
                                        <Icon name="clock" type="SimpleLineIcons" style={{fontSize: 15,color: 'grey'}}/>
                                        <Text style={{marginLeft: 2,color: 'grey'}}>
                                            {time.ago(item.time_ago)}
                                            </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => {
                                    this.deleteNotification(item, index)
                                }}>
                                    <Icon name="ios-trash-outline" style={{color: 'lightgrey'}}/>
                                </TouchableOpacity>
                            </Item>
                        )}
                    />
                </View>
            </Container>
        )
    }

    getTitle(title) {
        return notificationHelper.getTitle(title);
    }

    doAction(item) {
        return notificationHelper.action(item, this.props.navigation);
    }

    deleteNotification(item, index) {
        let lists = [...this.state.itemLists];
        lists.splice( lists.indexOf(index), 1 );
        this.updateState({itemLists: lists});
        Api.get("notification/delete", {
            userid : this.props.userid,
            id : item.id
        });
    }
}


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        notifications : state.user.notifications,
        fetchFinished : state.user.fetchFinished,
        pageEndReached : state.user.pageEndReached
    }
})(Notification)