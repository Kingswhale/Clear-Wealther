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
import material from "../../native-base-theme/variables/material";
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

import {getFriends} from "./store";

class SelectFriends extends BaseComponent {
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
        this.renderType = 'select';
        if (this.props.profile !== undefined) this.renderType = "profile";
        this.justLanded = true;
        this.fetchFriends();
    }

    isSelected(user) {
        for(let i = 0;i<this.state.selected.length;i++) {
            if (user.userid === this.state.selected[i].userid) return true;
        }
        return false;
    }

    getListFooter = () => {
        if (this.state.fetchFinished) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size='large' />
            </View>
        )
    };

    selectUser(user) {
        let newUsers = [];
        let removing = false;
        for(let i = 0;i<this.state.selected.length;i++) {
            if (user.userid === this.state.selected[i].userid) {
                removing = true;
            } else {
                newUsers.push(this.state.selected[i]);
            }
        }
        if (!removing) newUsers.push(user);
        //console.log(newUsers);
        this.updateState({
            selected : newUsers
        });
    }

    fetchFriends(type) {
        let pageOffset = this.limit + this.offset;
        this.offset = pageOffset;
        let page  = pageOffset / this.limit;
        getFriends({
            userid : this.props.userid,
            theUserid : (this.props.theUserid === undefined) ? this.props.userid : this.props.theUserid,
            term : this.state.searchText,
            page : page,
            type : type,
            lists: this.props.friends
        }).then((res) => {
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

    onScroll(event) {
        //console.log(this.renderType);
        if (this.renderType === 'profile') {
            this.props.component.onScroll(event);
        }
    }

    render() {
        if (this.state.searchHeader) {
            setTimeout(() => {
                this.searchInput._root.focus();
            }, 200)
        }
        return (
            <Container style={{backgroundColor:'white'}}>
                {this.renderType === 'select' ? (
                    <View>
                        {!this.state.searchHeader ? (
                            <Header hasTabs>
                                <Left>
                                    <Button onPress={() => this.props.navigation.goBack()} transparent>
                                        <Icon name="ios-arrow-round-back" />
                                    </Button>
                                </Left>
                                <Body >
                                <Text style={{color:'white',fontSize: 16,left:-10}}>{this.lang.t('select_friends')}</Text>
                                </Body>

                                <Right>
                                    <Button transparent onPress={() => this.updateState({searchHeader: true})}>
                                        <Icon name="ios-search"  />
                                    </Button>

                                    <Button transparent onPress={() => {
                                        this.submitToRequestor();
                                    }}>
                                        <Icon name="md-checkmark" />
                                    </Button>
                                </Right>
                            </Header>
                        ) : (
                            <Header hasTabs  rounded>
                                <View style={{flexDirection:'row',width:'100%'}}>
                                    <Item style={{bottom: 3,borderRadius:10,flex:1,backgroundColor:material.brandPrimary,borderColor:material.brandPrimary}}>
                                        <Icon style={{color:'white'}} name="ios-search" />
                                        <Input ref={(ref) => this.searchInput = ref} placeholder="Search friends"  onChangeText={(text) => {
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
                                            <Icon style={{color:'white'}} name="ios-close-outline" />
                                        </TouchableOpacity>
                                    </Item>
                                    <Button transparent style={{bottom: 7}} onPress={() => {
                                        this.submitToRequestor();
                                    }}>
                                        <Icon style={{color:'white'}} name="md-checkmark" />
                                    </Button>
                                </View>
                            </Header>
                        )}
                    </View>
                ) : null}
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
                                this.fetchFriends(true);
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
                                    if (this.renderType === 'select') {
                                        this.selectUser(item);
                                    } else {
                                        this.props.navigation.push("profile", { id: item.id });
                                    }
                                }}>
                                    <View style={{flexDirection:'row',flex: 1}}>
                                        <Thumbnail square style={{width:50,height:50,borderRadius:25}} source={{ uri: item.avatar }} />
                                        <View style={{flexDirection: 'column',marginLeft:10}}>
                                            <Text style={{marginTop:5}}>{item.first_name} {item.last_name}</Text>
                                            {this.renderType === 'select' ? (
                                                <Text note style={{color:'lightgrey'}}>{this.lang.t('tap_to_select_user')} . .</Text>
                                            ) : null}
                                        </View>
                                    </View>
                                    {this.renderType === 'select' ? (
                                        <Icon style={{color: (this.isSelected(item)) ? material.brandPrimary : "lightgrey",fontSize:20}} name="md-checkmark"/>
                                    ) : null}
                                </TouchableOpacity>
                            </Item>
                        )}
                    />
                </View>
            </Container>
        )
    }

    submitToRequestor() {
        this.props.navigation.getParam("obj").receiveUsers(this.state.selected);
        this.props.navigation.goBack();
    }
}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        friends : state.user.friends,
        pageEndReached : state.user.pageEndReached
    }
})(SelectFriends)