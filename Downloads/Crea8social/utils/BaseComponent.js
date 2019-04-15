import React, {Component} from 'react';
import {Animated, StyleSheet,View,Image,TouchableWithoutFeedback,Text} from "react-native";
import lang from '../lang';
import {
    Item,
    Icon,Button,Left,Right,Thumbnail
} from 'native-base'
import {LIKE_TYPE} from "../api";
import Assets from '@assets/assets'
import MyLog from "./MyLog";
import {doLike, doReact, loadReactMembers} from "../modules/feed/store";
import update from 'immutability-helper';

var images = [
    {id: 'like', img: Assets.like,type: 1},
    {id: 'love', img: Assets.love,type: 4},
    {id: 'haha', img: Assets.haha,type: 5},
    {id: 'yay', img: Assets.yay,type: 6},
    {id: 'wow', img: Assets.wow,type: 7},
    {id: 'sad', img: Assets.sad,type: 8},
    {id: 'angry', img: Assets.angry,type: 9}
];


export default class BaseComponent extends Component {
    lasttime = 0;
    isUping = false;
    isDowning = true;

    constructor(props) {
        super(props);
        //storage.logout();
        this.offset  = 0;
        this.state = {
            scrollY: new Animated.Value(0),
            fetching : false,
            refreshing : false,
            showReact : false,
            itemDetails : null,
            itemLists : [],
            itemListNotEnd : false,
            fetchFinished : false
        };
        this.state.imageTranslate = this.state.scrollY.interpolate({
            inputRange: [0, 20],
            outputRange: [0, -60],
            extrapolate: 'clamp',
        });



        this.lang = lang;
    }

    componentWillMount() {

        this.imgLayouts = {};
        this.imageAnimations = {};
        this.hoveredImg = '';

        this.scaleAnimation = new Animated.Value(0);


    }

    _keyExtractor = (item, index) => item.id;

    onScroll(event) {
        const offsetY = event.nativeEvent.contentOffset.y;
        this.doOnScroll(offsetY,event);



    }

