import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {View, Text, Dimensions, TouchableWithoutFeedback, StyleSheet, Alert} from 'react-native';
import {connect} from "react-redux";

import {
    Container,
    Button, Icon, ActionSheet,Toast,ListItem,Body,Right,Left
} from 'native-base';
import FastImage from 'react-native-fast-image';
import ImageZoom from 'react-native-image-pan-zoom';
import {ViewPager} from 'rn-viewpager';
import Util from "../../utils/Util";
import material from "../../native-base-theme/variables/material";
import {LIKE_TYPE, WEBSITE} from "../../api";
import {Menu,MenuTrigger,MenuOptions,renderers,MenuProvider} from 'react-native-popup-menu';
import {deletePhoto, loadPhotoDetails, setPhoto} from "../user/store";
import Share from "react-native-share";
import storage from "../../store/storage";

class PhotoViewer extends BaseComponent {
    constructor(props) {
        super(props);

        this.photos = this.props.navigation.getParam("photos");
        this.selectedPhoto = this.props.navigation.getParam("selected");
        this.isLoaded = false;
        this.state.showDetails = true;
        this.itemName = 'photo';
        //fetch from server
        //this.fetchDetails();
    }

    displayImages() {

        let pages = [];
        //console.log('I am here')
        for(let i=0;i<this.photos.length;i++) {
            pages.push(<View  key={i}>
                <ImageZoom cropWidth={Dimensions.get('window').width}
                           cropHeight={Dimensions.get('window').height}
                           imageWidth={Dimensions.get('window').width}
                           imageHeight={Dimensions.get('window').height}>
                    <TouchableWithoutFeedback onPress={() => {
                        if (this.state.showReact) {
                            this.updateState({
                                showReact : false
                            })
                        } else {
                            this.updateState({
                                showDetails : !this.state.showDetails
                            })
                        }
                        return true;

                    }}>
                        <FastImage
                            resizeMode="contain"
                            style={{width: '100%', height: Dimensions.get('window').height,}}
                            source={{uri: this.photos[i]}}/>
                    </TouchableWithoutFeedback>
                </ImageZoom>
            </View>);
        }
        //console.log('I am here now')

        return (<ViewPager
            style={{flex: 1}}
            onPageSelected={(obj) => {
                this.selectedPhoto = this.photos[obj.position];
                this.isLoaded = false;
                //fetch from server
                this.fetchDetails();
            }}

            initialPage={Util.findIndex(this.selectedPhoto,this.photos)}>
            {pages}
        </ViewPager>);
    }

    fetchDetails() {
        //let clear the states since we are trying to refresh or swipe the image
       
        loadPhotoDetails({
            userid : this.props.userid,
            photo : this.selectedPhoto
        }).then((res) => {
            this.isLoaded = true;
            //this.photos[Util.findIndex(this.selectedPhoto,this.photos)] = this.state.itemDetails.path;
            this.itemId = res.id;
            this.item = res;
            //console.log(res);
            this.updateState({
                itemDetails: res
            });
        }).catch((e) => {
            //console.log(e);
        });
    }


