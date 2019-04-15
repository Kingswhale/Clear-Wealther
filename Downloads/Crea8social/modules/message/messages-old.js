import React from 'react';
import BaseComponent from "../../utils/BaseComponent";

import {ActivityIndicator, Animated, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import material from "../../native-base-theme/variables/material";
import {Container,Fab,Icon,Item,Thumbnail ,Badge,Button  } from 'native-base';
import Api from "../../api";
import EmptyComponent from "../../utils/EmptyComponent";
import FastImage from 'react-native-fast-image';
import time from "../../utils/Time";
import EventBus from 'eventing-bus';
import firebase from 'react-native-firebase';
import HTMLView from 'react-native-htmlview'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
class Messages extends BaseComponent {

    constructor(props) {
        super(props);
        this.state.fetching = true;
        this.props.navigation.addListener('didFocus', (status: boolean) => {
            this.handlerRefresh();
            try{
                firebase.notifications().removeDeliveredNotification('message');
            } catch (e) {}
        });

    }

    componentWillMount() {
        this.fetchConversations(false);
        try{
            firebase.notifications().removeDeliveredNotification('message');
        } catch (e) {}
        EventBus.on("pushNotification", (name) => {
            this.fetchConversations(false);
            try{
                firebase.notifications().removeDeliveredNotification('message');
            } catch (e) {}
        });
    }

    onScroll(event) {
        return this.props.component.onScroll(event)
    }


    fetchConversations(type) {
        let pageOffset = this.limit + this.offset;
        this.offset = pageOffset;
        let page  = pageOffset / this.limit;
        Api.get("chat/conversations", {
            page : page,
            userid : this.props.userid,
            type : type
        }).then((res) => {
            console.log(res);
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

        this.fetchConversations(false);
    }


    render() {
        return (
            <Container>
                <AnimatedFlatList
                    scrollEventThrottle={1}
                    overScrollMode="never"
                    onScroll={this.onScroll.bind(this)}
                    style={{flex:1,marginBottom:70}}
                    onEndReachedThreshold={.5}
                    onEndReached={(d) => {
                        
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
                        <EmptyComponent text={this.lang.t('no_messages_found')} icon="speech"/>
                    )}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {(!this.state.fetchFinished) ? (
                            <ActivityIndicator size='large' />
                        ) : null}

                    </View>}
                    renderItem={({ item ,index}) => (
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.push("chat", {
                                userid : item.userid,
                                avatar : item.avatar,
                                cid : item.cid,
                                name : item.title
                            });
                        }}>
                        <View style={{
                            backgroundColor:(item.unread !== '0') ? '#EEEEEE' : 'white',
                            padding: 10,
                            flexDirection: 'row',borderBottomColor:'#C0C0C0',borderBottomWidth:.7}}>

                                <FastImage style={{width:60,height:60,borderRadius:30}} source={{uri : item.avatar}}/>

                            <View style={{flex: 1,marginLeft: 10}}>
                                <Text style={{fontWeight: 'bold',color:'black',marginTop:7}}>{item.title}</Text>
                                <HTMLView style={{flex:1,color: 'grey',margin:10,flexDirection: 'row', flexWrap: 'wrap',marginLeft:0}} textComponentProps={{ style: bghtmlstyles.defaultStyle }}
                                          value={item.message} />
                            </View>
                            <View>
                                <Text style={{marginTop:10,color:'grey',fontSize:12}}>{time.ago(item.time_ago)}</Text>
                                {item.unread !== '0' ? (
                                    <Badge danger style={{backgroundColor: 'grey',position:'absolute',right:5, top:30,width:25,height:25,borderRadius:10}}><Text style={{color:'white',fontSize:9,top:1,left:3}}>{item.unread}</Text></Badge>
                                ) : null}
                            </View>
                        </View>
                        </TouchableOpacity>
                    )}
                />
                <Fab
                    active={this.state.fabActive}
                    direction="up"
                    containerStyle={{ }}
                    style={{
                        bottom:100,
                        backgroundColor: material.accentTextColor,elevation: 0,shadowOffset: {width:0,height:0},shadowOpacity:0}}
                    position="bottomRight"

                    onPress={() => {
                        this.props.navigation.navigate("selectFriends", {
                            obj : this
                        });
                    }}>
                    <Icon name="ios-chatbubbles-outline" />
                </Fab>
            </Container>
        )
    }

    receiveUsers(users) {

        if (users.length > 0) {
            let u = '';
            let title = "";
            let avatar = "";
            for(let i = 0;i<users.length;i++) {
                u += (u === '') ? users[i].userid : ','+users[i].userid;
                if (i === 0) {
                    avatar = users[i].avatar;
                }

                if (i < 2) {
                    title += (title === '' ) ? users[i].first_name : ","+users[i].first_name
                }
            }

            //console.log('Launching ' + u);
            setTimeout(() => {
                this.props.navigation.push("chat", {
                    userid : u,
                    avatar : avatar,
                    cid : "",
                    name : title
                });
            }, 300)
        }
    }
}

var bghtmlstyles = StyleSheet.create({
    defaultStyle: {

        color: 'black',
        fontSize: 15

    }
});

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(Messages)