    doOnScroll(offsetY,event) {
        let currentTime = new Date().getTime() / 1000;
        const sensitivity = 60;
        if (offsetY > this.offset) {
            //going down
            //console.log('going down');
            if (Math.abs(offsetY - this.offset) > sensitivity) {
                this.offset = offsetY;
                if (!this.isDowning) {
                    this.updateState({
                        imageTranslate: this.state.scrollY.interpolate({
                            inputRange: [0, 20],
                            outputRange: [0, -60],
                            extrapolate: 'clamp',
                        })
                    });
                }
                this.isUping = false;
                this.isDowning = true;
                Animated.event(
                    [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
                    {onScroll: this.props.onScroll}
                )(event);

            }

        } else {
            //going up
            //console.log('going up');
            //this.state.scrollY = new Animated.Value(0);
            if (Math.abs(offsetY - this.offset) > sensitivity) {
                this.lasttime = currentTime;
                this.offset = offsetY;
                if (!this.isUping) {
                    this.updateState({
                        imageTranslate: this.state.scrollY.interpolate({
                            inputRange: [0, 20],
                            outputRange: [0, 0],
                            extrapolate: 'clamp',
                        })
                    });
                }

                this.isUping = true;
                //this.lasttime = currentTime;
                this.isDowning = false;
                Animated.event(
                    [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
                    {onScroll: this.props.onScroll}
                )(event);
            }
        }
    }

    resetHeader() {
        setTimeout(() => {
            this.offset = 0;
            this.isUping = true;
            this.isDowning = false;

            this.updateState({
                scrollY: new Animated.Value(0),
                imageTranslate: this.state.scrollY.interpolate({
                    inputRange: [0, 20],
                    outputRange: [0, 0],
                    extrapolate: 'clamp',
                })
            });
        }, 500);
    }

    updateState(state) {
        this.setState(state);
    }


    //general reaction system usage
    openReactions() {

        images.forEach((img) => {
            console.log(img.img);
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
        this.updateState({showReact : true});

        setTimeout(() => {
            this.updateState({showReact : false});
        }, 3000)
    }

    getImageAnimationArray(toValue) {
        return images.map((img) => {
            return Animated.timing(this.imageAnimations[img.id].position, {
                duration: 200,
                toValue: toValue
            })
        });
    }

    handleLayoutPosition(img, position) {
        this.imgLayouts[img] = {
            left: position.nativeEvent.layout.x,
            right: position.nativeEvent.layout.x + position.nativeEvent.layout.width
        }
    }
    displayReactions() {
        return (
            <View>
                {LIKE_TYPE === "reaction" && this.state.showReact ? (
                    <View style={{position:'absolute',bottom:0}}>
                        <Animated.View
                            style={[styles.likeContainer]}
                        >
                            {this.getReactionImages()}
                        </Animated.View>
                    </View>
                ) : null}
            </View>
        )
    }

    getReactionImages() {
        return images.map((img) => {
            return (
                <TouchableWithoutFeedback onPress={() => {
                    this.processReaction(img.type);
                    this.updateState({showReact : false})
                }}>
                    <Animated.Image
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

    processReaction(type) {
        //MyLog.e("About to like - " + type);
        let details = this.state.itemDetails;
        details.has_react = (type !== 0 );
        this.updateState({
            itemDetails: details
        });
        doReact({
            type : this.itemName,
            item : this.item,
            code : type,
            typeId : this.itemId,
            userid : this.props.userid
        }).then(() => {
            loadReactMembers({
                type : this.itemName,
                typeId : this.itemId,
                userid : this.props.userid,
                item : this.item,
            }).then((res) => {
                let details = this.state.itemDetails;
                details.react_members = res.members;
                this.updateState({
                    itemDetails: details
                });
            });
        });
    }

    processLike() {
        let details = this.state.itemDetails;
        details.has_like = (!details.has_like );
        this.updateState({
            itemDetails: details
        });
        doLike({
            type : this.itemName,
            item : this.item,
            reactType : type,
            typeId : this.itemId,
            userid : this.props.userid
        }).then((res) => {
            let details = this.state.itemDetails;
            details.like_count = res.likes;
            this.updateState({
                itemDetails: details
            });
        });
    }

    displayLikeCommentStats( borderColor, textColor) {
        let item = this.state.itemDetails;
        if (item.like_count === 0 && item.react_members.length < 1 && item.comments < 1) return null;

        return (
            <Item style={{borderColor: borderColor,paddingTop:0,paddingBottom:5}}>
                {item.like_count > 0 || item.react_members.length > 0 ? (
                    <Left>
                        {LIKE_TYPE === 'reaction' ? (
                            <View style={{flexDirection: 'row'}}>
                                <Thumbnail style={{width:25,height:25,borderRadius:12.5}} small source={{uri: item.react_members[0][0]}}/>
                                {item.react_members.length > 1 ? (
                                    <Thumbnail style={{width:25,height:25,borderRadius:12.5}} small source={{uri: item.react_members[0][1]}}/>
                                ) : null}
                                {item.react_members.length > 2 ? (
                                    <Thumbnail style={{width:25,height:25,borderRadius:12.5}} small source={{uri: item.react_members[0][2]}}/>
                                ) : null}

                                {item.react_members.length > 3 ? (
                                    <TouchableWithoutFeedback onPress={() => {
                                        this.props.navigation.push("likes", {
                                            type : this.itemName,
                                            typeId : this.itemId
                                        })
                                    }}>
                                        <View   style={{width:25,height:25,borderRadius:12.5,backgroundColor:'#D6D7D7',marginLeft:3,padding:0}}>
                                            <Icon name="ios-more" style={{color:'grey',marginLeft:4}}/>
                                        </View>
                                    </TouchableWithoutFeedback>
                                ) : null}
                            </View>
                        ) : (
                            <Button transparent onPress={() => {

                            }}>
                                <Text style={{fontWeight: 'bold',color:textColor}}>{item.like_count}</Text>
                                <Text style={{color: textColor}}> {this.lang.t('people_like_this')}</Text>
                            </Button>
                        )}
                    </Left>
                ) : null}

                <Right>
                    {item.comments > 0 ? (
                        <Button transparent onPress={() => {
                            this.props.navigation.push("comments", {
                                type : this.itemName,
                                typeId : this.itemId,
                                index : 1,
                                component : this,
                                entityType : "user",
                                entityTypeId : this.props.userid
                            });
                        }}>
                            <Text style={{fontWeight: 'bold', color:textColor}}>{item.comments}</Text>
                            <Text style={{color: textColor}}> {this.lang.t('comments')}</Text>
                        </Button>
                    ) : null}
                </Right>
            </Item>
        )
    }

    commentAdded(count, index, lastComment) {
        //console.log("new comment added = " + count);
        this.updateState(update(this.state, {
            itemDetails : {
                comments : {$set : count}
            }
        }));
    }
}


const styles = StyleSheet.create({
    container: {

        left: 0,

        height:50,
    },

    likeContainer: {
        padding: 5,
        backgroundColor: '#FFF',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 20,
        left: 20,
        width: 300,
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
        width: 30,
        height: 30,
        overflow: 'visible'

    }
});