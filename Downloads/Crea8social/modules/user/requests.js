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
import Api from "../../api";
import update from 'immutability-helper';
import EventBus from "eventing-bus";
import firebase from 'react-native-firebase';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
class Requests extends BaseComponent {
    page = 1;
    limit = 10;
    offset = 0;
    canFetch = true;
    constructor(props) {
        super(props);

        this.state.fetching = true;
        this.fetchRequests(false);
        this.props.navigation.addListener('didFocus', (status: boolean) => {
            this.handlerRefresh();
            try{
                firebase.notifications().removeDeliveredNotification('request');
            } catch (e) {}
        });
    }

    componentWillMount() {
        try{
            firebase.notifications().removeDeliveredNotification('request');
        } catch (e) {}
        EventBus.on("pushNotification", (name) => {

            if (this.props.navigation.isFocused()) {
                this.fetchRequests(false);
            }
            try{
                firebase.notifications().removeDeliveredNotification('request');
            } catch (e) {}
        });
    }

    fetchRequests(type) {
        if (!this.canFetch) return;
        let pageOffset = this.limit + this.offset;
        this.offset = pageOffset;
        let page  = pageOffset / this.limit;
        Api.get("friend/requests", {
            page : page,
            userid : this.props.userid,
            lists : this.props.requests,
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

        this.fetchRequests(false);
    }

    onScroll(event) {
        return this.props.component.onScroll(event)
    }


    render() {
        return (
            <Container>
                <View style={{flex: 1,flexDirection:'column',marginBottom:70}}>
                    <AnimatedFlatList
                        scrollEventThrottle={1}
                        overScrollMode="never"
                        onScroll={this.onScroll.bind(this)}
                        style={{flex:1}}
                        onEndReachedThreshold={.5}
                        onEndReached={(d) => {
                            //this.fetchRequests();
                            if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                                this.fetchRequests(true);
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
                            <EmptyComponent text={this.lang.t('no_friends_request')} icon="user-unfollow"/>
                        )}
                        ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {(!this.state.fetchFinished) ? (
                            <ActivityIndicator size='large' />
                        ) : null}

                    </View>}
                    renderItem={({ item ,index}) => (
                        <Item style={{padding: 10,flexDirection: 'row'}}>
                            <TouchableOpacity onPress={() => {
                                this.props.navigation.push("profile", {
                                    id : item.userid
                                });
                            }}>
                                <Thumbnail square source={{uri : item.avatar}}/>
                            </TouchableOpacity>
                            <View style={{flex: 1,marginLeft: 10}}>
                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.push("profile", {
                                        id : item.userid
                                    });
                                }}>
                                    <Text style={{fontWeight: 'bold',color:'black'}}>{item.name}</Text>
                                </TouchableOpacity>
                            </View>
                            {item.accepted === undefined ? (
                                <View style={{flexDirection: 'row'}}>
                                    <Button  onPress={() => {
                                        return this.deleteRequest(item,index)
                                    }} small light rounded noS>
                                        <Icon style={{fontSize: 15}} name="user-unfollow" type="SimpleLineIcons"/>
                                    </Button>

                                    <Button onPress={() => {
                                        return this.acceptRequest(item,index)
                                    }} small primary rounded style={{marginLeft: 10}}>
                                        <Icon style={{fontSize: 15}}  name="user-follow" type="SimpleLineIcons"/>
                                    </Button>
                                </View>
                            ) : null}
                        </Item>
                )}
                    />
                </View>
            </Container>
        )
    }

    deleteRequest(item, index) {
        let lists = [...this.state.itemLists];
        lists.splice( lists.indexOf(index), 1 );
        this.updateState({itemLists: lists});
        Api.get("friend/remove", {
            userid : this.props.userid,
            to_userid : item.id
        }).then((res) => {

        });
    }

    acceptRequest(item, index) {
        this.updateState(update(this.state, {
            itemLists : {
                [index] : {accepted : {$set : true}}
            }
        }));
        Api.get("friend/confirm", {
            userid : this.props.userid,
            to_userid : item.id
        });
    }
}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
    }
})(Requests)