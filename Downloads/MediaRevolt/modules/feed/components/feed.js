import React from 'react';

import {FlatList,Animated,ActivityIndicator,Text,View,ScrollView} from 'react-native';
import BaseComponent from "../../../utils/BaseComponent";
import {
    Container,
    Toast,Fab,Icon
} from 'native-base';
import {connect} from "react-redux";
import Feed from '../feed'
import FeedHeader from '../feedHeader';
import MyLog from "../../../utils/MyLog";
import {fetchFeeds} from "../store";
import {cachedFeeds} from "../../../App";
import material from "../../../native-base-theme/variables/material";
import EmptyComponent from "../../../utils/EmptyComponent";
import storage from "../../../store/storage";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const lodash = require('lodash');

class FeedComponent extends BaseComponent {
    offset =  0;
    limit =  5;
    action = 'fresh';
    constructor(props) {
        super(props);
        this.state.sort = 'all';

        this.playerList = null;
        this.playerListIndex = null;
    }

    onScroll(event) {

        return this.props.component.onScroll(event)
    }

    sortBy(by) {
        this.state.sort = by;
        this.updateState({sort : by,itemLists : [], fetchFinished : false});
        this.offset = 0;
        this.fetchPosts(false);
    }

    fetchPosts(action) {
        let pageOffset = this.offset;
        this.offset = pageOffset + this.limit;
        this.updateState({fetchFinished : false});
        fetchFeeds({
            type: this.props.type,
            userid : this.props.userid,
            feedType : this.props.feedType,
            feedTypeId : this.props.feedTypeId,
            action : this.action,
            offset : pageOffset,
            sortBy : this.state.sort
        }).then((res) => {
            if (res.length  > 0) {
                if (action) {
                    //more
                    let lists = [];
                    lists.push(...this.state.itemLists);
                    lists.push(...res);

                    this.updateState({itemLists: lists,fetchFinished: true})
                } else {
                    //refresh
                    if (this.props.type === 'feed') {
                        //newsfeed_cache
                        let content = JSON.stringify(res);
                        storage.set("newsfeed_cache", content);
                    }
                    let lists = [];
                    lists.push(...res);
                    this.updateState({itemLists: [],fetchFinished: true})
                    this.updateState({itemLists: lodash.cloneDeep(lists),fetchFinished: true})
                }
            } else {
                this.updateState({itemListNotEnd: true,fetchFinished: true})
            }
        }).catch((e) => {
            if (this.props.type === 'feed' && !action) {
                if (cachedFeeds !== null) {

                    let lists = JSON.parse(cachedFeeds);
                    this.updateState({itemLists: lists,fetchFinished: true});
                } else {
                    this.updateState({itemListNotEnd: true,fetchFinished: true})
                }
            } else {
                this.updateState({itemListNotEnd: true,fetchFinished: true})
            }
        })
    }

    componentDidMount() {
        if (cachedFeeds !== null && this.props.type === 'feed') {

            let lists = JSON.parse(cachedFeeds);
            this.updateState({itemLists: lists,fetchFinished: true});
        }
        this.fetchPosts(false);
    }

    render() {
        return (

            <Container>
                <View style={{flex: 1,flexDirection:'column'}}>
                    <AnimatedFlatList
                        scrollEventThrottle={16}
                        overScrollMode="never"
                        onScroll={this.onScroll.bind(this)}
                        style={{flex:1}}
                        onEndReachedThreshold={.5}
                        onEndReached={(d) => {
                            //console.log(d.distanceFromEnd )
                            if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd && this.state.fetchFinished) {
                                this.fetchPosts(true);
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
                        ListEmptyComponent={!this.state.fetchFinished ? (
                            <Text/>
                        ) : (<EmptyComponent paddingTop={70} icon="cup" text={this.lang.t('no_post_found')}/>)}
                        ListHeaderComponent=<FeedHeader
                        filter={true}
                        feedType={this.props.feedType}
                        feedTypeId={this.props.feedTypeId}
                        entityId={this.props.entityId}
                        entityType={this.props.entityType}
                        toUserid={this.props.toUserid}
                        component={this}
                        canPost={this.props.canPost}
                        showWelcome={this.props.showWelcome}
                        selectedFilter={this.props.feedFilter}
                        navigation={this.props.navigation}
                    />
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                    {(!this.state.fetchFinished) ? (
                        <ActivityIndicator size='large' />
                    ) : null}

                </View>}
                    renderItem={({ item ,index}) => (
                    <Feed
                        component={this}
                        listId="itemLists"
                        index={index}
                        navigation={this.props.navigation}
                        feedType={this.props.type}
                        entityTypeId={this.props.entityId}
                        entityType={this.props.entityType}
                        item={item}/>
                )}
                    />
                </View>

                {this.props.showFab !== undefined ? (
                    <Fab
                        direction="up"
                        containerStyle={{ }}
                        style={{ bottom:100,backgroundColor: material.accentTextColor,elevation: 0,shadowOffset: {width:0,height:0},shadowOpacity:0}}
                        position="bottomRight"

                        onPress={() => {
                            this.props.navigation.navigate("feedEditor", {
                                type: this.props.feedType,
                                typeId: this.props.feedTypeId,
                                entityId: this.props.entityId,
                                entityType: this.props.entityType,
                                toUserid: this.props.toUserid,
                                component : this
                            });
                        }}>
                        <Icon name="add" />
                    </Fab>
                ) : null}
            </Container>
    );
    }

    finishedPosting(feedPosted) {
        let lists = [];
        lists.push(feedPosted);
        lists.push(...this.state.itemLists);
        this.updateState({
        itemLists : lists
    });
    }

    caller() {
        Toast.show({
            text: 'Just testing'
        })
    }
    handlerRefresh() {
        this.offset = 0;
        this.fetchPosts(false);
    }
    }

    export default connect((state) => {
        return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        feeds : state.feed.feeds,
        profileFeeds : state.feed.profileFeeds,
        feedErrors : state.feed.feedErrors,
        feedFetchStart : state.feed.feedFetchStart,
        feedRefreshing: state.feed.feedRefreshing,
        feedUpdated : state.feed.feedUpdated
    }
    })(FeedComponent)