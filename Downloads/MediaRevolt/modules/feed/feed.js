import React, {Component} from 'react';
import {connect} from 'react-redux';

import {View,Text,Image,ImageBackground,
    Platform,Dimensions,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Animated,
    StyleSheet
    ,WebView,
    Alert,
    ProgressViewIOS
    ,ProgressBarAndroid,Linking,TouchableOpacity} from 'react-native';
import {
    Card,
    Body,
    CardItem,
    Thumbnail,
    Left,
    Button,
    Icon,
    List,
    ListItem,
    Right,Toast,Item,Input,CheckBox,ActionSheet
} from 'native-base';
import BaseComponent from "../../utils/BaseComponent";
import HTMLView from 'react-native-htmlview'
import { renderers } from 'react-native-popup-menu';
import Assets from '@assets/assets'
import Time from "../../utils/Time";
import material from "../../native-base-theme/variables/material";
import {BASE_CURRENCY, BASE_URL, GOOGLE_KEY, LIKE_TYPE, WEBSITE} from "../../api";
import FastImage from 'react-native-fast-image'
import {doFeedAction, doLike, doReact, loadReactMembers} from "./store";
import update from 'immutability-helper';
import Util from "../../utils/Util";
import time from '../../utils/Time';
import Share from 'react-native-share';
import Api from "../../api";
import MusicPlayerService, { Track, Events, RepeatModes } from 'react-native-music-player-service';
import MusicControl from 'react-native-music-control'


const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);
const images = [
    {id: 'like', img: Assets.like,type: 1},
    {id: 'love', img: Assets.love,type: 4},
    {id: 'haha', img: Assets.haha,type: 5},
    {id: 'yay', img: Assets.yay,type: 6},
    {id: 'wow', img: Assets.wow,type: 7},
    {id: 'sad', img: Assets.sad,type: 8},
    {id: 'angry', img: Assets.angry,type: 9}
];


class Feed extends BaseComponent {

    showReact = false;
    constructor(props) {
        super(props);
        //this.state.menuOpened = false;
        this.component = this.props.component;
        this.listId = this.props.listId;
        this.index = this.props.index;
        this.entityType = this.props.entityType;
        this.entityTypeId = this.props.entityTypeId;


    }

    componentWillMount() {

        this.imgLayouts = {};
        this.imageAnimations = {};
        this.hoveredImg = '';

        this.scaleAnimation = new Animated.Value(0);


    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.item !== nextProps.item) {
            return true;
        }

