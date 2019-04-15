import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {connect} from "react-redux";
import {
    Text,
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    TouchableWithoutFeedback,
    PermissionsAndroid,Keyboard
} from 'react-native';
import {
    Container,
    Header,
    Icon,
    Input, Button, Item,Tabs,Tab
} from 'native-base';
import EmptyComponent from "../../../utils/EmptyComponent";
import FastImage from 'react-native-fast-image'
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../../../api";
import material from "../../../native-base-theme/variables/material";
import HTMLView from 'react-native-htmlview'
import Util from "../../../utils/Util";
import ImagePicker from 'react-native-image-crop-picker';
import time from "../../../utils/Time";
import {doLike} from "../store";
import update from 'immutability-helper';
import GridView from 'react-native-super-grid';
import {Events, Track} from "react-native-music-player-service";
import MusicPlayerService from "react-native-music-player-service";
import { MaterialDialog } from 'react-native-material-dialog';
import {AudioRecorder, AudioUtils} from "react-native-audio";

class Comment extends BaseComponent {
    offset = 0;
    limit = 20;
    constructor(props) {
        super(props);
        this.state.processing = false;
        this.state.showEmoticon = false;
        this.state.emoticons = [];
        this.state.stickers = [];
        this.state.text = '';
        this.state.gif = null;
        this.state.record = null;
        this.state.recording = false;
        this.state.showRecordDialog = false;
        this.state.image = null;
        this.type = this.props.navigation.getParam("type");
        this.typeId = this.props.navigation.getParam("typeId");
        this.entityType = this.props.navigation.getParam("entityType", "user");
        this.entityTypeId = this.props.navigation.getParam("entityTypeId", this.props.userid);
        this.renderType = this.props.navigation.getParam("render", 'comment');
        this.ownerIndex = this.props.navigation.getParam("index", null);
        this.ownerComponent = this.props.navigation.getParam("component");
        this.fetchComments(false);

        this.playerList = null;
        this.playerListIndex = null;
    }

    fetchComments(type) {
        let pageOffset = this.offset;
        this.offset = pageOffset + this.limit;

        Api.get("comment/load", {
            offset : pageOffset,
            userid : this.props.userid,
            limit : this.limit,
            type : this.type,
            type_id : this.typeId
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
        }).catch((e) => {
            //console.log(e)
        })
    }

    handlerCommentRefresh() {
        this.offset = 0;
        this.fetchComments(false);
    }

    componentDidMount() {
        this.loadEmoticons();
    }

    loadEmoticons() {
        Api.get("get/emoticons", {
            userid : this.props.userid
        }).then((res) => {
            this.updateState({emoticons : res.emoticons, stickers : res.stickers})
        });
    }

