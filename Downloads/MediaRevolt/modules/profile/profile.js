import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import AlbumCreate from './albumCreate';
import {
    Text, View,
    StyleSheet, ActivityIndicator,
    Animated, Dimensions, TouchableOpacity, FlatList, Alert
} from 'react-native';
import {
    Tabs,
    Icon,
    Tab,
    Button,
    ScrollableTab,
    Item,
    Left,
    Body,
    Right,
    Thumbnail,
    List,
    ListItem, Toast
} from 'native-base'
import FeedComponent from '../feed/components/feed';
import SelectFriends from '../user/selectFriend';
import MyLog from "../../utils/MyLog";
import material from "../../native-base-theme/variables/material";
import {connect} from "react-redux";
import time from "../../utils/Time";
import ProfilePhotos from './photos'
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modalbox';
import {acceptRequests, addFriend, deleteRequests, follow, loadProfile} from "../user/store";
import {Menu,MenuTrigger,MenuOptions,renderers,MenuProvider} from 'react-native-popup-menu';
import ImagePicker from 'react-native-image-crop-picker';
import Api from "../../api";
import Spinner from 'react-native-loading-spinner-overlay';
import storage from "../../store/storage";

class ProfileScreen extends BaseComponent {

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.userid = navigation.getParam('id');
        this.lastScrollPos = 0;

        this.state.processing = false;
        this.state.showHeaderContent  =  true;
        this.state.scrollY =  new Animated.Value(0);

