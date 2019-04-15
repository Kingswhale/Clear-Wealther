import React from 'react';
import {
    Text, View,
    StyleSheet, ActivityIndicator,
    Animated, Dimensions, TouchableOpacity, FlatList, Alert,ScrollView
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
    CardItem,
    List,
    ListItem, Toast
} from 'native-base'
import {connect} from "react-redux";
import FeedComponent from '../feed/components/feed';
import Spinner from 'react-native-loading-spinner-overlay';
import Api, {LIKE_TYPE, WEBSITE} from "../../api";
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modalbox';
import {Menu,MenuTrigger,MenuOptions,renderers,MenuProvider} from 'react-native-popup-menu';
import ProfileBaseComponent from "../../utils/profileBaseComponent";
import material from "../../native-base-theme/variables/material";
import GroupCreate from './groupCreate';
import HTMLView from 'react-native-htmlview'
import Share from "react-native-share";
import time from "../../utils/Time";
import ImagePicker from 'react-native-image-crop-picker';
import GroupMembers from './groupMembers';


class GroupView extends ProfileBaseComponent {
    constructor(props) {
        super(props);

        this.type = this.props.type;
        this.itemId = this.props.navigation.getParam("itemId");

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
        this.state = {
            ...this.state,
            processing : false,
            dataLoaded : false
        };

        this.itemName = 'group';
        // this.loadItemDetail();

    }

    finishedEdit(res) {
        this.updateState({itemDetails: res});
    }

    componentDidMount() {
        this.loadItemDetail();
    }

    loadItemDetail() {

        this.updateState({
            itemDetails : this.props.navigation.getParam("item"),
            dataLoaded: true
        });

    }

