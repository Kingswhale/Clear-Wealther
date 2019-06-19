import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
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
import EmptyComponent from "../../../utils/EmptyComponent";
import FastImage from 'react-native-fast-image'
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

import {getFriends} from "../../../store";
import material from "../../../native-base-theme/variables/material";
import Api from "../../../api";
import Assets from '@assets/assets'

const images = [
    {id: 'like', img: Assets.like,type: 1},
    {id: 'love', img: Assets.love,type: 4},
    {id: 'haha', img: Assets.haha,type: 5},
    {id: 'yay', img: Assets.yay,type: 6},
    {id: 'wow', img: Assets.wow,type: 7},
    {id: 'sad', img: Assets.sad,type: 8},
    {id: 'angry', img: Assets.angry,type: 9}
];


class Likes extends BaseComponent {
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
        this.type = this.props.navigation.getParam("type", 'type');
        this.typeId = this.props.navigation.getParam("typeId");
        this.fetchLikes();
    }

    getListFooter = () => {
        if (this.state.fetchFinished) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size='large' />
            </View>
        )
    };

    fetchLikes(type) {
        let call = Api.get("react/load", {
            userid : this.props.userid,
            limit : 100,
            type : this.type,
            type_id : this.typeId
        });
        call.then((res) => {
            if (res.members.length  > 0) {
                console.log(res.members);
                this.updateState({itemLists: res.members,fetchFinished: true})
            } else {
                this.updateState({itemListNotEnd: true,fetchFinished: true})
            }
        });

    }
    render() {

        return (
            <Container style={{backgroundColor:'white'}}>
                <View>
                    <Header hasTabs>
                        <Left>
                            <Button onPress={() => this.props.navigation.goBack()} transparent>
                                <Icon name="ios-arrow-round-back" />
                            </Button>
                        </Left>
                        <Body >
                        <Text style={{color:'white',fontSize: 16,left:-60}}>{this.lang.t('people')}</Text>
                        </Body>


                    </Header>
                </View>
                <View style={{flex: 1}}>
                    <AnimatedFlatList
                        keyExtractor={(item, index) => item.id}
                        data={this.state.itemLists}
                        style={{flex:1}}
                        overScrollMode="never"
                        scrollEventThrottle={16}
                        ref='_flatList'
                        onEndReachedThreshold={.5}

                        extraData={this.state}
                        refreshing={this.state.refreshing}
                        onRefresh={() => {
                            this.offset = 0;
                            this.fetchLikes(false);
                        }}
                        ListFooterComponent={this.getListFooter}
                        ListEmptyComponent={!this.state.fetchFinished ? (
                            <Text/>
                        ) : (<EmptyComponent text={this.lang.t('no_people_found')}/>)}
                        renderItem={({ item ,index}) => (
                            this.display(item,index)
                        )}
                    />
                </View>
            </Container>
        )
    }

    display(item,index) {

        let likeType = this.getLike(item[1]);
        return (<Item

            style={{padding:10}}>
            <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
                this.props.navigation.push("profile", { id: item[3] });
            }}>
                <View style={{flexDirection:'row',flex: 1}}>
                    <FastImage square style={{width:50,height:50,borderRadius:25}} source={{ uri: item[0] }} />
                    <View style={{flexDirection: 'column',marginLeft:10}}>
                        <Text style={{marginTop:5}}>{item[2]}</Text>
                        {likeType ? (
                            <View style={{flexDirection:'row', marginTop:4}}>
                                <Image source={likeType.img} style={{width:20,height:20}}/>
                            </View>
                        ) : null}
                    </View>
                </View>
            </TouchableOpacity>
        </Item>)
    }

    getLike(type) {
        for(let i=0;i<images.length;i++) {
            let r = images[i];
            if (r.type.toString() === type) return r;
        }

        return false;
    }
}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
    }
})(Likes)