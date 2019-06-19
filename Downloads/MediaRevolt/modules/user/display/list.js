import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {connect} from "react-redux";
import {View,TouchableOpacity,Text} from 'react-native';
import {Right,Button,Icon} from 'native-base';
import FastImage from 'react-native-fast-image';
import {acceptRequests, addFriend, deleteRequests, follow} from "../store";
import update from 'immutability-helper';

class UserList extends BaseComponent {
    constructor(props) {
        super(props);

    }


    render() {
        this.user = this.props.user;
        this.component = this.props.component;
        this.listId = this.props.listId;
        this.index = this.props.index;
        return (
            <View style={{flexDirection:'row',padding:10,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.push("profile", {
                        id : this.user.id
                    })
                }}>
                    <FastImage source={{ uri: this.user.avatar }} style={{width:60,height:60,borderRadius:30}} />
                </TouchableOpacity>
                <View style={{flex:1, marginLeft:10}}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.push("profile", {
                            id : this.user.id
                        })
                    }}>
                        <Text style={{fontWeight:'bold',marginTop: 10,color:'grey'}}>{this.user.name}</Text>
                    </TouchableOpacity>
                </View>
                <Right>
                    {this.user.friend_status === '0' ? (
                        <Button
                            onPress={() => {
                                this.updateFriendStatus(1);
                                addFriend({
                                    userid : this.props.userid,
                                    theUserid : this.user.id
                                });
                            }}
                            small iconLeft light>
                            <Icon name='md-person-add' />
                            <Text style={{marginLeft:4,marginRight:5}}>{this.lang.t('add_friend')}</Text>
                        </Button>
                    ) : null}

                    {this.user.friend_status === 2 ? (
                        <Button
                            onPress={() => {
                                this.updateFriendStatus('0');
                                deleteRequests({
                                    userid : this.props.userid,
                                    toUserid : this.user.id
                                })
                            }}
                            small iconLeft light>
                            <Icon name='md-person-add' />
                            <Text style={{marginLeft:4,marginRight:5}}>{this.lang.t('unfriend')}</Text>
                        </Button>
                    ) : null}

                    {this.user.friend_status === 1 ? (
                        <Button
                            onPress={() => {
                                this.updateFriendStatus('0');
                                deleteRequests({
                                    userid : this.props.userid,
                                    toUserid : this.user.id
                                });
                            }}
                            small iconLeft light>
                            <Icon name='md-person-add' />
                            <Text style={{marginLeft:4,marginRight:5}}>{this.lang.t('friend_requested')}</Text>
                        </Button>
                    ) : null}

                    {this.user.friend_status === 3 ? (
                        <Button
                            onPress={() => {
                                this.updateFriendStatus(2);
                                acceptRequests({
                                    userid : this.props.userid,
                                    toUserid : this.user.id
                                });
                            }}
                            small iconLeft light>
                            <Icon name='md-person-add' />
                            <Text style={{marginLeft:4,marginRight:5}}>{this.lang.t('respond_request')}</Text>
                        </Button>
                    ) : null}


                </Right>
            </View>
        );
    }

    updateFriendStatus(type) {
        //console.log(this.index);
        this.component.updateState(update(this.component.state, {
            [this.listId] : {
                [this.index] : {friend_status : {$set : type}}
            }
        }));
    }

    updateFollowStatus(type) {
        let lists = this.component.state[this.listId];
        lists[this.index].follow_status = type;
        this.component.updateState({
            [this.listId] : lists
        });
    }
}


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        profileDetails : state.user.profileDetails
    }
})(UserList)