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

import material from "../../native-base-theme/variables/material";
import Api from "../../api";

class GroupMembers extends BaseComponent {
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
        this.item = this.props.item;
        this.justLanded = true;
        this.fetchMembers();
    }

    getListFooter = () => {
        if (this.state.fetchFinished) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size='large' />
            </View>
        )
    };

    fetchMembers(type) {
        let pageOffset = this.limit + this.offset;
        this.offset = pageOffset;
        let page  = (type) ? pageOffset / this.limit : 1;

        let call = null;
        call = Api.get("group/members", {
            userid : this.props.userid,
            group_id : this.props.item.id,
            page : page,
            limit : this.limit
        });
        call.then((res) => {

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
        }).catch((e) => {

            this.updateState({itemListNotEnd: true,fetchFinished: true})
        });

    }
    render() {

        return (
            <Container style={{backgroundColor:'white'}}>

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
                                this.fetchMembers(true);
                            }

                            return true;
                        }}
                        extraData={this.state}
                        refreshing={this.state.refreshing}
                        onRefresh={() => {
                            this.offset = 0;
                            this.fetchMembers(false);
                        }}
                        ListFooterComponent={this.getListFooter}
                        ListEmptyComponent={!this.state.fetchFinished ? (
                            <Text/>
                        ) : (<EmptyComponent text={this.lang.t('no_members_found')}/>)}
                        renderItem={({ item ,index}) => (

                            <Item

                                style={{padding:10}}>
                                <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
                                    this.props.navigation.push("profile", { id: item.id });
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
})(GroupMembers)