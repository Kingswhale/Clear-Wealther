import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {FlatList, Text, Image, TouchableOpacity, View, ActivityIndicator, Animated} from 'react-native';
import {
    Container,
    Header,
    Left,
    Body,
    Icon,
    Button,
    Content,
    ListItem,
    Right,
    Item,
    Input,Thumbnail,List
} from 'native-base';

import {connect} from "react-redux";
import EmptyComponent from "../../utils/EmptyComponent";
import FastImage from 'react-native-fast-image'
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

import {getFriends} from "./store";
import material from "../../native-base-theme/variables/material";
import Api from "../../api";

class People extends BaseComponent {
    page = 1;
    limit = 20;
    offset = 0;

    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            selected : [],
            searchHeader : false,
            searchText : '',
            refreshing : false
        };
        this.renderType = this.props.navigation.getParam("type", 'people');
        this.justLanded = true;
        this.fetchFriends();
    }

    getListFooter = () => {
        if (this.state.fetchFinished) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size='large' />
            </View>
        )
    };

    fetchFriends(type) {
        let pageOffset = this.limit + this.offset;
        this.offset = pageOffset;
        let page  = (type) ? pageOffset / this.limit : 1;

        let call = null;
        if (this.renderType === 'people') {
            call = Api.get("friend/suggestions", {
                userid : this.props.userid,
                term : this.state.searchText,
                page : page,
                limit : this.limit
            });
        } else {
            call = Api.get("friend/online", {
                userid : this.props.userid,
                term : this.state.searchText,
                page : page,
                limit : this.limit
            });
        }
        call.then((res) => {
            console.log(res);
            if (res.length  > 0) {
                if (type) {
                    //more
                    let lists = [];
                    lists.push(...this.state.itemLists);
                    lists.push(...res);

                    this.updateState({itemLists: lists,fetchFinished: true})
                } else {
                    //refresh
                    this.updateState({itemLists: res,fetchFinished: true})
                }
            } else {
                this.updateState({itemListNotEnd: true,fetchFinished: true})
            }
        });

    }
    render() {
        if (this.state.searchHeader) {
            setTimeout(() => {
                this.searchInput._root.focus();
            }, 200)
        }
        return (
            <Container style={{backgroundColor:'white'}}>
                {this.renderType === 'people' ? (
                    <View>
                        {!this.state.searchHeader ? (
                            <Header hasTabs>
                                <Left>
                                    <Button onPress={() => this.props.navigation.goBack()} transparent>
                                        <Icon name="ios-arrow-round-back" />
                                    </Button>
                                </Left>
                                <Body >
                                <Text style={{color:'white',fontSize: 16,left:-10}}>{this.lang.t('find_friends')}</Text>
                                </Body>

                                <Right>
                                    <Button transparent onPress={() => this.updateState({searchHeader: true})}>
                                        <Icon name="ios-search"  />
                                    </Button>
                                </Right>
                            </Header>
                        ) : (
                            <Header hasTabs  rounded>
                                <View style={{flexDirection: 'row',width:'100%'}}>
                                    <Item style={{bottom: 3,borderRadius:10,flex: 1,backgroundColor: material.brandPrimary,borderColor:material.brandPrimary}}>
                                        <Icon name="ios-search" style={{color:'white'}} />
                                        <Input ref={(ref) => this.searchInput = ref} placeholder={this.lang.t('search')}  onChangeText={(text) => {
                                            this.updateState({
                                                searchText : text
                                            });
                                            this.offset = 0;
                                            this.fetchFriends(false);
                                        }}/>
                                        <TouchableOpacity onPress={() => {
                                            this.updateState({
                                                searchHeader : false,
                                                searchText: ''
                                            });
                                            this.offset = 0;
                                            this.fetchFriends(false);
                                        }}>
                                            <Icon name="ios-close-outline" style={{color:'white'}}/>
                                        </TouchableOpacity>
                                    </Item>
                                </View>
                            </Header>
                        )}
                    </View>
                ) : (
                    <Header hasTabs>
                        <Left>
                            <Button onPress={() => this.props.navigation.goBack()} transparent>
                                <Icon name="ios-arrow-round-back" />
                            </Button>
                        </Left>
                        <Body >
                        <Text style={{color:'white',fontSize: 16,left:-10}}>{this.lang.t('online_friends')}</Text>
                        </Body>

                        <Right/>
                    </Header>
                )}
                <View style={{flex: 1}}>
                    <AnimatedFlatList
                        keyExtractor={(item, index) => item.id}
                        data={this.state.itemLists}
                        style={{flex:1}}
                        overScrollMode="never"
                        scrollEventThrottle={16}
                        ref='_flatList'
                        onScroll={this.onScroll.bind(this)}
                        onEndReachedThreshold={.5}
                        onEndReached={(d) => {
                            //this.fetchRequests();
                            if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                                if(this.renderType === 'people') this.fetchFriends(true);
                            }

                            return true;
                        }}
                        extraData={this.state}
                        refreshing={this.state.refreshing}
                        onRefresh={() => {
                            this.offset = 0;
                            this.fetchFriends(false);
                        }}
                        ListFooterComponent={this.getListFooter}
                        ListEmptyComponent={!this.state.fetchFinished ? (
                            <Text/>
                        ) : (<EmptyComponent text={this.lang.t('no_friends_found')}/>)}
                        renderItem={({ item ,index}) => (

                            <Item

                                style={{padding:10}}>
                                <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
                                    if (this.renderType === 'online') {
                                        this.props.navigation.push("chat", {
                                            userid : item.id,
                                            avatar : item.avatar,
                                            cid : '',
                                            name : item.first_name + ' ' + item.last_name
                                        })
                                    } else {
                                        this.props.navigation.push("profile", { id: item.id });
                                    }
                                }}>
                                    <View style={{flexDirection:'row',flex: 1}}>
                                        <FastImage square style={{width:50,height:50,borderRadius:25}} source={{ uri: item.avatar }} />
                                        <View style={{flexDirection: 'column',marginLeft:10}}>
                                            <Text style={{marginTop:5}}>{item.first_name} {item.last_name}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Item>
                        )}
                    />
                </View>
            </Container>
        )
    }

}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
    }
})(People)