    render() {


        //console.log(this.state.itemDetails);
        if (LIKE_TYPE === 'reaction') {
            this.hasLike = (this.state.itemDetails) ? this.state.itemDetails.has_react: false;
        } else {
            this.hasLike = (this.state.itemDetails) ? this.state.itemDetails.has_like: false;
        }
        return (
            <TouchableWithoutFeedback onPress={() => {
                this.updateState({
                    showReact : false,
                    showDetails : !this.state.showDetails
                })
            }}>
                <MenuProvider customStyles={menuProviderStyles}>
                    <Container style={{flex:1,backgroundColor:'black'}}>
                        {this.displayImages()}

                        {this.state.showDetails ? (
                            <View style={{width:'100%',height:50,flexDirection: 'row',paddingRight:10,position:'absolute',top:0,backgroundColor:'rgba(0,0,0,0.3)'}}>
                                <View style={{flex:1,flexDirection: 'row'}}>
                                    <Button transparent onPress={() => {
                                        this.props.navigation.goBack()
                                    }}>
                                        <Icon name="ios-arrow-round-back" style={{color:'white'}}/>
                                    </Button>
                                </View>
                                {this.isLoaded && this.state.itemDetails.userid === this.props.userid ? (
                                    <View>
                                        <Button transparent style={{right:-15}} onPress={() => {
                                            this.menu.open();
                                        }}>
                                            <Icon name="md-more" style={{color:'grey'}} />
                                        </Button>
                                        <Menu ref={(c) => this.menu = c} renderer={renderers.SlideInMenu}>
                                            <MenuTrigger>

                                            </MenuTrigger>
                                            <MenuOptions>
                                                <ListItem noBorder icon onPress={()=>{
                                                    this.menu.close();
                                                    this.setProfilePicture();
                                                }}>
                                                    <Left><Icon active name="pencil" type="SimpleLineIcons" style={{color:'#2196F3', fontSize: 15}} /></Left>
                                                    <Body><Text>{this.lang.t('use_as_profile_picture')}</Text></Body>
                                                </ListItem>

                                                <ListItem noBorder icon onPress={()=>{
                                                    this.menu.close();
                                                    Alert.alert(
                                                        this.lang.t('do_you_delete_photo'),
                                                        '',
                                                        [
                                                            {text: this.lang.t('cancel'), onPress: () => {

                                                                }, style: 'cancel'},
                                                            {text: this.lang.t('yes'), onPress: () => {
                                                                    this.deletePhoto();
                                                                }},
                                                        ],
                                                        { cancelable: true }
                                                    );
                                                }}>
                                                    <Left><Icon active name="trash" type="SimpleLineIcons" style={{color:'#F44336', fontSize: 15}} /></Left>
                                                    <Body><Text>{this.lang.t('delete_photo')}</Text></Body>
                                                </ListItem>
                                            </MenuOptions>
                                        </Menu>
                                    </View>
                                ) : null}
                            </View>
                        ) : null}

                        {this.isLoaded && this.state.showDetails ? (
                            <View style={{width:'100%',paddingRight:10,position:'absolute',bottom:0,backgroundColor:'rgba(0,0,0,0.5)'}}>
                                {this.displayReactions()}
                                <View style={{marginLeft:10,marginRight: 10}}>
                                    {this.displayLikeCommentStats('black', 'white')}
                                </View>

                                <View style={{height:70,flexDirection: 'row'}}>
                                    <View style={{flex: 1}}>
                                        <Button transparent onLongPress={() => {
                                            if (LIKE_TYPE === 'reaction') this.openReactions();
                                        }} onPress={() => {
                                            if (LIKE_TYPE === "reaction") {
                                                if (this.hasLike) {
                                                    this.processReaction(0);
                                                } else {
                                                    this.processReaction(1);
                                                }
                                            } else {
                                                this.processLike()
                                            }
                                        }} style={{alignSelf: 'center'}}>
                                            {this.hasLike ? (
                                                <View style={{flexDirection: 'row',alignSelf:'flex-start'}}>
                                                    <Icon style={{fontSize:22,marginRight: 10,color:material.brandPrimary}} active name="md-thumbs-up"  type="Ionicons"/>
                                                    <Text style={{marginTop:5,color: material.brandPrimary}}>{this.lang.t('like')}</Text>
                                                </View>
                                            ): (
                                                <View style={{flexDirection: 'row'}}>
                                                    <Icon style={{fontSize:22,marginRight: 10,color:'white'}} name="like" type="SimpleLineIcons" />
                                                    <Text style={{marginTop:5,color:'white'}}>{this.lang.t('like')}</Text>
                                                </View>
                                            )}
                                        </Button>

                                    </View>
                                    <View style={{flex: 1}}>
                                        <Button transparent onPress={() => {
                                            this.props.navigation.push("comments", {
                                                type : 'photo',
                                                index : 1,
                                                component: this,
                                                typeId : this.state.itemDetails.id,
                                                entityType : "user",
                                                entityTypeId : this.props.userid
                                            });
                                        }}>
                                            <Icon style={{fontSize:22,marginRight: 10,color:'white'}}  name="bubble" type="SimpleLineIcons" />
                                            <Text style={{color:'white'}}>{this.lang.t('comment')}</Text>
                                        </Button>
                                    </View>
                                    <View style={{flex: 1}}>
                                        <Button transparent onPress={() => {
                                            let url = this.state.itemDetails.path;
                                            const shareOptions = {
                                                title: this.lang.t('share_via'),
                                                url: url
                                            };
                                            Share.open(shareOptions);
                                        }}>
                                            <Icon style={{fontSize:22,marginRight: 10,color:'white'}}  name="action-undo" type="SimpleLineIcons" />
                                            <Text style={{color:'white'}}>{this.lang.t('share')}</Text>
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        ) : null}
                    </Container>
                </MenuProvider>
            </TouchableWithoutFeedback>
        );
    }

    deletePhoto() {
        this.photos = Util.deleteFromArray(this.selectedPhoto, this.photos);
        deletePhoto({
            userid : this.props.userid,
            photoId : this.state.itemDetails.id
        });
        if (this.photos.length > 0) {
            this.selectedPhoto = this.photos[0];
            this.updateState({
                done : true
            });
        } else {
            this.props.navigation.goBack();
        }
    }

    setProfilePicture() {
        setPhoto({
            userid : this.props.userid,
            photo_id : this.state.itemDetails.id
        }).then((res) => {
            Toast.show({
                text : this.lang.t('photo_set_succss')
            });
            storage.set('avatar', this.state.itemDetails.path);
            this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                    userid : this.props.userid,
                    username : this.props.username,
                    password : this.props.password,
                    avatar : this.state.itemDetails.path,
                    cover : this.props.cover
                }});
        })
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
        actionDone : state.user.actionDone,
        itemDetails : state.user.itemDetails
    }
})(PhotoViewer)