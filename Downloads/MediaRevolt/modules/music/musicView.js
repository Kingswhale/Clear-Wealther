import React from 'react';
import {
    Text, View,
    StyleSheet, ActivityIndicator,
    Animated, Dimensions, TouchableOpacity, FlatList, Alert, ScrollView, WebView, Platform,ProgressBarAndroid,ProgressViewIOS
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
    ListItem, Toast,Header
} from 'native-base'
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api, {LIKE_TYPE, WEBSITE} from "../../api";
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modalbox';
import {Menu,MenuTrigger,MenuOptions,renderers,MenuProvider} from 'react-native-popup-menu';
import ProfileBaseComponent from "../../utils/profileBaseComponent";
import material from "../../native-base-theme/variables/material";
import MusicCreate from './musicCreate';
import HTMLView from 'react-native-htmlview'
import Share from "react-native-share";
import MusicPlayerService, { Track, Events, RepeatModes } from 'react-native-music-player-service';
import MusicControl from 'react-native-music-control'

class MusicView extends ProfileBaseComponent {
    constructor(props) {
        super(props);

        this.type = this.props.type;
        this.itemId = this.props.navigation.getParam("itemId");
        this.asPlayer = this.props.navigation.getParam("player", false);
        this.itemDetails = this.props.navigation.getParam("item");
        this.lastScrollPos = 0;

        this.state.processing = false;
        this.state.showHeaderContent  =  true;
        this.state.scrollY =  new Animated.Value(0);

        this.profileDetails = null;
        this.state.playTime = 0.4;
        this.state.playing = false;
        this.state.isPaused = false;
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

        this.itemName = 'music';

        this.prepare();
    }


