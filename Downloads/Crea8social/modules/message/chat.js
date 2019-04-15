import React from 'react';
import BaseComponent from "../../utils/BaseComponent";

import {
    ActivityIndicator,
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    TouchableWithoutFeedback,
    PermissionsAndroid, Keyboard
} from 'react-native';
import {connect} from "react-redux";
import material from "../../native-base-theme/variables/material";
import {
    Container,
    Fab,Icon,
    Header,Right,Left,Body,
    Item,
    Thumbnail ,Badge,Button,Input,Tabs,Tab  } from 'native-base';
import Api from "../../api";
import ImagePicker from 'react-native-image-crop-picker';
import EmptyComponent from "../../utils/EmptyComponent";
import FastImage from 'react-native-fast-image';
import time from "../../utils/Time";
import HTMLView from 'react-native-htmlview'
import EventBus from 'eventing-bus';
import firebase from 'react-native-firebase';
import GridView from 'react-native-super-grid';
import update from 'immutability-helper';
import {Events, Track} from "react-native-music-player-service";
import MusicPlayerService from "react-native-music-player-service";
import {AudioRecorder, AudioUtils} from "react-native-audio";
import { MaterialDialog } from 'react-native-material-dialog';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
class Chat extends BaseComponent {
    offset = 0;
    limit = 5;
    constructor(props) {
        super(props);

        this.theUserid = this.props.navigation.getParam("userid");
        this.cid = this.props.navigation.getParam("cid", "");
        this.avatar = this.props.navigation.getParam('avatar', "");
        this.name = this.props.navigation.getParam("name", "");
        this.state.text = "";
        this.state.image = null;
        this.state.showEmoticon = false;
        this.state.emoticons = [];
        this.state.stickers = [];
        this.state.gif = null;
        this.state.record = null;
        this.state.recording = false;
        this.state.showRecordDialog = false;
        this.props.navigation.addListener('didFocus', (status: boolean) => {
            try{
                firebase.notifications().removeDeliveredNotification('message');
            } catch (e) {}
        });

        this.playerList = [];
        this.justPaginate = false;
        this.scrolling = false;
    }

    componentDidMount() {
        this.fetchMessages(false);
        this.loadEmoticons();
        try{
            firebase.notifications().removeDeliveredNotification('message');
        } catch (e) {}
        EventBus.on("pushNotification", (name) => {
            if (this.props.navigation.isFocused()) {
                this.handlerRefresh()
            }
            try{
                firebase.notifications().removeDeliveredNotification('message');
            } catch (e) {}
        });
    }

    fetchMessages(type) {
        this.updateState({fetchFinished : false});
        let pageOffset = this.offset;
        this.offset = pageOffset + this.limit;
        Api.get("chat/get/messages", {
            userid : this.props.userid,
            theuserid : this.theUserid,
            cid : this.cid,
            limit : this.limit,
            offset : pageOffset
        }).then((res) => {

            if (res.length > 0) {
                if (type) {
                    //more
                    let lists = [];
                    lists.push(...res);
                    lists.push(...this.state.itemLists);
                    this.updateState({itemLists: lists,fetchFinished: true});
                    this.justPaginate = true;
                    setTimeout(() => {
                        this.scrolling = true;
                        try{
                            this.refs.flatList.scrollToIndex({animated: false, index: this.limit - 2});
                        } catch (e) {}
                        setTimeout(() => {
                            this.scrolling = false;
                        }, 200);
                    }, 200);
                } else {
                    //refresh
                    this.updateState({itemLists: res,fetchFinished: true});
                    setTimeout(() => {
                        this.scrollToEnd();
                    }, 300);
                }
            } else {
                this.updateState({fetchFinished: true, itemListNotEnd: true})
            }
        }).catch((e) => {
            this.updateState({fetchFinished: true, itemListNotEnd: true})
        });
    }

    handlerRefresh() {
        this.offset = 0;
        this.fetchMessages(false);
    }

    loadEmoticons() {
        Api.get("get/emoticons", {
            userid : this.props.userid
        }).then((res) => {
            this.updateState({emoticons : res.emoticons, stickers : res.stickers})
        });
    }

    scrollToEnd() {
        this.scrolling = true;
        if (this.state.itemLists.length > 0) {
            try{
                this.refs.flatList.scrollToEnd({animated : false})
            } catch(e){}
        }
        setTimeout(() => {
            this.scrolling = false;
        }, 300);
    }