        if (nextProps.update !== undefined && (this.props.update === undefined || nextProps.update !== this.props.update)) {
            return true;
        }
        return false;
    }

    getImageAnimationArray(toValue) {
        return images.map((img) => {
            return Animated.timing(this.imageAnimations[img.id].position, {
                duration: 200,
                toValue: toValue
            })
        });
    }

    open() {

        images.forEach((img) => {
            //console.log(img.img);
            this.imageAnimations[img.id] = {
                position: new Animated.Value(55),
                scale: new Animated.Value(1)
            };
        });
        Animated.parallel([
            Animated.timing(this.scaleAnimation, {
                duration: 100,
                toValue: 1
            }),
            Animated.stagger(50, this.getImageAnimationArray(0))
        ]).start(() => {});
        this.component.updateState(update(this.component.state, {
            [this.listId] : {
                [this.index] : {show_react : {$set : true}}
            }
        }));

        setTimeout(() => {
            this.component.updateState(update(this.component.state, {
                [this.listId] : {
                    [this.index] : {show_react : {$set : false}}
                }
            }));
        }, 4000)
    }

    handleLayoutPosition(img, position) {
        this.imgLayouts[img] = {
            left: position.nativeEvent.layout.x,
            right: position.nativeEvent.layout.x + position.nativeEvent.layout.width
        }
    }

    getImages() {
        return images.map((img) => {
            return (
                <TouchableWithoutFeedback onPress={() => {
                    this.processReaction(img.type);
                }}>
                    <AnimatedFastImage
                        onLayout={this.handleLayoutPosition.bind(this, img.id)}
                        key={img.id}
                        source={ img.img}
                        style={[
                            styles.img,
                            {
                                transform: [
                                    {scale: this.imageAnimations[img.id].scale},
                                    {translateY: this.imageAnimations[img.id].position}
                                ]
                            }
                        ]}
                    />
                </TouchableWithoutFeedback>
            );
        })
    }

    render() {
        //console.log(this.props.item.id + 'rendered');
        //
        //
        console.log(this.props.item);

        let item = this.props.component.state[this.listId][this.index];
        let menuName = "Menu-" +item.id;
        let hasLike = (LIKE_TYPE === 'reaction') ? item.has_react : item.has_like;

        return (
            <View style={{flex:1}}>
                <TouchableWithoutFeedback onPress={() => {
                    this.component.updateState(update(this.component.state, {
                        [this.listId] : {
                            [this.index] : {show_react : {$set : false}}
                        }
                    }));
                }}>
                    <View style={{marginBottom:10,flex: 1}} >
                        <View style={{flex: 1}}>

                            <CardItem>
                                <Left style={{paddingRight:20}}>
                                    <TouchableWithoutFeedback onPress={() => {
                                        if (this.props.item.entity_type === 'page') {
                                            this.props.navigation.push('pageView', {itemId : this.props.item.entity_id});
                                        } else {
                                            this.props.navigation.push('profile', {id : this.props.item.entity_id});
                                        }
                                    }}>
                                        <FastImage style={{width:35,height:35,borderRadius:17.5}} source={{uri: this.props.item.avatar}} />
                                    </TouchableWithoutFeedback>
                                    <Body>
                                    <TouchableWithoutFeedback onPress={() => {
                                        if (this.props.item.entity_type === 'page') {
                                            this.props.navigation.push('pageView', {itemId : this.props.item.entity_id});
                                        } else {
                                            this.props.navigation.push('profile', {id : this.props.item.entity_id});
                                        }
                                    }}>
                                        <Text style={{fontWeight:"bold",color:'black'}}> {this.props.item.name} {this.getFeedTitle(item)} {this.displayTags(item)} {this.toUser(item)}</Text>
                                    </TouchableWithoutFeedback>
                                    <View style={{flexDirection: 'row',marginTop: 5}}>
                                        <Text note >{Time.ago(this.props.item.time_ago)}</Text>

                                        <Icon style={{fontSize: 20,color:'grey',marginLeft: 10}} name={(this.props.item.privacy === "1") ? "md-globe" : "md-lock"}/>
                                    </View>
                                    </Body>
                                </Left>
                                <Button transparent style={{position: 'absolute', right: 4, top : 10}} onPress={() => {
                                    let menu = [];

                                    if (item.has_subscribed) {
                                        menu.push({ text: this.lang.t('stop_notifications'), icon: "ios-notifications-outline", iconColor: "#2c8ef4", id : 'notification' })
                                    } else {
                                        menu.push({ text: this.lang.t('get_notifications'), icon: "ios-notifications-outline", iconColor: "#2c8ef4", id : 'notification' })
                                    }

                                    menu.push({ text: this.lang.t('i_dont_like_post'), icon: "ios-remove-circle-outline", iconColor: "#f42ced", id:'hide' });
                                    //menu.push({ id: 'save', text: this.lang.t('save_post'), icon: "ios-bookmark-outline", iconColor: "#fa213b" });

                                    if (item.can_edit_post) {
                                        menu.push({ id: 'pin', text: item.is_pinned ? this.lang.t('unpin_post') : this.lang.t('pin_post'), icon: "ios-jet-outline", iconColor: "#ea943b" });
                                        /// menu.push({ text: this.lang.t('edit_post'), icon: "pencil", iconColor: "#25de5b" ,id: 'edit'});
                                        menu.push({ text: this.lang.t('delete_post'), icon: "ios-trash-outline", iconColor: "#25de5b", id: 'remove' });
                                    }

                                    menu.push({ text: this.lang.t('view_post'), icon: "ios-eye-outline", iconColor: "#25de5b", id: 'view' });

                                    ActionSheet.show(
                                        {
                                            options: menu
                                        },
                                        buttonIndex => {
                                            //this.setState({ clicked: BUTTONS[buttonIndex] });
                                            if (menu[buttonIndex] !== undefined) this.doFeedAction(menu[buttonIndex].id)
                                        }
                                    );
                                }}>
                                    <Icon style={{fontSize: 30,color: 'grey', marginLeft: 10}} name="md-more"/>
                                </Button>

                            </CardItem>
                            <CardItem cardBody>
                                <View style={{flexDirection: 'column',flex: 1}}>
                                    {this.displayShared(item)}
                                    {item.full_message !== '' && item.background !== '' && item.background !== 'default' ? (
                                        <ImageBackground
                                            imageStyle={{resizeMode: 'cover'}}
                                            style={{width: '100%',minHeight: 200,flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center'}}
                                            source={this.getBackgroundImage(item)}>
                                            <HTMLView renderNode={renderNode2} onLinkPress={(url) => this.handleLink(url)}  style={{marginTop: 20,marginBottom: 20, marginLeft: 15,marginRight:15}}
                                                      textComponentProps={{ style: bghtmlstyles.defaultStyle }}
                                                      value={item.message} />
                                        </ImageBackground>

                                    ) : null}

                                    <View style={{marginBottom: 0}}>
                                        {item.full_message !== '' && (item.background === '' || item.background === 'default') ? (
                                            <View style={{padding:10}}>
                                                <HTMLView renderNode={renderNode2} style={{flex:1,color: 'grey',flexDirection: 'row', flexWrap: 'wrap'}} textComponentProps={{ style: bghtmlstyles2.defaultStyle }}
                                                          value={item.message} />
                                            </View>
                                        ) : null}
                                    </View>

                                    {this.displayFeelingContent(item)}
                                    {this.displayLink(item)}
                                    {this.displayMusic(item)}
                                    {this.displayVideo(item)}
                                    {this.displayPolls(item)}
                                    {this.displayFiles(item)}

                                    {this.displayImages(item)}
                                    {this.displayLocation(item)}
                                    {this.displayPlugins(item)}
                                </View>
                            </CardItem>

                            {this.displayLikeCommentStats(item)}
                            {LIKE_TYPE === "reaction" && (this.props.item.show_react !== undefined && this.props.item.show_react) ? (
                                <View style={styles.container}>
                                    <Animated.View
                                        style={[styles.likeContainer]}
                                    >
                                        {this.getImages()}
                                    </Animated.View>
                                </View>
                            ) : null}
                        </View>
                        <View style={{
                            borderTopColor: '#DEDCDD',
                            borderTopWidth: 0.3,
                            padding:0,height:45,flexDirection: 'row',
                            backgroundColor: 'white'
                        }}>

                            <View style={{flex: 1}}>
                                <Button transparent onLongPress={() => {
                                    if (LIKE_TYPE === 'reaction') this.open();
                                }} onPress={() => {
                                    if (LIKE_TYPE === "reaction") {
                                        if (hasLike) {
                                            this.processReaction(0);
                                        } else {
                                            this.processReaction(1);
                                        }
                                    } else {
                                        this.processLike(item)
                                    }
                                }}>
                                    {hasLike ? (
                                        <View style={{flexDirection: 'row',alignSelf:'flex-start'}}>
                                            <Icon style={{fontSize:22,marginRight: 10,
                                                color:material.brandPrimary,
                                                marginTop: (Platform.OS === 'ios' ? 0 : 5)
                                                }} active name="md-thumbs-up"  type="Ionicons"/>
                                            <Text style={{marginTop:5,color: material.brandPrimary}}>{this.lang.t('like')}</Text>
                                        </View>
                                    ): (
                                        <View style={{flexDirection: 'row'}}>
                                            <Icon style={{fontSize:22,marginRight: 10,color:'black'}} name="like" type="SimpleLineIcons" />
                                            <Text style={{marginTop:5, color:'black'}}>{this.lang.t('like')}</Text>
                                        </View>
                                    )}
                                </Button>

                            </View>
                            <View style={{flex: 1}}>
                                <Button onPress={() => {
                                    this.props.navigation.push("comments", {
                                        type : 'feed',
                                        index : this.props.index,
                                        component: this,
                                        typeId : item.id,
                                        entityType : this.entityType,
                                        entityTypeId : this.entityTypeId
                                    });
                                }} transparent>
                                    <Icon style={{fontSize:22,color:'black'}} name="bubble" type="SimpleLineIcons" />
                                    <Text style={{color:'black'}}>{this.lang.t('comment')}</Text>
                                </Button>
                            </View>
                            <View style={{flex: 1}}>
                                {item.privacy === "1" ? (
                                    <Button transparent onPress={() => {
                                        let menu = [];

                                        menu.push({ text: this.lang.t('share_on_timeline'), icon: "ios-undo-outline", iconColor: "#f42ced", id:'timeline' });
                                        menu.push({ id: 'outside', text: this.lang.t('share_outside'), icon: "ios-jet-outline", iconColor: "#ea943b" });

                                        ActionSheet.show(
                                            {
                                                options: menu
                                            },
                                            buttonIndex => {
                                                if (menu[buttonIndex] !== undefined) {
                                                    if (menu[buttonIndex].id === 'timeline') {
                                                        Alert.alert(
                                                            this.lang.t('do_you_share_timeline'),
                                                            '',
                                                            [
                                                                {text: this.lang.t('cancel'), onPress: () => {}, style: 'cancel'},
                                                                {text: this.lang.t('share'), onPress: () => {

                                                                        doFeedAction({
                                                                            userid : this.props.userid,
                                                                            action : 'share',
                                                                            feedId : this.props.item.id,
                                                                        }).then((res) => {
                                                                            Toast.show({
                                                                                text : this.lang.t('success_shared'),
                                                                                type : 'success'
                                                                            })
                                                                        })
                                                                    }},
                                                            ],
                                                            { cancelable: true }
                                                        );
                                                    } else {
                                                        //share to outside
                                                        let url = WEBSITE + "feed/" + this.props.item.id;
                                                        const shareOptions = {
                                                            title: this.lang.t('share_via'),
                                                            url: url
                                                        };
                                                        Share.open(shareOptions);
                                                    }
                                                }

                                            }
                                        );
                                    }} style={{alignSelf: 'flex-end',marginRight:10}}>
                                        <Icon style={{fontSize:22,marginRight: 10,color:'black'}} active name="action-undo" type="SimpleLineIcons" />
                                        <Text style={{color:'black'}}>{this.lang.t('share')}</Text>
                                    </Button>
                                ) : null}
                            </View>
                        </View>

                        {this.displayComments()}
                    </View>
                </TouchableWithoutFeedback>
                {item.ads !== undefined && item.ads.length > 0 ? (
                    <TouchableWithoutFeedback onPress={() => {
                        Linking.openURL(item.ads[0].link);
                    }}>
                        <View style={{backgroundColor:'white', marginBottom:10}}>
                            <FastImage style={{width:'100%',height:170}} source={{uri : item.ads[0].image}}/>
                            <View style={{padding:10,flexDirection:'column'}}>
                                <Text style={{fontWeight:'bold',fontSize:15,marginBottom:15}}>{item.ads[0].title}</Text>
                                <Text style={{color:'grey', fontSize:12}}>{item.ads[0].description}</Text>
                            </View>
                            <Icon name="ios-megaphone" style={{fontSize:30,color:'#FFEB3B',position:'absolute', top:10,right:10}}/>
                        </View>
                    </TouchableWithoutFeedback>
                ) : null}
            </View>
        );


    }

    handleLink(url) {
        if (url.match("hashtag:")) {
            let a = url.split(":");
            this.props.navigation.push("hash_discover", {
                term : "#" + a[1]
            });
        }

        if (url.match("mention:")) {
            let a = url.split(":");
            this.props.navigation.push("profile", {
                id : a[1]
            });
        }

        return Linking.openURL(url);
    }

    doFeedAction(id) {
        if (id === 'edit') {
            this.props.navigation.navigate("editFeed");
        } else if(id === 'view') {
            this.props.navigation.push("viewFeed", {
                item : this.props.item,
                entityTypeId : this.entityTypeId,
                entityType : this.entityType
            })
        } else if(id === 'remove') {
            Alert.alert(
                this.lang.t('confirm_post_delete'),
                '',
                [
                    {text: this.lang.t('cancel'), onPress: () => {}, style: 'cancel'},
                    {text: this.lang.t('delete'), onPress: () => {
                            //lets remove the post
                            let lists = Util.removeIndexFromArray(this.index, this.component.state[this.listId]);
                            this.component.updateState({[this.listId] : lists});

                            doFeedAction({
                                userid : this.props.userid,
                                action : id,
                                feedId : this.props.item.id,
                            });
                        }},
                ],
                { cancelable: true }
            );
        } else {
            if (id === 'notification') {
                id =  (this.props.item.has_subscribed) ? 'unsubscribe' : 'subscribe';
                this.component.updateState(update(this.component.state, {
                    [this.listId] : {
                        [this.index] : {has_subscribed : {$set : (id === 'subscribe')}}
                    }
                }));
            }

            if (id === 'hide') {
                let lists = Util.removeIndexFromArray(this.index, this.component.state[this.listId]);
                this.component.updateState({[this.listId] : lists});
            }

            if (id === 'pin') {
                //id = (this.props.item.is_pinned) ? 'unpin' : 'pin';
                this.component.updateState(update(this.component.state, {
                    [this.listId] : {
                        [this.index] : {is_pinned : {$set : (id === 'pin')}}
                    }
                }));
            }

            doFeedAction({
                userid : this.props.userid,
                action : id,
                feedId : this.props.item.id,
            });
        }
    }

    processReaction(type) {
        //console.log(this.component.state);
        this.component.updateState(update(this.component.state, {
            [this.listId] : {
                [this.index] : {has_react : {$set : (type !== 0)},show_react: {$set : false}}
            }
        }));
        doReact({
            type : "feed",
            code : type,
            typeId : this.props.item.id,
            userid : this.props.userid
        }).then(() => {
            loadReactMembers({
                type : "feed",
                typeId : this.props.item.id,
                userid : this.props.userid,
            }).then((res) => {
                this.component.updateState(update(this.component.state, {
                    [this.listId] : {
                        [this.index] : {react_members : {$set : res.members}}
                    }
                }));
            });
        });

    }

    processLike() {

        this.component.updateState(update(this.component.state, {
            [this.listId] : {
                [this.index] : {has_like : {$set : (!this.props.item.has_like)}}
            }
        }));
        doLike({
            type : "feed",
            typeId : this.props.item.id,
            userid : this.props.userid
        }).then((res) => {
            this.component.updateState(update(this.component.state, {
                [this.listId] : {
                    [this.index] : {like_count : {$set : res.likes}}
                }
            }));
        });
    }

    getBackgroundImage(item) {
        let number = item.background.replace("color", "");
        switch(number) {
            case '8':
               return require('./images/img-8.png');
                break;
            case '10':
                return require('./images/img-10.png');
                break;
            case '2':
                return require('./images/img-2.png');
                break;
            case '4':
                return require('./images/img-4.png');
                break;
            case '5':
                return require('./images/img-5.png');
                break;
            case '6':
                return require('./images/img-6.png');
                break;
            case '7':
                return require('./images/img-7.png');
                break;
            case '8':
                return require('./images/img-8.png');
                break;
            case '9':
                return require('./images/img-9.png');
                break;
            case '11':
                return require('./images/img-11.png');
                break;
            case '12':
                return require('./images/img-12.png');
                break;

        }
    }

    getFeedTitle(item) {
        let str = "";

        if (item.feed_title !== '') {
            if (item.feed_title === 'changed-profile-cover') {
                str = <Text style={{fontWeight:'normal',color:'grey'}}>{this.lang.t("changed_profile_cover")}</Text>
            } else if (item.feed_title === 'changed-profile-cover') {
                str = <Text style={{fontWeight:'normal',color:'grey'}}>{this.lang.t("changed_profile_cover")}</Text>
            }else if (item.feed_title === 'shared-a-video') {
                str = <Text style={{fontWeight:'normal',color:'grey'}}>{this.lang.t("shared_a_video")}</Text>
            } else if (item.feed_title === 'created-blog') {
                str = <Text style={{fontWeight:'normal',color:'grey'}}>{this.lang.t("created_blog")}</Text>
            }else if (item.feed_title === 'created-event') {
                str = <Text style={{fontWeight:'normal',color:'grey'}}>{this.lang.t("created_event")}</Text>
            } else if (item.feed_title === 'created-page') {
                str = <Text style={{fontWeight:'normal',color:'grey'}}>{this.lang.t("created_page")}</Text>
            } else if (item.feed_title === 'created-group') {
                str = <Text style={{fontWeight:'normal',color:'grey'}}>{this.lang.t("created_group")}</Text>
            } else if (item.feed_title === 'created-listing') {
                str = <Text style={{fontWeight:'normal',color:'grey'}}>{this.lang.t("created_listing")}</Text>
            } else if (item.feed_title === 'upload-music') {
                str = <Text style={{fontWeight:'normal',color:'grey'}}>{this.lang.t("shared_song")}</Text>
            } else if (item.feed_title === 'add-photo-to-album') {
                str = <Text> <Text>{this.lang.t("added") + " " + item.album[0] + this.lang.t('photos_to') + " "}</Text> <Text style={{fontWeight: 'bold'}}>{item.album[2]}</Text></Text>
            } else {
                str = this.lang.t("changed_profile_picture")
            }
        }

        if (item.shared !== false) {
            //str +=
            str = <Text> <Text style={{fontWeight: 'normal'}}>{this.lang.t('shared') + " "}</Text> <Text style={{fontWeight: 'bold'}}>{item.shared_name}</Text> <Text style={{fontWeight: 'normal'}}>{this.lang.t('shared_'+ item.shared_title)}</Text></Text>;
            //str += " " +
        }
        return <Text>{str}</Text>;
    }

    displayShared(item) {
        if (item.shared === true) {
            return (
                <View style={{flexDirection: 'row', marginBottom: 10,marginLeft: 20}}>
                    <Thumbnail small source={{uri: this.props.item.shared_avatar}} />
                    <View style={{flexDirection: 'column', flex: 1, marginLeft: 10}}>
                        <Text style={{fontWeight: 'bold',marginBottom: 5}}>{item.shared_name}</Text>
                        <Text note style={{color: 'grey'}}>{Time.format(item.shared_time)}</Text>
                    </View>
                </View>
            );
        }
    }

    displayTags(item) {
        if (item.tag_users.length > 0) {
            let texts = [];
            for (let i=0;i<item.tag_users.length;i++) {
                let user = item.tag_users[i];
                texts.push(<TouchableWithoutFeedback onPress={() => {
                    this.props.navigation.push("profile", {id : user.id})
                }}>
                    <Text >{user.name}, </Text>
                </TouchableWithoutFeedback>);
            }
            return (<Text style={{marginLeft:7,color:'grey'}}> <Text>{this.lang.t('with')} - </Text> {texts}</Text>)
        }
    }

    toUser(item) {
        if (item.touser.length > 0) {
            return <TouchableWithoutFeedback onPress={() => {
                this.props.navigation.push('profile', {id : item.touser[0].id})
            }}>
                <Text style={{fontWieght:'bold',color:'black'}}> -> {item.touser[0].name}</Text>
            </TouchableWithoutFeedback>
        }
    }

    displayLink(item) {
        if (item.link.length > 0) {
            let link = item.link[0];
            return (
                <View style={{borderColor: '#DEDCDD',borderWidth: 0.3,flexDirection: 'column',margin:10}}>
                    {link['image'] !== '' ? (
                        <Image source={{uri: link['image']}} style={{width: '100%', height: 200}}/>
                    ) : null}

                    {link['image'] === '' && link['code'] !== '' ? (
                        <HTMLView renderNode={renderNode} value={link['code']} style={{width: '100%', height: 200}}/>
                    ) : null}
                    <View style={{flexDirection: 'column', padding:10}}>
                        <TouchableOpacity onPress={() => {
                            Linking.openURL(link['link'])
                        }}>
                            <Text style={{fontSize: 20,fontWeight: 'bold'}}>{link['title']}</Text>
                        </TouchableOpacity>
                        {link['description'] !== '' ? (
                            <Text style={{color: 'grey',marginTop: 10}}>{link['description']}</Text>
                        ) : null}
                    </View>
                </View>
            );
        }
    }

    displayVideo(item) {

        if (item.video_embed !== '') {

            return (
                <View style={{borderColor: '#DEDCDD',borderWidth: 0.3,flexDirection: 'column',margin:10}}>
                    <FastImage source={{uri: item.video_photo}} style={{height: 200, width: null, flex: 1}}>
                        <TouchableWithoutFeedback onPress={() => {
                            if (item.video_details !== undefined) {
                                this.props.navigation.push("videoView", {
                                    item : item.video_details
                                });
                            } else {
                                this.props.navigation.push("videoView", {
                                    item : {code : item.video_embed,title : item.video_title},
                                    player : true
                                });
                            }
                        }}>
                            <View style={{
                                alignSelf:'center',
                                position:'absolute',top:'30%',
                                borderColor:'#EFEFEF',borderWidth:5,width:70,height:70,borderRadius:35}}>
                                <Icon name="ios-play-outline" style={{color:'#EFEFEF',fontSize:60,margin:0,left:20}}/>
                            </View>
                        </TouchableWithoutFeedback>

                    </FastImage>

                    <View style={{flexDirection: 'column', padding:10}}>
                        <Text style={{fontSize: 20,fontWeight: 'bold'}}>{item.video_title}</Text>
                    </View>
                </View>
            );
        }
    }

    displayPlugins(item) {
        let views = [];

        if (item.group !== undefined) {
            views.push(<TouchableOpacity onPress={() => {
                this.props.navigation.push("groupView", {
                    itemId : item.group.id,
                    item : item.group
                });
            }}>
                <View style={{borderColor:'#F5F5F5',borderWidth:.5,borderRadius:10,padding:10,margin:10,flexDirection:'row'}}>
                    <FastImage source={{uri: item.group.logo}} style={{width:60,height:60,borderRadius:5}}/>
                    <View style={{marginLeft:10,marginTop:10, flex:1}}>
                        <Text style={{color:'black', fontSize:15,fontWeight:'bold'}}>{item.group.title}</Text>
                        <Text style={{color:'grey', marginTop:10}}>{item.group.members} {this.lang.t('members')}</Text>
                    </View>
                </View>
            </TouchableOpacity>)
        }


        if (item.page !== undefined) {
            views.push(<TouchableOpacity onPress={() => {
                this.props.navigation.push("pageView", {
                    itemId : item.page.id,
                    item : item.page
                });
            }}>
                <View style={{borderColor:'#F5F5F5',borderWidth:.5,borderRadius:10,padding:10,margin:10,flexDirection:'row'}}>
                    <FastImage source={{uri: item.page.logo}} style={{width:60,height:60,borderRadius:5}}/>
                    <View style={{marginLeft:10,marginTop:10, flex:1}}>
                        <Text style={{color:'black', fontSize:15,fontWeight:'bold'}}>{item.page.title}</Text>
                        <Text style={{fontSize:15,marginTop:5}}><Text style={{fontWeight:'bold',color:'black'}}>{item.page.likes}</Text> {this.lang.t('people_likes_page')}</Text>
                    </View>
                </View>
            </TouchableOpacity>)
        }

        if (item.listing !== undefined) {
            views.push(<TouchableOpacity onPress={() => {
                this.props.navigation.push("listingView", {
                    itemId : item.listing.id,
                    item : item.listing
                });
            }}>
                <View style={{borderColor:'#F5F5F5',borderWidth:.5,borderRadius:10,padding:10,margin:10,flexDirection:'row'}}>
                    <FastImage source={{uri: item.listing.image}} style={{width:60,height:60,borderRadius:5}}/>
                    <View style={{marginLeft:10,marginTop:10, flex:1}}>
                        <Text style={{color:'black', fontSize:15,fontWeight:'bold'}}>{item.listing.title}</Text>
                        <Text><Text style={{fontWeight:'bold',marginTop:7}}>{this.lang.t('price')}</Text> -
                            {item.listing.price === '' ? (<Text>{this.lang.t('free')}</Text>) : (<Text>{BASE_CURRENCY}{item.listing.price}</Text>)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>)
        }

        if (item.blog !== undefined) {
            views.push(<TouchableOpacity onPress={() => {
                this.props.navigation.push("blogView", {
                    itemId : item.blog.id,
                    item : item.blog
                });
            }}>
                <View style={{borderColor:'#F5F5F5',borderWidth:.5,borderRadius:10,padding:10,margin:10,flexDirection:'row'}}>
                    <FastImage source={{uri: item.blog.image}} style={{width:60,height:60,borderRadius:5}}/>
                    <View style={{marginLeft:10,marginTop:1, flex:1}}>
                        <Text style={{color:'black', fontSize:15,fontWeight:'bold'}}>{item.blog.title}</Text>
                        <View style={{flexDirection:'row',marginTop:5}}>
                            <Icon name="md-thumbs-up"/>
                            <Text style={{fontWeight:'bold',color:'grey',marginRight:5,marginLeft:5,top:5}}>{item.blog.like_count}</Text>

                            <Icon name="ios-chatbubbles-outline" style={{marginLeft:10}}/>
                            <Text style={{fontWeight:'bold',color:'grey',marginRight:5,marginLeft:5,top:5}}>{item.blog.comments}</Text>

                            {item.blog.featured === 1? (
                                <Icon name="md-star" style={{color:material.accentTextColor,marginLeft:15,fontSize:20}}/>
                            ) : null}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>)
        }


        if (item.event !== undefined) {
            views.push(<TouchableOpacity onPress={() => {
                this.props.navigation.push("eventView", {
                    itemId : item.event.id,
                    item : item.event
                });
            }}>
                <View style={{borderColor:'#F5F5F5',borderWidth:.5,borderRadius:10,padding:10,margin:10,flexDirection:'row'}}>
                    <FastImage source={{uri: item.event.image}} style={{width:60,height:60,borderRadius:5}}/>
                    <View style={{marginLeft:10,marginTop:1, flex:1}}>
                        <Text style={{color:'black', fontSize:15,fontWeight:'bold'}}>{item.event.title}</Text>
                        <View style={{flexDirection:'row'}}>
                            <View style={{width:40,height:40,borderRadius:5,backgroundColor:material.brandPrimary,top:7}}>
                                <Text style={{fontSize:15,fontWeight:'bold',color:'white',alignSelf:'center'}}>{time.getDay(item.event.start_time)}</Text>
                                <Text style={{fontSize:15,fontWeight:'bold',color: 'white',alignSelf:'center'}}>{time.getMonth(item.event.start_time)}</Text>
                            </View>
                            <View style={{flex:1,flexDirection:'row',marginTop:15}}>
                                <Text style={{margin:10}}><Text style={{fontWeight:'bold'}}>{item.event.count_going}</Text> {this.lang.t('going')}</Text>
                                <Text style={{margin:10}}><Text style={{fontWeight:'bold'}}>{item.event.count_maybe}</Text> {this.lang.t('maybe')}</Text>
                                <Text style={{margin:10}}><Text style={{fontWeight:'bold'}}>{item.event.count_invited}</Text> {this.lang.t('invited')}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>)
        }

        if (item.gif !== '') {
            views.push(<TouchableWithoutFeedback onPress={() => {
                this.props.navigation.push("photoViewer", {
                    photos : [item.gif],
                    selected : item.gif
                });
            }}>
                <FastImage resizeMode="contain" style={{width: '100%', height: 300}} source={{uri: item.gif}}/>
            </TouchableWithoutFeedback>)
        }

        if (item.voice !== '') {
            views.push(<View style={{margin:10,
                flexDirection:'row',
                backgroundColor: '#F7F7F7',
                borderRadius:20, padding:10}}>
                <View style={{
                    marginLeft:10,

                    width:40,height:40,borderRadius:20}}>
                    <Icon name="md-skip-backward" style={{color:'#EBEBEB',fontSize:20,margin:0,left:10,top:10}}/>
                </View>
                <TouchableOpacity onPress={() => this.togglePlayVoice(this.props.item)} style={{flex:1}}>
                    <View style={{
                        marginLeft:10,
                        backgroundColor: material.brandPrimary,
                        width:40,height:40,borderRadius:20,alignSelf:'center'}}>
                        <Icon name={this.props.item.voicePlaying ? "md-pause" : "md-play"} style={{color:'white',fontSize:20,margin:0,left:15,top:10}}/>
                    </View>
                </TouchableOpacity>
                <View style={{

                    marginLeft:10,

                    width:40,height:40,borderRadius:20}}>
                    <Icon name="md-skip-forward" style={{color:'#EBEBEB',fontSize:20,margin:0,left:10,top:10}}/>
                </View>

            </View>)
        }
        return (<View>{views}</View>);
    }

    togglePlayVoice(item, type)  {

        if (this.component.playerList !== null && this.component.playerListIndex !== this.props.index) {

            this.component.playerList.stop();
        }

        if (this.component.playerList === null || this.component.playerListIndex !== this.props.index) {
            this.component.playerList = new MusicPlayerService(false, {

            });

            this.component.playerList.addEventListener(Events.Play, track => this.event(Events.Play, track));
            this.component.playerList.addEventListener(Events.Pause, track => this.event(Events.Pause, track));
            this.component.playerList.addEventListener(Events.Next, track => this.event(Events.Next, track));
            this.component.playerList.addEventListener(Events.Stop, track => this.event(Events.Stop, track));
            this.component.playerList.addEventListener(Events.EndReached, track => this.event(Events.EndReached, track));
            let songsInformation = [
                {
                    id: 1,
                    path: item.voice,
                    title: this.lang.t('voice_record'),
                    album: '',
                    artist: '',
                    genre: "",
                    //duration: 2260,
                    artwork: item.avatar
                }
            ];
            let tracks = songsInformation.map(s => {
                return new Track({id: s.id, path: s.path, additionalInfo: s});
            });
            this.component.playerList.setQueue(tracks);
        }
        this.component.playerListIndex = this.props.index;

        //console.log(this.component.playerList);

        if (item.voicePlaying) {
            this.component.playerList.togglePlayPause();
            this.component.updateState(update(this.component.state, {
                [this.listId] : {
                    [this.props.index] : {voicePlaying : {$set : false}}
                }
            }));
        } else {
            this.component.playerList.togglePlayPause();
            this.component.updateState(update(this.component.state, {
                [this.listId] : {
                    [this.props.index] : {voicePlaying : {$set : true}}
                }
            }));
        }


    }

    event(event, tract, type) {

        if (event === Events.Play) {
            this.component.updateState(update(this.component.state, {
                [this.listId] : {
                    [this.component.playerListIndex] : {voicePlaying : {$set : true}}
                }
            }));
        }

        if (event === Events.Pause) {
            this.component.updateState(update(this.component.state, {
                [this.listId] : {
                    [this.component.playerListIndex] : {voicePlaying : {$set : false}}
                }
            }));
        }

        if (event === Events.Stop || event === Events.EndReached) {
            let dIndex = this.component.playerListIndex;
            setTimeout(() => {
                this.component.updateState(update(this.component.state, {
                    [this.listId] : {
                        [dIndex] : {voicePlaying : {$set : false}}
                    }
                }));
            }, 300);
        }


    }


    displayPolls(item) {
        if (item.answers.length > 0) {
            let rows = [];
            for(let i = 0;i<item.answers.length;i++) {
                let answer = item.answers[i];
                rows.push(<View style={{flexDirection: 'column',margin:5,borderBottomColor:'#DEDCDD', borderBottomWidth:0.3,padding:10}}>
                    <Text style={{fontSize: 12, marginBottom: 5, flex: 1,fontWeight:'bold'}}>{answer['text']}</Text>
                    <View style={{flexDirection: 'row'}}>
                        <CheckBox onPress={() => {
                            if (item.isPolling === undefined || item.isPolling === false) {
                                //already selected options
                                let selected = '';
                                for(let i = 0;i<item.answers.length;i++) {
                                    if (item.answers[i].answered && answer.id !== item.answers[i].id) selected += "," + item.answers[i].id;
                                }

                                if (item.poll_type === "2" && !answer.answered ) {
                                    selected += ',' + answer.id;
                                }
                                //submit to the server
                                Api.get("feed/submit/poll", {
                                    userid : this.props.userid,
                                    poll_id : answer.poll_id,
                                    answer_id : answer.id,
                                    answers : selected
                                }).then((res) => {
                                    console.log(res);
                                    this.component.updateState(update(this.component.state, {
                                        [this.listId] : {
                                            [this.index] : {$set : res}
                                        }
                                    }));
                                }).catch((e) => {
                                    //console.log(e);
                                });
                                this.component.updateState(update(this.component.state, {
                                    [this.listId] : {
                                        [this.index] : {isPolling : {$set : true}}
                                    }
                                }));
                            }
                        }} rounded checked={(!!answer['answered'])} style={{position:'relative', left:-5,borderRadius: 50}}/>
                        <View style={{flex: 1,marginLeft:10,marginRight:10}}>
                            {Platform.OS === 'android' ? (
                                <ProgressBarAndroid
                                    styleAttr="Horizontal"
                                    color={material.brandPrimary}
                                    indeterminate={false}
                                    style={{transform: [{ scaleX: 1.0 }, { scaleY: 3 }],marginTop:10}}
                                    progress={answer['percent']/100}
                                />
                            ) : (
                                <ProgressViewIOS
                                    style={{transform: [{ scaleX: 1.0 }, { scaleY: 3 }], marginTop:4}}
                                    styleAttr="Horizontal"
                                    indeterminate={false}
                                    trackTintColor="#F5F4F5"
                                    progressTintColor={material.brandPrimary}
                                    progress={answer['percent']/100}/>
                            ) }
                        </View>
                        {answer.users.length > 0 ? (
                            <View style={{flexDirection: 'row'}}>
                                <Thumbnail style={{width:30,height:30,borderRadius: 15}} small source={{uri: answer.users[0]['avatar']}} />
                                {answer.users.length > 1 ? (
                                    <Thumbnail style={{width:30,height:30,borderRadius: 15}} small source={{uri: answer.users[1]['avatar']}} />
                                ) : null}
                            </View>
                        ) : null}
                    </View>

                </View>)
            }
            return (
                <View style={{borderColor: '#DEDCDD', borderWidth: 0.3, margin:10,flexDirection: 'column',
                    opacity:(item.isPolling === undefined || item.isPolling === false) ? 1 : 0.3}}>{rows}</View>
            )
        }
    }

    displayMusic(item) {
        if (item.musics.length > 0) {
            let music = item.musics[0];
            return (
                <View style={{margin: 10, backgroundColor: '#F5F4F5', padding: 10, flexDirection: 'row',borderRadius:10}}>
                    <Icon name="music-tone-alt" type="SimpleLineIcons" style={{color:'black', fontSize: 35}}/>
                    <View style={{flex:1, flexDirection: 'column', marginLeft:10}}>
                        <Text style={{fontWeight: 'bold', fontSize:15}}>{music['title']}</Text>
                        <Text>{music['artist']}</Text>
                        <Text>{music['play_count']} {this.lang.t('plays')}</Text>
                    </View>
                    <Button rounded onPress={() => {
                        this.props.navigation.push("musicView", {
                            itemId : music.id,
                            item : music
                        })
                    }}><Icon name="md-play"/></Button>
                </View>
            );
        }
    }

    displayFiles(item) {
        if (item.files.length > 0) {
            let rows = [];
            for(let i = 0;i<item.files.length;i++) {
                rows.push(<View style={{flexDirection: 'row',margin:5}}>
                   <Image source={{uri: item.files[i]['extension_icon']}} style={{width: 30,height:30}}/>
                    <Text style={{fontSize: 12, marginLeft: 10,marginTop: 5, flex: 1}}>{item.files[i]['name']}</Text>
                    <Button transparent><Icon name="cloud-download" type="SimpleLineIcons"/></Button>
                </View>)
            }
            return (
                <View style={{borderColor: '#DEDCDD', borderWidth: 0.3, margin:10,flexDirection: 'column'}}>{rows}</View>
            );
        }
    }

    displayLocation(item) {
        if (item.location !== '') {
            let locationImage = "https://maps.googleapis.com/maps/api/staticmap?center="+item.location+"&zoom=15&size=700x200&maptype=roadmap&markers=color:red%7C"+item.location+"&sensor=false&scale=1&visual_refresh=true&key="+GOOGLE_KEY;
            return (
                <Image source={{uri: locationImage}} style={{width: '100%', height:150}}/>
            )
        }
    }

    displayLikeCommentStats(item) {
        if (this.props.item.like_count === 0 && this.props.item.react_members.length < 1 && this.props.item.comments < 1) return null;

        return (
            <CardItem>
                <Item style={{borderColor: 'white'}}>
                    {this.props.item.like_count > 0 || this.props.item.react_members.length > 0 ? (
                        <Left>
                            {LIKE_TYPE === 'reaction' ? (
                                <View style={{flexDirection: 'row'}}>
                                    <FastImage style={{width:25,height:25,borderRadius:12.5}} small source={{uri: this.props.item.react_members[0][0]}}/>
                                    {this.props.item.react_members.length > 1 ? (
                                        <FastImage style={{width:25,height:25,borderRadius:12.5,marginLeft:2}} small source={{uri: this.props.item.react_members[1][0]}}/>
                                    ) : null}
                                    {this.props.item.react_members.length > 2 ? (
                                        <FastImage style={{width:25,height:25,borderRadius:12.5,marginLeft:2}} small source={{uri: this.props.item.react_members[2][0]}}/>
                                    ) : null}

                                    {this.props.item.react_members.length > 3 ? (
                                        <TouchableWithoutFeedback onPress={() => {
                                            this.props.navigation.push("likes", {
                                                type : 'feed',
                                                typeId : this.props.item.id
                                            })
                                        }}>
                                            <View   style={{width:25,height:25,borderRadius:12.5,backgroundColor:'#D6D7D7',marginLeft:3,padding:0}}>
                                                <Icon name="ios-more" style={{color:'grey',marginLeft:4}}/>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    ) : null}
                                </View>
                            ) : (
                                <Button transparent>
                                    <Text style={{fontWeight: 'bold'}}>{item.like_count}</Text>
                                    <Text> {this.lang.t('people_like_this')}</Text>
                                </Button>
                            )}
                        </Left>
                    ) : null}

                    <Right>
                        {this.props.item.comments > 0 ? (
                            <Button onPress={() => {
                                this.props.navigation.push("comments", {
                                    type : 'feed',
                                    index : this.props.index,
                                    component: this,
                                    typeId : this.props.item.id,
                                    entityType : this.entityType,
                                    entityTypeId : this.entityTypeId
                                });
                            }} transparent>
                                <Text style={{fontWeight: 'bold'}}>{this.props.item.comments}</Text>
                                <Text> {this.lang.t('comments')}</Text>
                            </Button>
                        ) : null}
                    </Right>
                </Item>
            </CardItem>
        )
    }

    commentAdded(count, index, lastComment) {
        //console.log("new comment added = " + count);
        this.props.component.updateState(update(this.component.state, {
            itemLists : {
                [index] : {comments : {$set : count},last_comment : {$set: lastComment}}
            }
        }));
    }

    displayComments() {
        if (this.props.item.comments !== 0
            && this.props.item.last_comment.text !== ''
            && this.props.item.last_comment.image === '' && this.props.item.last_comment.gif === '' && this.props.item.last_comment.voice==='') {
            return (
                <TouchableWithoutFeedback onPress={() => {
                    this.props.navigation.push("comments", {
                        type : 'feed',
                        typeId : this.props.item.id,
                        entityType : this.entityType,
                        entityTypeId : this.entityTypeId
                    });
                }}>
                    <CardItem footer style={{borderTopColor: '#DEDCDD', borderTopWidth: 0.5, padding: 20,flexDirection: 'column'}}>
                        <View style={{flexDirection: 'row', marginBottom: 10}}>
                            <FastImage style={{width:40,height:40,borderRadius: 20}} small source={{uri: this.props.item.last_comment.avatar}} />
                            <View style={{flexDirection: 'column', flex: 1, marginLeft: 10}}>
                                <Text style={{fontWeight: 'bold',color:'black',marginBottom: 5}}>{this.props.item.last_comment.name} -
                                    <Text style={{color:'grey',fontWeight:'normal'}}>
                                        {Time.ago(this.props.item.last_comment.time_ago)}
                                        </Text></Text>
                                <HTMLView style={{flex:1,color: 'grey',flexDirection: 'row', flexWrap: 'wrap'}} textComponentProps={{ style: bghtmlstyles.defaultStyle2 }}
                                          value={this.props.item.last_comment.text}/>

                            </View>
                        </View>


                        <View style={{flexDirection: 'row', marginBottom: 10}}>
                            <FastImage style={{width:40,height:40,borderRadius: 20}} small source={{uri: this.props.avatar}} />
                            <View style={{flexDirection: 'column', flex: 1, marginLeft: 10}}>
                                <Item onPress={() => {
                                    this.props.navigation.push("comments", {
                                        type : 'feed',
                                        typeId : this.props.item.id,
                                        entityType : this.entityType,
                                        entityTypeId : this.entityTypeId
                                    });
                                }} rounded style={{backgroundColor: '#F2F3F5',height:40}}>
                                    <Text style={{flex:1,color:'grey', fontWeight:'bold', marginLeft: 10}}>{this.lang.t('write_comment')}</Text>
                                    <Icon name="camera" style={{color:'lightgrey',position:'relative',left: 10}} type="SimpleLineIcons"/>
                                    <Icon name="emotsmile" style={{color:'lightgrey',marginLeft:0}} type="SimpleLineIcons"/>
                                </Item>
                            </View>
                        </View>
                    </CardItem>
                </TouchableWithoutFeedback>
            );
        }
    }



    displayImages(item) {
        let images = this.props.item.images;
        if (images.length < 1) return null;
        if (images.length === 1) {
            return (
                <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[0])}}>
                    <FastImage resizeMode="contain" style={{width: '100%', height: 300}} source={{uri: images[0]}}/>
                </TouchableWithoutFeedback>
            );
        } else if(images.length === 2) {
            return (
                <View style={{flexDirection: 'row'}}>
                    <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[0])}}>
                        <FastImage  style={{width: '100%', height: 200,flex:1}} source={{uri: images[0]}}/>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[1])}}>
                        <FastImage style={{width: '100%', height: 200,flex:1,marginLeft:3}} source={{uri: images[1]}}/>
                    </TouchableWithoutFeedback>

                </View>
            )
        } else if(images.length === 3) {
            return (
                <View style={{flexDirection: 'row'}}>
                    <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[0])}}>
                        <FastImage style={{width: '100%', height: 300,flex:2}} source={{uri: images[0]}}/>
                    </TouchableWithoutFeedback>
                    <View style={{flex:1,marginLeft:3,flexDirection: 'column', width:200}}>
                        <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[1])}}>
                            <FastImage style={{width: '100%', height: 150,}} source={{uri: images[1]}}/>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[2])}}>
                            <FastImage style={{width: '100%', height: 150,}} source={{uri: images[2]}}/>
                        </TouchableWithoutFeedback>

                    </View>
                </View>
            )
        } else {
            return (
                <View style={{flexDirection: 'row'}}>
                    <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[0])}}>
                        <FastImage style={{width: '100%', height: 300,flex:2}} source={{uri: images[0]}}/>
                    </TouchableWithoutFeedback>

                    <View style={{flex:1,marginLeft:3,flexDirection: 'column' , width:200}}>
                        <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[1])}}>
                            <FastImage style={{width: '100%', height: 100,}} source={{uri: images[1]}}/>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[2])}}>
                            <FastImage style={{width: '100%', height: 100,}} source={{uri: images[2]}}/>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={() => {this.launchPhotoViewer(images[3])}}>
                            <FastImage style={{width: '100%', height: 100,}} source={{uri: images[3]}}/>
                        </TouchableWithoutFeedback>


                    </View>
                </View>
            )
        }
    }

    launchPhotoViewer(image) {
        this.props.navigation.push("photoViewer", {
            photos : this.props.item.images,
            selected : image
        });
    }

    displayFeelingContent(item) {
        if (item.has_feeling === true) {
            return (
                <View style={{flexDirection: 'row', borderColor: '#DEDCDD',borderWidth:0.4,padding: 10,margin:15}}>
                    <Image style={{width:30,height:30}} source={{uri: item.feeling_image}}/>
                    <Text style={{flex: 1,marginLeft: 5,marginTop: 7}}> <Text style={{fontWeight: 'bold'}}>{this.lang.t(item.feeling_type.replace('-','_'))}</Text> {item.feeling_text}</Text>
                </View>
            )
        }
    }


}