    prepare() {
        this.musicPlayerService = new MusicPlayerService(true, {

        });

        this.musicPlayerService.addEventListener(Events.Play, track => this.event(Events.Play, track));
        this.musicPlayerService.addEventListener(Events.Pause, track => this.event(Events.Pause, track));
        this.musicPlayerService.addEventListener(Events.Next, track => this.event(Events.Next, track));
        this.musicPlayerService.addEventListener(Events.Previous, track => this.event(Events.Previous, track));
        this.musicPlayerService.addEventListener(Events.EndReached, track => this.event(Events.EndReached, track));

        //console.log(this.itemDetails.file);
        let songsInformation = [
            {
                id: this.itemDetails.id,
                path: this.itemDetails.file,
                title: this.itemDetails.title,
                album: this.itemDetails.album,
                artist: this.itemDetails.artist,
                genre: "",
                //duration: 2260,
                artwork: this.itemDetails.cover
            }
        ];
        let tracks = songsInformation.map(s => {
            return new Track({id: s.id, path: s.path, additionalInfo: s});
        });

        this.musicPlayerService.setQueue(tracks)
            .then(returnedQueue => {
                //console.log('Queue has been set');
                //return musicPlayerService.togglePlayPause();
                //this.musicPlayerService.togglePlayPause();
            }).catch((e) => {
                //console.log('Music not yet');
                //console.log(e);
        })
    }
    finishedEdit(res) {
        this.updateState({itemDetails: res.music});
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

    event(event, tract) {
        if (event === Events.Play) {
           // this.togglePlay();
            this.updateState({isPaused: false})
        }

        if (event === Events.Pause) {
            //this.togglePlay();
            this.updateState({isPaused: true})
        }
    }

    togglePlay() {
        if (this.state.isPaused) {
            this.musicPlayerService.togglePlayPause();
            this.updateState({isPaused: !this.state.isPaused})
        } else {
            this.musicPlayerService.togglePlayPause();
            this.updateState({isPaused: !this.state.isPaused})
        }
    }
    startPlaying() {
        this.prepare();
        this.updateState({playing : true});
        this.musicPlayerService.togglePlayPause();
    }

    stopPlaying() {
        this.updateState({isPaused : false, playing: false});
        this.musicPlayerService.stop();
        MusicControl.stopControl();
    }

    render() {
        if (LIKE_TYPE === 'reaction') {
            this.hasLike = (this.state.itemDetails) ? this.state.itemDetails.has_react: false;
        } else {
            this.hasLike = (this.state.itemDetails) ? this.state.itemDetails.has_like: false;
        }
        return (
            <MenuProvider customStyles={menuProviderStyles}>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />

                {this.state.itemDetails !== null ? (
                    <View style={{flex:1}}>
                        <Modal
                            ref={"createModal"}
                            coverScreen={false}
                            entry="top"
                            position="top"
                            backButtonClose={true}
                            swipeToClose={false}
                            backdropPressToClose={false}
                            onClosingState={this.onClosingState}>
                            <MusicCreate navigation={this.props.navigation} type="edit" itemId={this.state.itemDetails.id} component={this}/>
                        </Modal>
                        <Animated.View style={{
                            height: Dimensions.get('window').height + 160,
                            transform: [{translateY: this.state.imageTranslate}],
                            backgroundColor: 'white'
                        }}>
                            <FastImage source={{uri : this.state.itemDetails.cover}} style={{height:230}}>
                                <View style={{height:230,backgroundColor: 'rgba(35,47,61,0.6)',width:'100%',flex:1}}>
                                    {this.renderHeader(false)}

                                </View>

                                <CardItem header  style={{backgroundColor:'#EFEFEF',position:'absolute',bottom:0,width:'100%'}}>
                                    <Text style={{fontSize:15}}>{this.state.itemDetails.title}</Text>
                                </CardItem>
                                <TouchableOpacity
                                    style={{
                                        position:'absolute',bottom:20,
                                        right:20,
                                        zIndex:999,
                                    }}
                                    onPress={() => this.startPlaying()}>
                                    <View style={{
                                        backgroundColor: material.accentTextColor,
                                        width:60,height:60,borderRadius:35}}>
                                        <Icon name="md-play" style={{color:'#EFEFEF',fontSize:40,margin:0,left:20,top:10}}/>
                                    </View>
                                </TouchableOpacity>
                            </FastImage>

                            <ScrollView
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                onScroll={this.onScroll.bind(this)}
                                style={{}}>


                                {!this.asPlayer ? (
                                    <View >
                                        <View style={{position:'absolute',bottom : 20,zIndex:20,padding:10}}>
                                            {this.displayReactions()}
                                        </View>
                                        <View style={{paddingTop:5}}>
                                            {this.displayLikeCommentStats('white', 'black')}
                                            <View style={{flexDirection: 'row',borderColor:'white',borderTopColor:'#EFEFEF',borderWidth:.6,marginTop:0}}>


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
                                                                <Icon style={{fontSize:22,marginRight: 10}} name="like" type="SimpleLineIcons" />
                                                                <Text style={{marginTop:5}}>{this.lang.t('like')}</Text>
                                                            </View>
                                                        )}
                                                    </Button>

                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Button transparent onPress={() => {
                                                        this.props.navigation.push("comments", {
                                                            type : 'music',
                                                            index : 1,
                                                            component: this,
                                                            typeId : this.state.itemDetails.id,
                                                            entityType : "user",
                                                            entityTypeId : this.props.userid
                                                        });
                                                    }}>
                                                        <Icon style={{fontSize:22,marginRight: 10}}  name="bubble" type="SimpleLineIcons" />
                                                        <Text >{this.lang.t('comment')}</Text>
                                                    </Button>
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Button transparent onPress={() => {
                                                        let url = WEBSITE + "music/" + this.state.itemDetails.slug;
                                                        const shareOptions = {
                                                            title: this.lang.t('share_via'),
                                                            url: url
                                                        };
                                                        Share.open(shareOptions);
                                                    }}>
                                                        <Icon style={{fontSize:22,marginRight: 10}}  name="action-undo" type="SimpleLineIcons" />
                                                        <Text style={{}}>{this.lang.t('share')}</Text>
                                                    </Button>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ) : null}
                            </ScrollView>


                        </Animated.View>

                        {this.state.playing ? (
                            <View style={{width:'100%',height:100,bottom:0,position:'absolute',
                                borderTopColor:'#EBEBEB',borderTopWidth:0.6,flexDirection:'row',padding:15}}>
                                <FastImage source={{uri : this.state.itemDetails.cover}} style={{width:70,height:70,borderRadius:5}}/>
                                <View style={{
                                    top:15,
                                    marginLeft:10,
                                    backgroundColor: '#FCFCFC',
                                    width:40,height:40,borderRadius:20}}>
                                    <Icon name="md-skip-backward" style={{color:'#EBEBEB',fontSize:20,margin:0,left:10,top:10}}/>
                                </View>
                                <TouchableOpacity onPress={() => this.togglePlay()}>
                                    <View style={{
                                        top:15,
                                        marginLeft:10,
                                        backgroundColor: '#EBEBEB',
                                        width:40,height:40,borderRadius:20}}>
                                        <Icon name={this.state.isPaused ? "md-play" : "md-pause"} style={{color:'black',fontSize:20,margin:0,left:15,top:10}}/>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.stopPlaying()}>
                                    <View style={{
                                        top:15,
                                        marginLeft:10,
                                        backgroundColor: '#FCFCFC',
                                        width:40,height:40,borderRadius:20}}>
                                        <Icon name="md-close" style={{color:'#EBEBEB',fontSize:20,margin:0,left:10,top:10}}/>
                                    </View>
                                </TouchableOpacity>
                                <View style={{
                                    top:15,
                                    marginLeft:10,
                                    backgroundColor: '#FCFCFC',
                                    width:40,height:40,borderRadius:20}}>
                                    <Icon name="md-skip-forward" style={{color:'#EBEBEB',fontSize:20,margin:0,left:10,top:10}}/>
                                </View>
                            </View>
                        ) : null}
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
                        {this.state.itemDetails.user_id === this.props.userid ? (
                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                this.refs.createModal.open();
                            }}>
                                <Left><Icon active name="pencil" type="SimpleLineIcons" style={{color:'#2196F3', fontSize: 15}} /></Left>
                                <Body><Text>{this.lang.t('edit_music')}</Text></Body>
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
})(MusicView)