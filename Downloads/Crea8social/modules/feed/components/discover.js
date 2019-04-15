import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator} from 'react-native';
import {
    Header,
    Icon,
    Container,
    Left,Right,Button,Body,Content,Input,Item,Tabs,Tab,ScrollableTab,Badge
} from 'native-base'
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../../../api";
import Feed from '../feed'
import material from "../../../native-base-theme/variables/material";

class Discover extends BaseComponent {
    pages;
    limit = 10;
    constructor(props) {
        super(props);

        //this.state.tab = this.props.navigation.getParam("tab",0);
        this.state = {
            ...this.state,
            feedList : [],
            top : []
        };

        this.pages = {
            feed : 0
        };

        this.state.term = this.props.navigation.getParam("term", "");

        this.discover(false, this.state.term);
        this.playerList = null;
        this.playerListIndex = null;
    }


    discover(type,term) {
        let newoffset = this.limit + this.pages.feed;
        this.updateState({fetchFinished: false});
        this.pages.feed = (type) ? newoffset : 0;
        let page = (type) ? newoffset : 0;
        //console.log('i am hee');
        try{
            Api.get("hashtag/get", {userid : this.props.userid,offset: page, hashtag: term,type:'feed',limit : this.limit})
                .then((res) => {
                    ///console.log(res);
                    if (res.feeds.length > 0) {
                        let list = [];
                        list.push(...this.state.feedList);
                        if (type) {
                            list.push(...res.feeds);
                        } else {
                            list = res.feeds;
                        }
                        this.updateState({feedList: list, top : res.hashtags, fetchFinished: true});
                    } else {
                        this.updateState({ fetchFinished: true, itemListNotEnd: true});
                    }
                });
        } catch (e) {}
    }



    render() {
        //auto focus on the search input

        if (this.state.term === '' && this.state.feedList.length < 1) {
            setTimeout(() => {
                this.searchInput._root.focus();
            }, 200);
        }

        return (
            <Container>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
                <Header hasTabs   noShadow rounded>
                    <View style={{flexDirection: 'row',width:'100%'}}>
                        <Button style={{left:-10}} transparent onPress={() => {
                            this.props.navigation.goBack();
                        }}>
                            <Icon name="ios-arrow-round-back"/>
                        </Button>
                        <Item style={{backgroundColor: material.brandPrimary,borderBottomWidth:0,borderBottomColor:'white',flex:1,bottom:2}}>

                            <Input ref={(ref) => this.searchInput = ref}
                                   onChangeText={(text) => {
                                       this.updateState({term : text});
                                       this.discover(false,text);
                                   }}
                                   value={this.state.term}
                                   style={{color:'white', placeholderTextColor: 'lightgrey'}}
                                   placeholder={this.lang.t('discover_hashtags')} />
                            <Icon style={{color: 'lightgrey'}} name="ios-search" />
                        </Item>
                    </View>
                </Header>
                <FlatList
                    scrollEventThrottle={16}
                    overScrollMode="never"
                    style={{flex:1}}
                    onEndReachedThreshold={.5}
                    onEndReached={(d) => {
                        if (this.state.feedList.length > 0 && !this.state.itemListNotEnd) {
                            this.discover(true);
                        }
                        return true;
                    }}
                    ref='_flatList'
                    data={this.state.feedList}
                    extraData={this.state}
                    refreshing={false}
                    ListHeaderComponent={this.loadHeader()}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {(!this.state.fetchFinished) ? (
                            <ActivityIndicator size='large' />
                        ) : null}</View>}
                    keyExtractor={(item, index) => item.id}
                    renderItem={({ item ,index}) => (
                        <Feed
                            component={this}
                            listId="feedList"
                            index={index}
                            navigation={this.props.navigation}
                            feedType={item.type}
                            entityTypeId={this.props.userid}
                            entityType="user"
                            item={item}/>
                    )}
                />
            </Container>
        );
    }


    loadHeader() {
        if (this.state.top.length > 0) {
            let texts = [];
            for(let i = 0;i<this.state.top.length;i++) {
                texts.push(<TouchableOpacity onPress={() => {
                    this.updateState({term : this.state.top[i].tag});
                    this.discover(false,this.state.top[i].tag);
                }} style={{margin:10}}>
                    <Text>{this.state.top[i].tag}</Text>
                </TouchableOpacity>)
            }
            return (
                <View style={{marginBottom:10,backgroundColor:'white'}}>
                    <View style={{backgroundColor:'white', marginTop:10, marginBottom:7,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                        <View style={{flexDirection: 'row',padding:15,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                            <Badge warning style={{width:30,height:30,borderRadius:15}}><Icon name="ios-compass" style={{color:'white',fontSize:20}} /></Badge>
                            <Text style={{flex:1, marginLeft:10,marginTop:5}}>{this.lang.t('discover')}</Text>
                        </View>
                    </View>

                    <View style={{flexDirection: 'row'}}>
                        {texts}
                    </View>
                </View>
            )
        }
    }
}


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(Discover)