function renderNode(node, index, siblings, parent, defaultRenderer) {
    if (node.name === 'iframe') {
        const a = node.attribs;
        const iframeHtml = `<iframe src="${a.src}"></iframe>`;
        return (
            <View key={index} style={{width: '100%', height: 350}}>
                <WebView source={{uri: a.src}} style={{width: '100%', height: 350}} />
            </View>
        );
    }

}

function renderNode2(node, index, siblings, parent, defaultRenderer) {
    if (node.name === 'img') {
        const a = node.attribs;
        return (<Image resizeMode="contain" source={{ uri: node.attribs.src }} style={{
            width:Number(a.width),
            resizeMode : 'center',
            height:Number(a.height)}}/>);
    }
}

var styles = StyleSheet.create({
    container: {

        left: 0,
        position: 'absolute',
        bottom: 20,

    },

    likeContainer: {
        padding: 5,
        backgroundColor: '#FFF',
        borderColor: '#F7F3F3',
        borderWidth: 1,
        borderRadius: 20,
        left: 20,
        width: 330,
        elevation:1,
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity:  0.2,
        shadowRadius: 1.2 ,
        zIndex: 1
    },

    img: {
        marginLeft: 5,
        marginRight: 5,
        width: 35,
        height: 35,
        overflow: 'visible'

    }
});

var bghtmlstyles = StyleSheet.create({
   span: {
       fontSize: 35,
       color: 'white',
   },
    defaultStyle: {
       fontSize: 25,
        color: 'white',
        textAlign: 'center',
        margin: 30,
        justifyContent: 'center'
    },

    defaultStyle2: {
        fontSize: 13,
        color: 'black',
    }
});
let bghtmlstyles2 = StyleSheet.create({
    defaultStyle: {

        color: 'black',
        fontSize: 13

    }
});


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(Feed)