    render() {
        return (
            <Container>
                <Header hasTabs>
                    <View style={{flexDirection:'row',width:'100%'}}>
                        <Button style={{left:-10}} transparent onPress={() => {this.props.navigation.goBack()}}>
                            <Icon name="ios-arrow-round-back"/>
                        </Button>
                        <View style={{flexDirection:'row',flex:1,left:-20,top:(Platform.OS === 'ios' ) ? 5 : 10}}>
                            <FastImage style={{width:30,height:30,borderRadius:15,marginRight:10}} source={{uri : this.avatar}}/>
                            <Text style={{fontSize:15,color:'white',top:5}}>{this.name}</Text>
                        </View>
                        {!this.theUserid.match(",") ? (
                            <Button style={{right:-15}}  transparent onPress={() => {
                                this.props.navigation.push("profile", {
                                    id : this.theUserid
                                })
                            }}>
                                <Icon name="ios-contact-outline"/>
                            </Button>
                        ) : null}
                    </View>
                </Header>
                <FlatList
                    style={{flex:1}}
                    scrollEventThrottle={16}
                    overScrollMode="never"
                    onScroll={(event) => {
                        //console.log(event.nativeEvent.contentOffset.y);
                        let yOffset = event.nativeEvent.contentOffset.y;
                        if (yOffset < 5 && this.state.fetchFinished && !this.scrolling) {
                            //console.log('About fetch');
                            this.justPaginate = true;
                            this.fetchMessages(true);
                        }
                    }}
                    onEndReachedThreshold={.5}
                    ref="flatList"
                    data={this.state.itemLists}
                    extraData={this.state}
                    refreshing={this.state.refreshing}
                    onRefresh={() => {
                        this.handlerRefresh();
                    }}
                    onContentSizeChange={() => {

                    }}
                    onLayout={() => {

                    }}
                    keyExtractor={(item, index) => item.id}
                    ListEmptyComponent={!this.state.fetchFinished ? (<Text/>) : (
                        <EmptyComponent text='' icon="speech"/>
                    )}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {(!this.state.fetchFinished && !this.justPaginate) ? (
                            <ActivityIndicator size='large' />
                        ) : null}

                    </View>}
                    renderItem={({ item ,index}) => (
                        this.displayMessages(item,index)
                    )}
                />

                <MaterialDialog
                    title={this.lang.t('record_voice')}
                    visible={this.state.showRecordDialog}
                    onCancel={() => this.updateState({showRecordDialog: false })}>
                    <View style={{margin:20, alignSelf:'center'}}>
                        <TouchableOpacity onPress={() => {
                            this.doRecord();
                        }}>
                            <View style={{
                                marginLeft:10,
                                backgroundColor: this.state.recording ? 'red' : material.brandPrimary,
                                width:40,height:40,borderRadius:20,alignSelf:'center'}}>
                                <Icon name={this.state.recording ? "md-square" : "md-play"} style={{color:'white',fontSize:20,margin:0,left:15,top:10}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </MaterialDialog>

                <View style={{backgroundColor: '#F4F4F4',borderTopColor:'#CCCCCC',borderTopWidth:.6}}>
                    <View style={{flexDirection: 'row',padding:10}}>
                        <View style={{flexDirection: 'column', flex: 1}}>

                            <View  style={{
                                borderColor:'grey',
                                borderWidth:.5,
                                backgroundColor: '#F2F3F5',
                                height:40,width:'100%',borderRadius:20,padding:5,flexDirection:'row'}}>
                                <Input style={{flex:1,bottom:8}} onChangeText={(text) => {
                                    this.updateState({text : text})
                                }}
                                       onFocus={() => {
                                           this.updateState({showEmoticon:false})
                                       }}
                                       placeholder={this.lang.t((this.renderType === 'comment') ? 'write_comment' : 'write_reply')} value={this.state.text}/>
                                <TouchableOpacity onPress={() => {
                                    //select image
                                    ImagePicker.openPicker({
                                    }).then(image => {
                                        //console.log(images);
                                        this.updateState({image: image})
                                    });
                                }} style={{top:5,left:10}}>
                                    <Icon name="camera" style={{color:'lightgrey',position:'relative',fontSize:20,width:30}} type="SimpleLineIcons"/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    //select image
                                    this.updateState({showRecordDialog: true})
                                }} style={{top:5,left:10}}>
                                    <Icon name="md-microphone" style={{position:'relative',fontSize:20,width:30,color:'blue'}} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    //select image
                                    this.props.navigation.navigate("gif", {
                                        component : this
                                    });
                                }} style={{top:5}}>
                                    <View style={{borderColor:'brown',borderWidth:.5,padding:3,borderRadius:5,width:25,marginRight:5}}><Text style={{color:'brown',fontSize:10}}>GIF</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    //select image
                                    if (this.state.emoticons.length < 1) this.loadEmoticons();
                                    Keyboard.dismiss();
                                    this.updateState({showEmoticon: true})
                                }} style={{top:5}}>
                                    <Icon name="emotsmile" style={{color:'lightgrey',position:'relative',fontSize:20,width:30}} type="SimpleLineIcons"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Button primary rounded style={{marginLeft:5}} onPress={() => {
                            this.sendChat();
                        }}>
                            <Icon name="ios-send"/>
                        </Button>
                    </View>
                    {this.state.showEmoticon ? (
                        <View style={{width:'100%',
                            backgroundColor: 'white',borderTopColor:'#FAFAFF',borderTopWidth:0.6,height:200}}>
                            <TouchableOpacity onPress={() => {
                                this.updateState({showEmoticon: false})
                            }} style={{position:'absolute', zIndex:999, right: 10,top:10}}>
                                <Icon name="md-close" style={{fontSize:25,color:'black'}}/>
                            </TouchableOpacity>
                            <Tabs initialPage={0}>
                                <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('emoticons')} >
                                    <GridView
                                        itemDimension={40}
                                        style={{flex: 1,marginTop:10}}
                                        items={this.state.emoticons}
                                        ref='_flatList'

                                        keyExtractor={(item, index) => item.id}


                                        renderItem={item => (
                                            <TouchableOpacity onPress={() => {
                                                let currentText = this.state.text;
                                                currentText += ' ' + item.code;
                                                this.updateState({text : currentText});
                                            }}>
                                                <FastImage resizeMode="contain" style={{width:25,height:25,margin:5,resizeMode:'contain'}} source={{uri : item.image}}/>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </Tab>
                                <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('stickers')} >
                                    <GridView
                                        itemDimension={60}
                                        style={{flex: 1,marginTop:10}}
                                        items={this.state.stickers}
                                        ref='_flatList'

                                        keyExtractor={(item, index) => item.id}


                                        renderItem={item => (
                                            <TouchableOpacity onPress={() => {
                                                let currentText = this.state.text;
                                                currentText += ' ' + item.code;
                                                this.updateState({text : currentText});
                                            }}>
                                                <FastImage resizeMode="contain" style={{width:40,height:40,margin:5,resizeMode:'contain'}} source={{uri : item.image}}/>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </Tab>
                            </Tabs>
                        </View>
                    ) : null}
                </View>
            </Container>
        )
    }

    receiveGif(item) {
        this.updateState({gif : item});
        setTimeout(() => {
            this.sendChat();
        }, 300)
    }

    async doRecord() {
        if (Platform.OS === 'ios') {
            this.youCanRecordNow();
        } else {
            const granted = await PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.RECORD_AUDIO );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                this.youCanRecordNow()
            }
        }
    }

    async youCanRecordNow() {
        if (this.state.recording) {
            this.updateState({recording: false, showRecordDialog: false});

            const filePath = await AudioRecorder.stopRecording();
            if (Platform.OS === 'android') {
                this.updateState({record: Platform.OS === 'android' ? 'file://' + filePath : filePath});
                setTimeout(() => {
                    this.sendChat()
                }, 300);
            } else {
                AudioRecorder.onFinished = (data) => {
                    // Android callback comes in the form of a promise instead.
                    if (Platform.OS === 'ios') {
                        this.updateState({record: data.audioFileURL});
                        setTimeout(() => {
                            this.sendChat()
                        }, 300);
                    }
                };
            }
        } else {
            AudioRecorder.prepareRecordingAtPath(AudioUtils.DocumentDirectoryPath + '/test.aac', {
                SampleRate: 22050,
                Channels: 1,
                AudioQuality: "High",
                AudioEncoding: "aac",
                AudioEncodingBitRate: 32000,
                OutputFormat: 'aac_adts',
            });
            await AudioRecorder.startRecording();
            this.updateState({recording: true});
        }
    }


    sendChat() {
        if (this.state.text === '' && this.state.image === null && this.state.gif === null && this.state.record === null) return false;
        let obj = {
            id : 500,
            from_me : true,
            text : this.state.text,
            image : (this.state.image !== null) ? this.state.image.path : '',
            time : '0:seconds-ago',
            avatar : this.props.avatar,
            gif : this.state.gif === null ? '' : this.state.gif,
            voice : this.state.record === null ? '' : this.state.record,
            sending : true
        };



        let lists = [];
        lists.push(...this.state.itemLists);
        lists.push(obj);
        let index = lists.length - 1;
        this.updateState({itemLists: lists});
        setTimeout(() => {
            this.scrollToEnd();
        }, 300);
        let formData = new FormData();
        formData.append("userid", this.props.userid);
        formData.append("theuserid", this.theUserid);
        formData.append("cid", this.cid);
        formData.append("text", obj.text);

        if (this.state.image !== null) {
            //console.log(obj.image);
            formData.append("image", {
                uri: this.state.image.path,
                type: this.state.image.mime, // or photo.type
                name: this.state.image.path
            });
        }

        let selectedGif = '';
        if (this.state.gif !== null) {
            formData.append("gif", this.state.gif);
            selectedGif = this.state.gif;
        }

        if (this.state.record !== null) {
            formData.append('voice', {
                uri: this.state.record,
                type: 'audio/aac', // or photo.type
                name: this.state.record
            });
        }
        this.updateState({text: '', image : null,showEmoticon: false,gif:null,record: null});
        Api.post("chat/send/message", formData).then((res) => {
            if (res.status === 1) {
                this.cid = res.cid;
                res.gif = selectedGif;
                this.updateState(update(this.state, {
                    itemLists : {[index] : {$set : res}}
                }))
            }
        }).catch((res) => {
          //
        })
    }

    displayMessages(item,index) {
        //#BDBEBE
        return (
            <View>
                {item.from_me ? (
                    <View style={{alignContent:'flex-end',paddingLeft:40,marginTop:5,marginBottom:5}}>
                       <View style={{alignSelf:'flex-end',flexDirection:'row',}}>
                           <View style={{backgroundColor:material.brandPrimary,borderRadius:15,flex:1}}>

                               {item.text !== '' ? (
                                   <HTMLView style={{flex:1,color: 'grey',margin:10,flexDirection: 'row', flexWrap: 'wrap'}} textComponentProps={{ style: bghtmlstyles.defaultStyle2 }}
                                             value={item.text} />
                               ) : null}
                               {item.image !== '' ? (
                                   <TouchableWithoutFeedback onPress={() => {
                                       let images = [];
                                       images.push(item.image);
                                       if (item.sending !== undefined) return false;
                                       this.props.navigation.push("photoViewer", {
                                           photos : images,
                                           selected : item.image
                                       });
                                   }}>
                                       <FastImage source={{uri :item.image}} style={{width:'100%',height:200,borderRadius:15}}/>
                                   </TouchableWithoutFeedback>
                               ) : null}

                               {this.displayOthersContent(item,index)}
                           </View>
                           <FastImage source={{uri: (item.avatar === '') ? this.props.avatar : item.avatar}} style={{width:40,height:40,borderRadius:20,margin:5}}/>
                       </View>
                        <Text style={{color:'grey',fontSize:10, alignSelf:'flex-end', right:50,marginTop:5}}>
                            {item.sending === undefined ? time.ago(item.time_ago) : this.lang.t('sending')}
                        </Text>
                    </View>
                ) : (<View style={{alignContent:'flex-start',paddingRight:40,marginTop:5,marginBottom:5}}>
                    <View style={{alignSelf:'flex-end',flexDirection:'row',}}>
                        <FastImage source={{uri: item.avatar}} style={{width:40,height:40,borderRadius:20,margin:5}}/>
                        <View style={{backgroundColor:'white',borderRadius:15,flex:1}}>
                            {item.text !== '' ? (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap'}}>
                                    <HTMLView style={{flex:1,color: 'grey',margin:10,flexDirection: 'row', flexWrap: 'wrap'}} textComponentProps={{ style: bghtmlstyles.defaultStyle }}
                                              value={item.text} />
                                </View>

                            ) : null}
                            {item.image !== '' ? (
                                <TouchableWithoutFeedback onPress={() => {
                                    let images = [];
                                    images.push(item.image);
                                    if (item.sending !== undefined) return false;
                                    this.props.navigation.push("photoViewer", {
                                        photos : images,
                                        selected : item.image
                                    });
                                }}>
                                    <FastImage source={{uri :item.image}} style={{width:'100%',height:200,borderRadius:15}}/>
                                </TouchableWithoutFeedback>
                            ) : null}

                            {this.displayOthersContent(item,index)}
                        </View>
                    </View>
                    <Text style={{color:'grey',fontSize:10, alignSelf:'flex-start', left:50,marginTop:5}}>
                        {item.sending === undefined ? time.ago(item.time_ago) : this.lang.t('sending')}
                        </Text>
                </View>)}
            </View>
        );
    }

    displayOthersContent(item,index) {
        let views = [];
        if (item.gif !== '') {
            views.push(<TouchableWithoutFeedback onPress={() => {
                if (item.sending !== undefined) return false;
                this.props.navigation.push("photoViewer", {
                    photos : [item.gif],
                    selected : item.gif
                });
            }}>
                <FastImage resizeMode="contain" style={{width: '100%', height: 200}} source={{uri: item.gif}}/>
            </TouchableWithoutFeedback>)
        }

        if (item.voice !== '') {
            views.push(<View style={{margin:10,
                flexDirection:'row',
                backgroundColor:'grey',
                borderRadius:10, padding:0}}>
                <TouchableOpacity onPress={() => {
                    if (item.sending !== undefined) return false;
                    this.togglePlayVoice(item,index)
                }} >
                    <View style={{
                        margin:5,
                        marginLeft:5,
                        backgroundColor: material.brandPrimary,
                        width:30,height:30,borderRadius:20,alignSelf:'center'}}>
                        <Icon name={item.voicePlaying ? "md-pause" : "md-play"} style={{color:'white',fontSize:15,margin:0,left:12,top:7}}/>
                    </View>
                </TouchableOpacity>
                <View style={{
                    marginLeft:10,
                    padding:10,
                    backgroundColor: '#F7F7F7',
                    height:40,borderRadius:10,flex:1,borderTopLeftRadius:0,borderBottomLeftRadius:0}}>
                    <Text>{this.lang.t('voice_record')}</Text>
                </View>

            </View>)
        }
        return (<View>{views}</View>)
    }

    togglePlayVoice(item, index)  {

        if (this.playerList !== null && this.playerListIndex !== index) {

            try{
                this.playerList.stop();
            } catch (e) {}
        }

        if (this.playerList === null || this.playerListIndex !== index) {
            this.playerList = new MusicPlayerService(false, {});

            this.playerList.addEventListener(Events.Play, track => this.event(Events.Play, track, index));
            this.playerList.addEventListener(Events.Pause, track => this.event(Events.Pause, track, index));
            this.playerList.addEventListener(Events.Next, track => this.event(Events.Next, track, index));
            this.playerList.addEventListener(Events.Stop, track => this.event(Events.Stop, track, index));
            this.playerList.addEventListener(Events.EndReached, track => this.event(Events.EndReached, track, index));
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
            this.playerList.setQueue(tracks);
        }
        this.playerListIndex = index;



        if (item.voicePlaying) {
            this.playerList.togglePlayPause();
            this.updateState(update(this.state, {
                itemLists : {[index] : {voicePlaying : {$set : false}}}
            }));
        } else {
            this.playerList.togglePlayPause();
            this.updateState(update(this.state, {
                itemLists : {[index] : {voicePlaying : {$set : true}}}
            }));
        }
    }

    event(event, tract, index) {
        if (event === Events.Play) {
            this.updateState(update(this.state, {
                itemLists : {[index] : {voicePlaying : {$set : true}}}
            }));
        }

        if (event === Events.Pause) {
            this.updateState(update(this.state, {
                itemLists : {[index] : {voicePlaying : {$set : false}}}
            }));
        }

        if (event === Events.Stop || event === Events.EndReached) {
            let dIndex = this.playerListIndex;
            setTimeout(() => {
                this.updateState(update(this.state, {
                    itemLists : {[dIndex] : {voicePlaying : {$set : false}}}
                }));
            }, 300);
        }
    }


}


var bghtmlstyles = StyleSheet.create({
    defaultStyle: {

        color: 'black',
        fontSize: 15

    },
    defaultStyle2: {

        color: 'white',
        fontSize: 15

    }
});
export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(Chat)