    render() {
        //console.log(this.props.photos);
        return (
            <Container style={{backgroundColor:'white'}}>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
                <Header hasTabs noShadow style={{backgroundColor:'white',borderBottomColor:'#CCCCCC',borderBottomWidth:0.7,height:50,padding:0}}>
                    <View style={{flexDirection:'row',width:'100%'}}>
                        <Button style={{bottom: 5,left:-10}} transparent onPress={() => {
                            this.props.navigation.goBack()
                        }}>
                            <Icon name="ios-arrow-round-back" style={{color:'black'}}/>
                        </Button>
                        <Text style={{color:material.brandPrimary,fontWeight: 'bold',left:-12, marginTop: (Platform.OS === 'android') ? 10 : 0}}>{this.lang.t((this.renderType === 'comment') ? 'comments' : 'replies')}</Text>

                    </View>

                </Header>

                <View style={{flexDirection:'column',flex:1}}>
                    <FlatList
                        itemDimension={130}
                        style={{flex: 1}}
                        data={this.state.itemLists}
                        onEndReachedThreshold={.5}
                        onEndReached={(d) => {
                            //this.fetchRequests();
                            if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                                this.fetchComments(true);
                            }
                            return true;
                        }}
                        ref="flatList"
                        onContentSizeChange={() => {
                            if (this.state.itemLists.length > 0) {
                                this.refs.flatList.scrollToEnd()
                            }
                        }}
                        onLayout={() => {
                            if (this.state.itemLists.length > 0) {
                                this.refs.flatList.scrollToEnd()
                            }
                        }}
                        extraData={this.state}
                        refreshing={this.state.refreshing}
                        onRefresh={() => {
                            this.handlerCommentRefresh();
                        }}
                        keyExtractor={(item, index) => item.id}
                        ListEmptyComponent={!this.state.fetchFinished ? (<Text/>) : (
                            <EmptyComponent text={this.lang.t('no_comments_found')} iconType="Ionicons" icon="ios-chatbubbles-outline"/>
                        )}
                        ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                            {(!this.state.fetchFinished) ? (
                                <ActivityIndicator size='large' />
                            ) : null}

                        </View>}
                        renderItem={({ item ,index}) => (
                            <View style={{flexDirection: 'row', margin: 10,borderBottomColor:'#F4F4F4',borderBottomWidth:.4,paddingBottom:5}}>
                                <TouchableOpacity onPress={() => {
                                    this.openProfile(item);
                                }}>
                                    <FastImage style={{width:40,height:40,borderRadius:20,marginTop:5}} small source={{uri: item.avatar}} />
                                </TouchableOpacity>
                                <View style={{flexDirection: 'column', flex: 1, marginLeft: 10}}>
                                    <View style={{backgroundColor:'#F5F5F5',padding:5,borderRadius:20,paddingLeft:10}}>
                                        <TouchableOpacity onPress={() => {
                                            this.openProfile(item);
                                        }}>
                                            <Text style={{fontWeight: 'bold',color: 'black',marginBottom: 5}}>{item.name} -
                                                <Text style={{color:'grey',fontWeight:'normal'}}>
                                                    {time.ago(item.time_ago)}

                                                    </Text></Text>
                                        </TouchableOpacity>
                                        <HTMLView renderNode={renderNode} style={{flex:1,color: 'grey',flexDirection: 'row', flexWrap: 'wrap'}} textComponentProps={{ style: bghtmlstyles.defaultStyle }}
                                                  value={item.text} />

                                        {item.image ? (
                                            <TouchableOpacity onPress={() => {
                                                let images = [];
                                                images.push(item.image);
                                                this.props.navigation.push("photoViewer", {
                                                    photos : images,
                                                    selected : item.image
                                                });
                                            }}>
                                                <FastImage resizeMode="contain" source={{uri : item.image}} style={{width:'100%',height:250}}/>
                                            </TouchableOpacity>
                                        ) : null}

                                        {this.displayOthersContent(item,index)}
                                    </View>
                                    <View style={{flexDirection: 'row',marginTop:3}}>
                                       <View style={{flex:1,flexDirection: 'row'}}>
                                           <TouchableOpacity onPress={() => {
                                               this.like(item,index);
                                           }}>
                                               {!item.has_like ? (
                                                   <Text style={{color:'grey',fontWeight:'bold'}}>{this.lang.t('like')}</Text>
                                               ) : (
                                                   <Text style={{color:material.brandPrimary,fontWeight:'bold'}}>{this.lang.t('unlike')}</Text>
                                               )}
                                           </TouchableOpacity>
                                           <TouchableOpacity onPress={() => {
                                               this.props.navigation.push("comments", {
                                                   type : 'comment',
                                                   typeId : item.id,
                                                   entityType : this.entityType,
                                                   entityTypeId : this.entityTypeId,
                                                   render : 'reply'
                                               });
                                           }}>
                                               <Text style={{color:'grey',marginLeft:10,fontWeight:'bold'}}>{this.lang.t('reply')}</Text>
                                           </TouchableOpacity>

                                           {item.can_edit ? (
                                               <TouchableOpacity onPress={() => {
                                                   this.delete(item,index);
                                               }}>
                                                   <Text style={{color:'grey',marginLeft:10,fontWeight:'bold'}}>{this.lang.t('delete')}</Text>
                                               </TouchableOpacity>
                                           ) : null}
                                       </View>
                                        {item.like_count > 0 || item.replies > 0 ? (
                                            <View  style={{flexDirection:'row'}}>
                                                {item.like_count > 0 ? (
                                                    <View style={{flexDirection:'row'}}>
                                                        <Icon style={{fontSize:12}} name="md-thumbs-up"/>
                                                        <Text style={{marginLeft:10,fontWeight:'bold',color:'black'}}>{item.like_count}</Text>
                                                    </View>
                                                ) : null}

                                                {item.replies > 0 ? (
                                                    <TouchableOpacity onPress={() => {
                                                        this.props.navigation.push("comments", {
                                                            type : 'comment',
                                                            typeId : item.id,
                                                            entityType : this.entityType,
                                                            entityTypeId : this.entityTypeId,
                                                            render : 'reply'
                                                        });
                                                    }} style={{flexDirection:'row',marginLeft:5}}>
                                                        <Icon style={{fontSize:12}} name="ios-undo-outline"/>
                                                        <Text style={{marginLeft:10,fontWeight:'bold',color:'black'}}>{item.replies}</Text>
                                                    </TouchableOpacity>
                                                ) : null}
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            </View>
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
                        <View style={{flexDirection: 'row', marginBottom: 0,padding:10}}>
                            <View style={{flexDirection: 'column', flex: 1}}>
                                <View  style={{
                                    backgroundColor: '#F2F3F5',
                                    height:40,width:'100%',borderRadius:20,padding:5,flexDirection:'row'}}>
                                    <Input style={{flex:1}} onChangeText={(text) => {
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
                                    }} style={{top:10,left:10}}>
                                        <Icon name="camera" style={{color:'lightgrey',position:'relative',fontSize:20,width:30}} type="SimpleLineIcons"/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        //select image
                                        this.updateState({showRecordDialog: true})
                                    }} style={{top:10,left:10}}>
                                        <Icon name="md-microphone" style={{position:'relative',fontSize:20,width:30,color:'blue'}} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        //select image
                                        this.props.navigation.navigate("gif", {
                                            component : this
                                        });
                                    }} style={{top:10}}>
                                        <View style={{borderColor:'brown',borderWidth:.5,padding:3,borderRadius:5,width:25,marginRight:5}}><Text style={{color:'brown',fontSize:10}}>GIF</Text></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        //select image
                                        if (this.state.emoticons.length < 1) this.loadEmoticons();
                                        Keyboard.dismiss();
                                        this.updateState({showEmoticon: true});
                                    }} style={{top:10}}>
                                        <Icon name="emotsmile" style={{color:'lightgrey',position:'relative',fontSize:20,width:30}} type="SimpleLineIcons"/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Button primary rounded style={{marginLeft:5}} onPress={() => {
                                this.submitComment();
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
                </View>


            </Container>
        );
    }

    receiveGif(item) {
        this.updateState({gif : item});
        setTimeout(() => {
            this.submitComment();
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
                    this.submitComment();
                }, 300);
            } else {
                AudioRecorder.onFinished = (data) => {
                    // Android callback comes in the form of a promise instead.
                    if (Platform.OS === 'ios') {
                        this.updateState({record: data.audioFileURL});
                        setTimeout(() => {
                            this.submitComment();
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

    like(item,index) {
        this.updateState(update(this.state, {
            itemLists : {[index] : {has_like : {$set : (!item.has_like)}}}
        }));
        doLike({
          userid : this.props.userid,
          type : 'comment',
          typeId : item.id
        }).then((res) => {
            let likes = res.likes;
            this.updateState(update(this.state, {
                itemLists : {[index] : {like_count : {$set : likes}}}
            }));
        });
    }

    delete(item,index) {
        let lists = Util.removeIndexFromArray(index, this.state.itemLists);
        this.updateState({itemLists : lists});
        Api.get("comment/remove" ,{
            userid : this.props.userid,
            id : item.id
        });
    }

    submitComment() {

        if (this.state.text === '' && this.state.image === null && this.state.record === null && this.state.gif === null)  return false;
        this.updateState({processing : true});
        let formData = new FormData();
        formData.append("text", this.state.text);
        formData.append("userid", this.props.userid);
        formData.append("type", this.type);
        formData.append("type_id", this.typeId);
        formData.append("entity_type", this.entityType);
        formData.append("entity_id", this.entityTypeId);

        if (this.state.image !== null) {
            formData.append("image", {
                uri: this.state.image.path,
                type: this.state.image.mime, // or photo.type
                name: this.state.image.path
            })
        }

        if (this.state.gif !== null) {
            formData.append("gif", this.state.gif);
        }

        if (this.state.record !== null) {
            formData.append('voice', {
                uri: this.state.record,
                type: 'audio/aac', // or photo.type
                name: this.state.record
            });
        }
        Api.post("comment/add",formData).then((res) => {
            let lists = [];

            lists.push(...this.state.itemLists);
            lists.push(res);
            this.updateState({
                text : '',
                image : null,
                gif : null,
                record : null,
                itemLists : lists,
                processing : false
            });
            if (this.ownerIndex !== null) {
                this.ownerComponent.commentAdded(res.comment_count, this.ownerIndex, res);
            }
        }).catch((e) => {
            this.updateState({processing: false});
            console.log(e);
        })
    }

    openProfile(item) {
        if (item.entity_type === 'user') {
            this.props.navigation.push("profile", {id : item.entity_id});
        }
    }

    displayOthersContent(item,index) {
        let views = [];
        if (item.gif !== '') {
            views.push(<TouchableWithoutFeedback onPress={() => {
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
                backgroundColor: '#F7F7F7',
                borderRadius:20, padding:10}}>
                <View style={{
                    marginLeft:10,

                    width:40,height:40,borderRadius:20}}>
                    <Icon name="md-skip-backward" style={{color:'#EBEBEB',fontSize:20,margin:0,left:10,top:10}}/>
                </View>
                <TouchableOpacity onPress={() => this.togglePlayVoice(item,index)} style={{flex:1}}>
                    <View style={{
                        marginLeft:10,
                        backgroundColor: material.brandPrimary,
                        width:40,height:40,borderRadius:20,alignSelf:'center'}}>
                        <Icon name={item.voicePlaying ? "md-pause" : "md-play"} style={{color:'white',fontSize:20,margin:0,left:15,top:10}}/>
                    </View>
                </TouchableOpacity>
                <View style={{

                    marginLeft:10,

                    width:40,height:40,borderRadius:20}}>
                    <Icon name="md-skip-forward" style={{color:'#EBEBEB',fontSize:20,margin:0,left:10,top:10}}/>
                </View>

            </View>)
        }
        return (<View>{views}</View>)
    }

    togglePlayVoice(item, index)  {

        if (this.playerList !== null && this.playerListIndex !== index) {

            this.playerList.stop();
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
        fontSize: 13

    }
});

function renderNode(node, index, siblings, parent, defaultRenderer) {
    if (node.name === 'img') {
        return (<Image source={{ uri: node.attribs.src }} style={{width:30,height:30}}/>);
    }
}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
    }
})(Comment)