        this.profileDetails = null;
        this.lastScroll = 0;
        this.state.imageTranslate = this.state.scrollY.interpolate({
            inputRange: [0, 20],
            outputRange: [0, -160],
            extrapolate: 'clamp',
        });


    }

    updateProfile() {
        loadProfile({theUserid: this.userid,
            userid : this.props.userid }).then((res) => this.updateState({itemDetails : res,processing:false}));
    }
    componentWillMount() {
        this.updateProfile();
    }


    onScroll(event) {
        const offsetY = event.nativeEvent.contentOffset.y;
        let currentTime = new Date().getTime() / 1000;
        const sensitivity = 130;
        if (Math.abs(offsetY - this.offset) > sensitivity || offsetY === 0) {
            this.offset = offsetY;

            this.isUping = false;
            this.isDowning = true;
            this.lasttime = currentTime;
            Animated.event(
                [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
                {onScroll: this.props.onScroll}
            )(event);

        }

        if (offsetY >= 130) {
            if (this.state.showHeaderContent) {
                this.updateState({
                    showHeaderContent: false
                })
            }
        } else {
            if (!this.state.showHeaderContent) {
                this.updateState({
                    showHeaderContent: true
                })
            }
        }
    }

    showCreateAlbumm() {
        this.refs.albumModal.open();
    }

    hideCreateAlbum() {
        this.refs.albumModal.close();
    }


    render() {
        this.profileDetails = this.state.itemDetails;
        return (
            <MenuProvider customStyles={menuProviderStyles}>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
                <Modal
                    ref={"albumModal"}
                    coverScreen={false}
                    entry="top"
                    position="top"
                    backButtonClose={true}
                    swipeToClose={false}
                    backdropPressToClose={false}
                    onClosingState={this.onClosingState}>
                    <AlbumCreate navigation={this.props.navigation} type="new" component={this}/>
                </Modal>
                {this.state.itemDetails !== null ? (
                    <Animated.View style={{
                        height: Dimensions.get('window').height + 160,
                        transform: [{translateY: this.state.imageTranslate}]
                    }}>
                        <View style={{height:230,backgroundColor: material.brandPrimary,flexDirection: 'column'}}>
                            {this.state.showHeaderContent ? (
                                <FastImage resizeMode="cover"
                                                 style={{width: '100%',height: 230,flex: 1,
                                                     justifyContent: 'center',
                                                     alignItems: 'center'}}
                                                 source={{uri : this.profileDetails.cover}}>
                                    <View style={{height:230,backgroundColor: 'rgba(35,47,61,0.6)',width:'100%',flex:1}}>
                                        {this.renderHeader(false)}
                                        <View style={{position: 'absolute', bottom: 0,width:'100%',padding:20,flexDirection: 'row'}}>
                                            <FastImage
                                                style={{borderColor: 'white',borderWidth: 3,borderRadius: 5,width:80,height:80}}
                                                square large source={{uri : this.profileDetails.avatar}}/>
                                            <View style={{flexDirection: 'column',flex:1, marginLeft:10,marginTop:0}}>
                                                <Text style={{fontSize:16,color:'white'}}>
                                                    {this.profileDetails.name}
                                                    {this.profileDetails.verified ? (
                                                        <Icon name="ios-checkmark-circle" style={{color:'#2196F3',marginTop:10,marginLeft:10}}/>
                                                    ) : null}
                                                </Text>
                                                {this.userid !== this.props.userid ? (
                                                    <View style={{flexDirection:'row',marginTop: 5}}>
                                                        {this.state.itemDetails.friend_status === '0' ? (
                                                            <Button
                                                                onPress={() => {
                                                                    this.updateState({processing : true});
                                                                    addFriend({
                                                                        userid : this.props.userid,
                                                                        theUserid : this.userid
                                                                    }).then((res) => {
                                                                        this.updateProfile();
                                                                    })
                                                                }}
                                                                small iconLeft primary>
                                                                <Icon name='md-person-add' />
                                                                <Text style={{marginLeft:4,marginRight:5,color:'white'}}>{this.lang.t('add_friend')}</Text>
                                                            </Button>
                                                        ) : null}

                                                        {this.state.itemDetails.friend_status === 2 ? (
                                                            <Button
                                                                onPress={() => {
                                                                    this.updateState({processing : true});
                                                                    deleteRequests({
                                                                        userid : this.props.userid,
                                                                        toUserid : this.userid
                                                                    }).then((res) => {
                                                                        this.updateProfile();
                                                                    })
                                                                }}
                                                                small iconLeft light>
                                                                <Icon name='md-person-add' />
                                                                <Text style={{marginLeft:4,marginRight:5}}>{this.lang.t('unfriend')}</Text>
                                                            </Button>
                                                        ) : null}

                                                        {this.state.itemDetails.friend_status === 1 ? (
                                                            <Button
                                                                onPress={() => {
                                                                    this.updateState({processing : true});
                                                                    deleteRequests({
                                                                        userid : this.props.userid,
                                                                        toUserid : this.userid
                                                                    }).then((res) => {
                                                                        this.updateProfile();
                                                                    })
                                                                }}
                                                                small iconLeft light>
                                                                <Icon name='md-person-add' />
                                                                <Text style={{marginLeft:4,marginRight:5}}>{this.lang.t('friend_requested')}</Text>
                                                            </Button>
                                                        ) : null}

                                                        {this.state.itemDetails.friend_status === 3 ? (
                                                            <Button
                                                                onPress={() => {
                                                                    this.updateState({processing : true});
                                                                    acceptRequests({
                                                                        userid : this.props.userid,
                                                                        toUserid : this.userid
                                                                    }).then((res) => {
                                                                        this.updateProfile();
                                                                    })
                                                                }}
                                                                small iconLeft light>
                                                                <Icon name='md-person-add' />
                                                                <Text style={{marginLeft:4,marginRight:5}}>{this.lang.t('respond_request')}</Text>
                                                            </Button>
                                                        ) : null}

                                                        {this.state.itemDetails.follow_status ? (
                                                            <Button
                                                                onPress={() => {
                                                                    this.updateState({processing : true});
                                                                    follow({
                                                                        userid : this.props.userid,
                                                                        theUserid : this.userid,
                                                                        type : 'unfollow'
                                                                    }).then((res) => {
                                                                        this.updateProfile();
                                                                    })
                                                                }}
                                                                small info style={{marginLeft:5,height:29}}>
                                                                <Icon style={{fontSize:12}} name='user-following' type="SimpleLineIcons" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                onPress={() => {
                                                                    this.updateState({processing : true});
                                                                    follow({
                                                                        userid : this.props.userid,
                                                                        theUserid : this.userid,
                                                                        type : 'follow'
                                                                    }).then((res) => {
                                                                        this.updateProfile();
                                                                    })
                                                                }}
                                                                small light style={{marginLeft:5,height:29}}>
                                                                <Icon style={{fontSize:12}} name='user-following' type="SimpleLineIcons" />
                                                            </Button>
                                                        )}
                                                        <Button onPress={() => {
                                                            this.props.navigation.push("chat", {
                                                                userid : this.userid,
                                                                avatar : this.profileDetails.avatar,
                                                                cid : "",
                                                                name : this.profileDetails.name
                                                            });
                                                        }} small light style={{marginLeft:5,height:29}}>
                                                            <Icon style={{color:'#2196F3'}} name='ios-mail'/>
                                                        </Button>
                                                    </View>
                                                ) : (
                                                    <View style={{flexDirection:'row',marginTop: 5}}>
                                                        <Button onPress={() => {
                                                            this.props.navigation.navigate("settings")
                                                        }} small iconLeft light>
                                                            <Icon name='pencil' type="SimpleLineIcons" style={{fontSize: 15}} />
                                                            <Text style={{marginLeft:4,marginRight:5}}>{this.lang.t('edit_profile')}</Text>
                                                        </Button>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </FastImage>
                            ) : (
                                <View style={{height: 70,position:'absolute', bottom:0,flex:1,width: '100%',paddingTop:10,flexDirection:'row'}}>
                                    {this.renderHeader(true)}
                                </View>
                            )}
                        </View>


                        <Tabs
                            ref={(tabView)  => {this.tabView = tabView}}
                            renderTabBar={()=> <ScrollableTab />}
                            tabBarBackgroundColor={'#ffffff'}
                            initialPage={0} style={{
                            paddingTop: 0,
                            backgroundColor: 'white',
                            elevation: 0,shadowOffset: {height: 0, width: 0},
                            shadowOpacity: 0,flex:1}}>
                            <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('timeline')} >
                                <FeedComponent
                                    navigation={this.props.navigation}
                                    type="profile"
                                    feedType="timeline"
                                    feedTypeId={this.userid}
                                    entityId={this.props.userid}
                                    entityType="user"
                                    toUserid={this.userid}
                                    canPost={this.profileDetails.can_post_timeline}
                                    showWelcome={false}
                                    style={{flex: 1}} component={this}/>
                            </Tab>
                            <Tab  heading={this.lang.t('about')} >
                                {this.loadProfileInfo()}
                            </Tab>
                            <Tab  heading={this.lang.t('photos')} >
                                <ProfilePhotos
                                    navigation={this.props.navigation}
                                    component={this}
                                    profileDetails={this.profileDetails}
                                    theUserid={this.userid}/>
                            </Tab>
                            <Tab  heading={this.lang.t('friends')} >
                                <SelectFriends profile={true} navigation={this.props.navigation} profileDetails={this.profileDetails}
                                         theUserid={this.userid} component={this}/>
                            </Tab>

                        </Tabs>

                    </Animated.View>

                ) :(
                    <View style={{flex:1,flexDirection:'column', justifyContent : 'center'}}>
                        <Text/>
                        <ActivityIndicator size='large' style={{marginTop:0}} />
                    </View>
                )}

            </MenuProvider>
        );
    }

    renderHeader(showMore) {
        return (
            <View style={{width:'100%',height:70,flexDirection: 'row',paddingRight:10}}>
                <View style={{flex:1,flexDirection: 'row'}}>
                    <Button transparent onPress={() => {
                        this.props.navigation.goBack()
                    }}>
                        <Icon name="ios-arrow-round-back" style={{color:'white'}}/>
                    </Button>
                    {showMore ? (
                        <View style={{flexDirection: 'row'}}>
                            <Thumbnail style={{marginTop: 5}} small source={{uri : this.profileDetails.avatar}}/>
                            <Text style={{marginLeft: 10,marginTop: 12,color: 'white', fontSize: 15}}>{this.profileDetails.name}</Text>
                        </View>
                    ) : null}
                </View>
                <Button
                    onPress={() => this.menu.open()}
                    transparent style={{right:-15}}>
                    <Icon name="md-more" style={{color:'grey'}} />
                </Button>

                <Menu ref={(c) => this.menu = c} renderer={renderers.SlideInMenu}>
                    <MenuTrigger>

                    </MenuTrigger>
                    <MenuOptions>
                        {this.userid === this.props.userid ? (
                            <View>
                                <ListItem noBorder icon onPress={()=>{
                                    this.menu.close();
                                    ImagePicker.openPicker({
                                    }).then(image => {

                                        let form  = new FormData();
                                        form.append("userid", this.props.userid);
                                        form.append('avatar', {
                                            uri: image.path,
                                            type: image.mime, // or photo.type
                                            name: image.path
                                        });
                                        this.updateState({processing : true});

                                        Api.post("profile/change/avatar", form).then((res) => {
                                            this.updateState({processing : false});
                                            if (res.status === 1) {
                                                let image = res.data_one;
                                                let itemDetails = this.state.itemDetails;
                                                itemDetails.avatar = image;
                                                this.updateState({itemDetails : itemDetails});
                                                Toast.show({
                                                    text : this.lang.t('avatar_changed'),
                                                    type : 'success'
                                                });
                                                storage.set('avatar', image);
                                                this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                                                        userid : this.props.userid,
                                                        username : this.props.username,
                                                        password : this.props.password,
                                                        avatar : image,
                                                        cover : this.props.cover
                                                    }});
                                            } else {
                                                Toast.show({
                                                    text : res.message,
                                                    type : 'danger'
                                                })
                                            }
                                        });
                                    });
                                }}>
                                    <Left><Icon active name="pencil" type="SimpleLineIcons" style={{color:'#2196F3', fontSize: 15}} /></Left>
                                    <Body><Text>{this.lang.t('change_profile_picture')}</Text></Body>
                                </ListItem>

                                <ListItem noBorder icon onPress={()=>{
                                    this.menu.close();
                                    ImagePicker.openPicker({
                                    }).then(image => {
                                        //console.log(images);
                                        this.updateState({processing : true});
                                        let form  = new FormData();
                                        form.append("userid", this.props.userid);
                                        form.append('cover', {
                                            uri: image.path,
                                            type: image.mime, // or photo.type
                                            name: image.path
                                        });

                                        Api.post("profile/change/cover", form).then((res) => {
                                            this.updateState({processing : false});
                                            if (res.status === 1) {
                                                let image = res.data_one;
                                                let itemDetails = this.state.itemDetails;
                                                itemDetails.cover = image;
                                                this.updateState({itemDetails : itemDetails});
                                                Toast.show({
                                                    text : this.lang.t('cover_changed'),
                                                    type : 'success'
                                                })
                                            } else {
                                                Toast.show({
                                                    text : res.message,
                                                    type : 'danger'
                                                })
                                            }
                                        });
                                    });
                                }}>
                                    <Left><Icon active name="picture" type="SimpleLineIcons" style={{color:'#2196F3', fontSize: 15}} /></Left>
                                    <Body><Text>{this.lang.t('change_profile_cover')}</Text></Body>
                                </ListItem>
                            </View>
                        ) : (
                            <View>
                                <ListItem noBorder icon onPress={()=>{
                                    this.menu.close();

                                }}>
                                    <Left><Icon active name="pencil" type="SimpleLineIcons" style={{color:'#2196F3', fontSize: 15}} /></Left>
                                    <Body><Text>{this.lang.t('report_user')}</Text></Body>
                                </ListItem>
                            </View>
                        )}
                    </MenuOptions>
                </Menu>
            </View>
        );
    }

    loadProfileInfo() {
        return (
            <FlatList
                scrollEventThrottle={16}
                overScrollMode="never"
                onScroll={this.onScroll.bind(this)}
                style={{flex:1}}
                data={this.profileDetails.profile_info}
                keyExtractor={(item, index) => item.name}
                ListHeaderComponent={<List>
                    <ListItem itemHeader first>
                        <Text> {this.profileDetails.name} {this.lang.t('information')}</Text>
                    </ListItem>
                </List>}
                renderItem={({ item ,index}) => (
                    <List>
                        <ListItem >
                            <View style={{flexDirection: 'row'}}>
                                <View>
                                    <Text style={{fontWeight: 'bold'}}>{this.lang.t(item.name)}</Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={{alignSelf: 'flex-end'}}>{(item.name === 'online_time') ? time.format(item.value) : item.value}</Text>
                                </View>
                            </View>
                        </ListItem>
                    </List>
                )}
            />
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'column'
    },
    backdrop: {
        backgroundColor: 'black',
        opacity: 0.5,
    },
    anchorStyle: {
        backgroundColor: 'blue',
    },
});

const menuProviderStyles = {
    menuProviderWrapper: styles.container,
    backdrop: styles.backdrop,
};

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        cover : state.auth.cover,
        password : state.auth.password,
        profileDetails : state.user.profileDetails
    }
})(ProfileScreen)