    render() {
        //console.log(this.state.itemDetails);
        return (
            <MenuProvider customStyles={menuProviderStyles}>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />

                {this.state.itemDetails !== null ? (
                    <View style={{flex:1,backgroundColor: 'white'}}>
                        <Modal
                            ref={"createModal"}
                            coverScreen={false}
                            entry="top"
                            position="top"
                            backButtonClose={true}
                            swipeToClose={false}
                            backdropPressToClose={false}
                            onClosingState={this.onClosingState}>
                            <GroupCreate navigation={this.props.navigation} type="edit" item={this.state.itemDetails} itemId={this.state.itemDetails.id} component={this}/>
                        </Modal>
                        <Animated.View style={{
                            height: Dimensions.get('window').height + 160,
                            transform: [{translateY: this.state.imageTranslate}],
                        }}>

                            <View style={{height:230,backgroundColor: material.brandPrimary,flexDirection: 'column'}}>
                                {this.state.showHeaderContent ? (
                                    <FastImage source={{uri : this.state.itemDetails.cover}} style={{height:230}}>
                                        <View style={{height:230,backgroundColor: 'rgba(35,47,61,0.6)',width:'100%',flex:1}}>
                                            {this.renderHeader(false)}
                                            <View style={{position: 'absolute', bottom: 0,width:'100%',padding:20,flexDirection: 'row'}}>
                                                <FastImage
                                                    style={{borderColor: 'white',borderWidth: 3,borderRadius: 5,width:80,height:80}}
                                                    square large source={{uri : this.state.itemDetails.logo}}/>
                                                <View style={{flexDirection: 'column',flex:1, marginLeft:10,marginTop:0}}>
                                                    <Text style={{fontSize:20,color:'white',marginTop:10}}>
                                                        {this.state.itemDetails.title}
                                                    </Text>

                                                    {this.state.itemDetails.is_member ? (
                                                        <Button
                                                            onPress={() => {
                                                                this.updateState({processing: true});
                                                                Api.get("group/join", {
                                                                    userid : this.props.userid,
                                                                    group_id : this.state.itemDetails.id,
                                                                    status : 1
                                                                }).then((res) => {
                                                                    let details = {...this.state.itemDetails, is_member: false};
                                                                    this.updateState({processing:false,itemDetails: details});
                                                                }).catch((e) => {
                                                                    this.updateState({processing: false});
                                                                })
                                                            }}
                                                            light small style={{borderRadius:5,marginTop:10}}>
                                                            <Text style={{marginLeft:15,marginRight:15}}>{this.lang.t('leave_group')}</Text>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onPress={() => {
                                                                this.updateState({processing: true});
                                                                Api.get("group/join", {
                                                                    userid : this.props.userid,
                                                                    group_id : this.state.itemDetails.id,
                                                                    status : 0
                                                                }).then((res) => {
                                                                    let details = {...this.state.itemDetails, is_member: true};
                                                                    this.updateState({processing:false,itemDetails: details});
                                                                }).catch((e) => {
                                                                    this.updateState({processing: false});
                                                                })
                                                            }}
                                                            light small style={{borderRadius:5,marginTop:10}}>
                                                            <Text style={{marginLeft:15,marginRight:15}}>{this.lang.t('join_group')}</Text>
                                                        </Button>
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
                                initialPage={0} style={{
                                paddingTop: 0,
                                backgroundColor: 'white',
                                elevation: 0,shadowOffset: {height: 0, width: 0},
                                shadowOpacity: 0,flex:1}}>
                                <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('timeline')} >
                                    <FeedComponent
                                        navigation={this.props.navigation}
                                        type="profile"
                                        feedType="group"
                                        feedTypeId={this.state.itemDetails.id}
                                        entityId={this.props.userid}
                                        entityType="user"
                                        toUserid=""
                                        canPost={true}
                                        showWelcome={false}
                                        style={{flex: 1}} component={this}/>
                                </Tab>

                                <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('members') + ' (' + this.state.itemDetails.members + ')'} >
                                    <GroupMembers item={this.state.itemDetails} component={this} navigation={this.props.navigation}/>
                                </Tab>

                            </Tabs>

                        </Animated.View>
                    </View>

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
                            <Text style={{marginLeft: 10,marginTop: 12,color: 'white', fontSize: 15}}>{this.state.itemDetails.title}</Text>
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
                        {this.state.itemDetails.is_admin ? (
                            <View>
                                <ListItem noBorder icon onPress={()=>{
                                    this.menu.close();
                                    ImagePicker.openPicker({
                                    }).then(image => {

                                        let form  = new FormData();
                                        form.append("userid", this.props.userid);
                                        form.append("group_id", this.state.itemDetails.id);
                                        form.append('image', {
                                            uri: image.path,
                                            type: image.mime, // or photo.type
                                            name: image.path
                                        });
                                        this.updateState({processing : true});

                                        Api.post("group/logo", form).then((res) => {
                                            this.updateState({processing : false});
                                            if (res.status === 1) {
                                                let image = res.data_one;
                                                let itemDetails = this.state.itemDetails;
                                                itemDetails.logo = image;
                                                this.updateState({itemDetails : itemDetails});
                                                Toast.show({
                                                    text : this.lang.t('avatar_changed'),
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
                                        form.append("group_id", this.state.itemDetails.id);
                                        form.append('image', {
                                            uri: image.path,
                                            type: image.mime, // or photo.type
                                            name: image.path
                                        });

                                        Api.post("group/cover", form).then((res) => {
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

                                <ListItem noBorder icon onPress={()=>{
                                    this.menu.close();
                                    this.refs.createModal.open();
                                }}>
                                    <Left><Icon active name="pencil" type="SimpleLineIcons" style={{color:'#2196F3', fontSize: 15}} /></Left>
                                    <Body><Text>{this.lang.t('edit_group')}</Text></Body>
                                </ListItem>

                                <ListItem noBorder icon onPress={()=>{
                                    this.menu.close();
                                    Alert.alert(
                                        this.lang.t('do_you_really_delete'),
                                        '',
                                        [
                                            {text: this.lang.t('cancel'), onPress: () => {}, style: 'cancel'},
                                            {text: this.lang.t('delete'), onPress: () => {
                                                    Api.get("group/delete", {
                                                        group_id : this.state.itemDetails.id,
                                                        userid : this.props.userid
                                                    });
                                                    this.props.navigation.goBack();
                                                }},
                                        ],
                                        { cancelable: true }
                                    );
                                }}>
                                    <Left><Icon active name="md-trash"  style={{color:'#2196F3', fontSize: 15}} /></Left>
                                    <Body><Text>{this.lang.t('delete_group')}</Text></Body>
                                </ListItem>
                            </View>
                        ) : null}

                        <ListItem noBorder icon onPress={()=>{
                            this.menu.close();
                            this.props.navigation.push("report", {
                                link :  this.state.itemDetails.link,
                                type : 'group'
                            })
                        }}>
                            <Left><Icon active name="ios-alert-outline" style={{color:'#2196F3', fontSize: 15}} /></Left>
                            <Body><Text>{this.lang.t('report')}</Text></Body>
                        </ListItem>

                        {this.state.itemDetails.privacy === "1" ? (
                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                let url = this.state.itemDetails.link;
                                const shareOptions = {
                                    title: this.lang.t('share_via'),
                                    url: url
                                };
                                Share.open(shareOptions);
                            }}>
                                <Left><Icon active name="md-share"  style={{color:'#2196F3', fontSize: 15}} /></Left>
                                <Body><Text>{this.lang.t('share')}</Text></Body>
                            </ListItem>
                        ) : null}
                    </MenuOptions>
                </Menu>
            </View>
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

var bghtmlstyles = StyleSheet.create({
    span: {
        fontSize: 35,
        color: 'white',
    },
    defaultStyle: {
        fontSize: 13,
        color: 'black',
    }
});

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
    }
})(GroupView)