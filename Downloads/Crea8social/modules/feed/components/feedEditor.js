import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {connect} from "react-redux";
import {
    Text,
    ScrollView,
    Dimensions,
    StyleSheet,View,Image,TouchableOpacity,ImageBackground,TouchableWithoutFeedback,PermissionsAndroid,Platform,Keyboard
} from 'react-native';
import {
    Header,
    Container,
    Left,
    Right,
    Icon,
    Button,
    Body,
    List,
    ListItem,
    Thumbnail,Picker,Title,Item,Input,Textarea,CheckBox,Toast,Tabs,Tab
} from 'native-base';
import {Menu,MenuTrigger,MenuOptions,renderers,MenuProvider} from 'react-native-popup-menu';
import { MaterialDialog } from 'react-native-material-dialog';
import material from "../../../native-base-theme/variables/material";
import ImagePicker from 'react-native-image-crop-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import Util from "../../../utils/Util";
import {fetchLinkPreview, postFeed} from "../store";
import Api from "../../../api";
import GridView from 'react-native-super-grid';
import FastImage from 'react-native-fast-image';
import {AudioRecorder, AudioUtils} from 'react-native-audio';

let obj = null;
class FeedEditor extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            background : 0,
            text : "",
            privacy : '1',
            location: '',
            feeling_type : '',
            feeling_text: '',
            showEmoticon : false,

            menuOpened : false,
            showLocationDialog: false,

            //polls
            showPollOptions : false,
            pollMultiple : false,
            option1  : '',
            option2 : '',
            option3 : '',

            //tags
            tags : '',
            tagUsers: [],

            //images
            images : [],

            video : null,

            linkDetails : null,

            posting : false,

            emoticons : [],
            stickers : [],

            recording : false,
            record : null,
            showRecordDialog : false,
            gif : null
        };

        obj = this;
    }


    onPrivacyValueChange(value: string) {
        this.setState({
            privacy: value
        });
    }

    submitPost() {
        if (this.state.text === '' && this.state.feeling_text===''
            && this.state.images.length < 1
            && this.state.video === null && this.state.record === null && this.state.gif === null) {

        } else {
            this.updateState({
                posting : true
            });


            postFeed({
                data : this.state,
                userid : this.props.userid,
                type : this.props.navigation.getParam("type"),
                typeId : this.props.navigation.getParam("typeId"),
                entityId : this.props.navigation.getParam("entityId"),
                entityType : this.props.navigation.getParam("entityType"),
                toUserid : this.props.navigation.getParam("toUserid")
            }).then((res) => {


                this.updateState({
                    posting : false
                });
                if (res.status === 1) {
                    this.props.navigation.getParam("component").finishedPosting(res.feed);
                    this.props.navigation.goBack();
                } else {
                    Toast.show({
                        text : res.message,
                        type : 'danger'
                    });
                }
            }).catch((e) => {
                console.log(e);
                this.updateState({
                    posting : false
                });
                Toast.show({
                    text : this.lang.t('post_feed_error'),
                    type : 'danger'
                });
            })
        }


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

        return (
            <MenuProvider>
                <Container style={{backgroundColor: 'white'}}>
                    <Spinner visible={this.state.posting}  textStyle={{color: '#FFF'}} />
                    <Header noShadow hasTabs style={{elevation: 0}}>
                        <Left>
                            <Button onPress={() => {
                                this.props.navigation.goBack();
                            }} transparent>
                                <Icon name="ios-arrow-round-back" style={{color:'white',fontSize:25}}/>
                            </Button>
                        </Left>
                        <Body>
                        <Text style={{color:'white', fontSize: 15,left:-20}}>CREATE NEW POST</Text>
                        </Body>
                        <Right>
                            <Button transparent onPress={() => {
                                this.submitPost();
                            }}>
                                <Icon style={{fontSize:30}} name="ios-send"/>
                            </Button>
                        </Right>
                    </Header>

                    <View style={{flex:1, paddingBottom:100}}>
                        <ScrollView style={{paddingBottom: 60}}>
                            <List style={{backgroundColor: 'white', paddingTop: 0, paddingBottom: 0}}>
                                <ListItem avatar style={{borderWidth: 0}}>
                                    <Left>
                                        <Thumbnail  source={{ uri: this.props.avatar }} />
                                    </Left>
                                    <Body style={{borderWidth: 0,borderColor:'#F5F4F5'}}>
                                    <Text style={{fontWeight:'bold'}}>
                                        {this.props.username}

                                        {this.state.feeling_type !== '' ? (
                                            <Text style={{fontWeight: 'normal',left: 10}}>
                                                <Icon name="md-happy" style={{fontSize:15, paddingLeft:10,paddingRight: 10}}/>
                                                {this.lang.t(this.state.feeling_type.replace("-", "_"))}
                                                <Text style={{fontWeight: 'bold',marginLeft: 5}}>{this.state.feeling_text}</Text>
                                            </Text>
                                        ) : null}
                                    </Text>
                                    <Picker
                                        renderHeader={backAction =>
                                            <Header noShadow hasTabs style={{ backgroundColor: "#E9E7E9" }}>
                                                <Left>
                                                    <Button transparent onPress={backAction}>
                                                        <Icon name="ios-arrow-round-back" style={{ color: "grey" }} />
                                                    </Button>
                                                </Left>
                                                <Body style={{ flex: 3 }}>
                                                <Title style={{color: 'grey'}}>Choose privacy</Title>
                                                </Body>
                                                <Right />
                                            </Header>}
                                        note
                                        iosIcon={<Icon name="ios-arrow-down-outline" style={{color:'grey', bottom:4}} />}
                                        mode="dropdown"
                                        style={{ width: 120,borderColor:'lightgrey',borderWidth: 0.7,padding:0,height:35,borderRadius:5 }}
                                        selectedValue={this.state.privacy}
                                        onValueChange={this.onPrivacyValueChange.bind(this)}
                                    >
                                        <Picker.Item label={this.lang.t('public')} value="1" />
                                        <Picker.Item label={this.lang.t('friends_only')} value="2" />
                                        <Picker.Item label={this.lang.t('only_me')} value="3" />
                                    </Picker>
                                    </Body>
                                </ListItem>
                            </List>


                            {this.state.background !== 0 ? (
                                <ImageBackground
                                    imageStyle={{resizeMode: 'cover'}}
                                    style={{width: '100%',minHeight: 250,flex: 1,
                                        alignItems: 'center',flexDirection:'row'}}
                                    source={this.getBackgroundImage(this.state.background)}>
                            <Textarea rowSpan={7} onChangeText={(text) => {
                                this.doLinkPreview(text);
                                this.updateState({text: text})
                            }}
                                      onFocus={() => {
                                          this.updateState({showEmoticon:false});
                                      }}
                                      placeholder={this.state.showPollOptions ? this.lang.t('ask_your_question') : this.lang.t('whats_your_mind')}
                                      value={this.state.text}
                                      style={{fontSize: 25,color:'white',flex: 1,alignSelf:'center',textAlign:'center'}} placeholderTextColor="#fff" />
                                </ImageBackground>
                            ) : (
                                <Textarea rowSpan={5}
                                          onChangeText={(text) => {
                                              this.doLinkPreview(text);
                                              this.updateState({text: text})
                                          }}
                                          onFocus={() => {
                                              this.updateState({showEmoticon:false});
                                          }}
                                          placeholder={this.state.showPollOptions ? this.lang.t('ask_your_question') : this.lang.t('whats_your_mind')}
                                          value={this.state.text}  style={{fontSize: 20}} />
                            )}

                            {this.state.tagUsers.length > 0 ? (
                                <View style={{flexDirection: 'row',margin: 10}}>
                                    <View style={{flex:1}}>
                                        <Text>
                                            <Text style={{color: material.brandPrimary}}>{this.lang.t('with')} -</Text>
                                            {this.displayTags()}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => {
                                        this.updateState({
                                            tags : '',
                                            tagUsers: []
                                        })
                                    }}>
                                        <Icon  style={{color:'grey',fontSize:15}} name="close" type="SimpleLineIcons"/>
                                    </TouchableOpacity>
                                </View>
                            ) : null}

                            {this.state.linkDetails !== null ? (
                                <View style={{margin:10,backgroundColor: '#F6F6F6', padding:10, flexDirection: 'row',borderRadius: 10}}>
                                    {this.state.linkDetails.image !== '' ? (
                                        <Image source={{uri : this.state.linkDetails.image}}/>
                                    ) : null}
                                    <View style={{flex:1,flexDirection: 'column',marginLeft: 10}}>
                                        <TouchableOpacity style={{position:'absolute', right: 10, top: 5}} onPress={() => {
                                            this.props.dispatch({type : "CLEAR_LINK_PREVIEW"});
                                            //this.updateState({linkDetails: null})
                                        }}>
                                            <Icon style={{color:'grey',fontSize:15,fontWeight: 'bold'}} name="close" type="SimpleLineIcons"/>
                                        </TouchableOpacity>
                                        <Text style={{fontWeight: 'bold'}}>{this.state.linkDetails.title}</Text>
                                        <Text style={{fontSize:10,color:'grey',marginTop: 10}}>{this.state.linkDetails.description}</Text>
                                    </View>
                                </View>
                            ) : null }

                            {this.state.images.length > 0 ? (
                                <View style={{margin:10,backgroundColor: '#F6F6F6', padding:10, flexDirection: 'row',borderRadius: 10}}>
                                    <Text style={{flex: 1}}> {this.state.images.length} {this.lang.t('images_selected')}</Text>
                                    <TouchableOpacity onPress={() => this.updateState({images: []})}>
                                        <Icon style={{color:'grey',fontSize:15,fontWeight: 'bold'}} name="close" type="SimpleLineIcons"/>
                                    </TouchableOpacity>
                                </View>
                            ) : null}

                            {this.state.video !== null ? (
                                <View style={{margin:10,backgroundColor: '#F6F6F6', padding:10, flexDirection: 'row',borderRadius: 10}}>
                                    <Text style={{flex: 1,alignContent:'center'}}> 1 {this.lang.t('video_selected')}</Text>
                                    <TouchableOpacity onPress={() => this.updateState({video: null})}>
                                        <Icon style={{color:'grey',fontSize:15,fontWeight: 'bold'}} name="close" type="SimpleLineIcons"/>
                                    </TouchableOpacity>
                                </View>
                            ) : null}

                            {this.state.record !== null ? (
                                <View style={{margin:10,backgroundColor: '#F6F6F6', padding:10, flexDirection: 'row',borderRadius: 10}}>
                                    <Text style={{flex: 1,alignContent:'center'}}>  {this.lang.t('voice_recorded')}</Text>
                                    <TouchableOpacity onPress={() => this.updateState({record: null,recording: false})}>
                                        <Icon style={{color:'grey',fontSize:15,fontWeight: 'bold'}} name="close" type="SimpleLineIcons"/>
                                    </TouchableOpacity>
                                </View>
                            ) : null}

                            {this.state.gif !== null ? (
                                <View style={{margin:10,backgroundColor: '#F6F6F6', padding:10, flexDirection: 'row',borderRadius: 10}}>
                                    <Text style={{flex: 1,alignContent:'center'}}>  {this.lang.t('gif_selected')}</Text>
                                    <TouchableOpacity onPress={() => this.updateState({gif: null})}>
                                        <Icon style={{color:'grey',fontSize:15,fontWeight: 'bold'}} name="close" type="SimpleLineIcons"/>
                                    </TouchableOpacity>
                                </View>
                            ) : null}


                            {this.state.showPollOptions ? (
                                <View style={{padding:10}}>
                                    <Item style={{marginBottom: 10}}>
                                        <Left>
                                            <Text style={{fontSize:16,color:'grey'}}>{this.lang.t('options').toUpperCase()}</Text>
                                        </Left>
                                        <Right>
                                            <TouchableOpacity onPress={() => this.updateState({showPollOptions: false})}>
                                                <Icon style={{color:'grey'}} name="close" type="SimpleLineIcons"/>
                                            </TouchableOpacity>
                                        </Right>
                                    </Item>

                                    <Item style={{marginBottom: 5}} regular>
                                        <Input onChangeText={(text) => this.updateState({option1 : text})} placeholder={this.lang.t('option_1')} />
                                    </Item>

                                    <Item style={{marginBottom: 5}} regular>
                                        <Input onChangeText={(text) => this.updateState({option2 : text})} placeholder={this.lang.t('option_2')} />
                                    </Item>

                                    <Item style={{marginBottom: 5}} regular>
                                        <Input onChangeText={(text) => this.updateState({option3 : text})} placeholder={this.lang.t('option_3')} />
                                    </Item>

                                    <ListItem>
                                        <CheckBox onPress={(w) => this.updateState({pollMultiple: !this.state.pollMultiple})} checked={this.state.pollMultiple} />
                                        <Body>
                                        <Text>{this.lang.t('enable_multiple_selection')}</Text>
                                        </Body>
                                    </ListItem>
                                </View>
                            ) : null}

                        </ScrollView>
                    </View>

                    <View style={{position:'absolute',bottom:0,flex:1,width:'100%',backgroundColor: 'white'}}>
                        <View style={{flexDirection: 'row',padding:5}}>
                            <Image source={require("../../../assets/images/color.png")} style={{width:30,height:30,borderRadius:15}}/>
                            <View style={{flex:1}}>
                                <ScrollView horizontal={true} style={{flexDirection: 'row',flex:1}} showsHorizontalScrollIndicator={false}>
                                    <Button onPress={() => {this.setBackground(0)}} style={{width:30,height:30,borderRadius:5,marginLeft:5,backgroundColor:'#AFAFAF'}}/>
                                    <TouchableOpacity onPress={() => {this.setBackground(2)}} >
                                        <Image source={require("../images/img-2.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.setBackground(4)}} >
                                        <Image source={require("../images/img-4.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.setBackground(5)}} >
                                        <Image source={require("../images/img-5.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.setBackground(6)}} >
                                        <Image source={require("../images/img-6.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.setBackground(7)}} >
                                        <Image source={require("../images/img-7.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.setBackground(8)}} >
                                        <Image source={require("../images/img-8.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.setBackground(9)}} >
                                        <Image source={require("../images/img-9.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.setBackground(10)}} >
                                        <Image source={require("../images/img-10.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.setBackground(11)}} >
                                        <Image source={require("../images/img-11.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.setBackground(12)}} >
                                        <Image source={require("../images/img-12.png")} style={{width:30,height:30,borderRadius:5,marginLeft:5}}/>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </View>
                        <View style={{borderTopWidth:0.6,borderTopColor: '#E9E7E9',padding:10}}>
                            <Item onPress={()=> {
                                Keyboard.dismiss();
                                this.menu.open();
                            }} style={{borderColor:'white'}}>
                                <Left>
                                    <Text style={{fontWeight: 'bold',marginLeft: 0}}>See more options</Text>

                                </Left>
                                <Right style={{flexDirection:'row', justifyContent: 'flex-end'}}>
                                    <Icon name="ios-camera-outline" style={{color: '#2196F3', marginLeft:8}}/>
                                    <Icon name="ios-images-outline" style={{color: '#F44336', marginLeft:8}}/>
                                    <Icon name="ios-happy-outline" style={{color: '#8BC34A', marginLeft:8}}/>
                                    <Icon name="md-person-add" style={{color: '#8BC34A', marginLeft:8}}/>
                                </Right>
                            </Item>

                        </View>


                    </View>

                    {this.state.showEmoticon ? (
                        <View style={{position:'absolute',bottom:0,flex:1,width:'100%',
                            backgroundColor: 'white',borderTopColor:'#FAFAFF',borderTopWidth:0.6,height:250}}>
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
                                                <FastImage resizeMode="contain" style={{width:25,height:25,margin:5}} source={{uri : item.image}}/>
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
                                                <FastImage resizeMode="contain" style={{width:40,height:40,margin:5}} source={{uri : item.image}}/>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </Tab>
                            </Tabs>
                        </View>
                    ) : null}
                    <MaterialDialog
                        title={this.lang.t('checkin')}
                        visible={this.state.showLocationDialog}
                        onOk={() => this.updateState({ showLocationDialog: false })}
                        onCancel={() => this.updateState({showLocationDialog: false })}>
                        <Item rounded>
                            <Input placeholder={this.lang.t('where_are_you')}
                                   value={this.state.location}
                                   onChangeText={(txt) => this.updateState({location: txt})}/>
                        </Item>
                    </MaterialDialog>

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

                    <Menu ref={(c) => this.menu = c} renderer={renderers.SlideInMenu}>
                        <MenuTrigger>

                        </MenuTrigger>
                        <MenuOptions>
                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                ImagePicker.openPicker({
                                    multiple: true
                                }).then(images => {
                                    console.log(images);
                                    if (images.length > 5) {
                                        //alert too much files at a time
                                        Toast.show({
                                            text : this.lang.t('only_5_images_at_a_time'),
                                            type : 'danger'
                                        })
                                    } else {
                                        this.updateState({
                                            images: images
                                        });
                                    }
                                });
                            }}>
                                <Left><Icon active name="ios-image-outline" style={{color:'#2196F3'}} /></Left>
                                <Body><Text>{this.lang.t('add_photos')}</Text></Body>
                            </ListItem>

                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                ImagePicker.openPicker({
                                    mediaType: 'video'
                                }).then(video => {
                                    this.updateState({
                                        video: video
                                    })
                                });
                            }}>
                                <Left><Icon active name="ios-videocam-outline" style={{color:'#8BC34A'}} /></Left>
                                <Body><Text>{this.lang.t('upload_a_video')}</Text></Body>
                            </ListItem>

                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                if (this.state.emoticons.length < 1) this.loadEmoticons();
                                this.updateState({showEmoticon: true})
                            }}>
                                <Left><Icon active name="ios-happy" style={{color:'#B5408C'}} /></Left>
                                <Body><Text>{this.lang.t('emoticon')}</Text></Body>
                            </ListItem>

                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                this.updateState({showRecordDialog: true})
                            }}>
                                <Left><Icon active name="md-microphone" style={{color:'red'}} /></Left>
                                <Body><Text>{this.lang.t('record_voice')}</Text></Body>
                            </ListItem>

                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                this.props.navigation.navigate("gif", {
                                    component : this
                                });
                            }}>
                                <Left>
                                    <View style={{borderColor:'brown',borderWidth:.5,padding:3,borderRadius:5}}><Text style={{color:'brown',fontSize:10}}>GIF</Text></View>
                                </Left>
                                <Body><Text>{this.lang.t('gif')}</Text></Body>
                            </ListItem>

                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                this.updateState({showLocationDialog: true})
                            }}>
                                <Left><Icon active name="ios-locate-outline" style={{color:'#673AB7'}} /></Left>
                                <Body><Text>{this.lang.t('checkin')}</Text></Body>
                            </ListItem>

                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                this.updateState({
                                    showPollOptions : true
                                });
                            }}>
                                <Left><Icon active name="ios-list" style={{color:'#FFEB3B'}} /></Left>
                                <Body><Text>{this.lang.t('create_poll')}</Text></Body>
                            </ListItem>

                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                this.props.navigation.navigate("selectFeelings", {
                                    obj : this
                                });
                            }}>
                                <Left><Icon active name="md-happy" style={{color:'#FF9800'}} /></Left>
                                <Body><Text>{this.lang.t('feelings')}</Text></Body>
                            </ListItem>

                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                this.props.navigation.navigate("selectFriends", {
                                    obj : this
                                });
                            }}>
                                <Left><Icon active name="md-person-add" style={{color:'#F44336'}} /></Left>
                                <Body><Text>{this.lang.t('tag_a_friend')}</Text></Body>
                            </ListItem>
                        </MenuOptions>
                    </Menu>

                </Container>
            </MenuProvider>
        )
    }

    receiveGif(item) {
        this.updateState({gif : item});
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
                obj.updateState({record: Platform.OS === 'android' ? 'file://' + filePath : filePath});
            } else {
                AudioRecorder.onFinished = (data) => {
                    // Android callback comes in the form of a promise instead.
                    if (Platform.OS === 'ios') {
                        this.updateState({record: data.audioFileURL});
                    }
                };
            }

        } else {
            AudioRecorder.prepareRecordingAtPath(AudioUtils.DocumentDirectoryPath + '/test.aac', {
                SampleRate: 22050,
                Channels: 1,
                AudioQuality: "Low",
                AudioEncoding: "aac",
                AudioEncodingBitRate: 32000
            });
            await AudioRecorder.startRecording();
            this.updateState({recording: true});
        }
    }
    doLinkPreview(text) {
        if (this.state.linkDetails !== null) return false;
        let link = Util.getLinkFromText(text);

        if (link ) {
            fetchLinkPreview(link).then((res) => {
                if(res.status === 1) {
                    this.updateState({linkDetails : res});
                }
            });
        }
    }

    receiveUsers(users) {
        if (users.length > 0) {
            let u = '';
            for(let i = 0;i<users.length;i++) {
                u += ','+users[i].userid;
            }
            this.updateState({
                tagUsers : users,
                tags : u
            });
        }
    }

    displayTags() {
        let views = [];
        for(let i = 0;i<this.state.tagUsers.length;i++) {
            views.push(<Text style={{textStyle: 'italic',color:'grey'}}>, {this.state.tagUsers[i].first_name} {this.state.tagUsers[i].last_name} </Text>)
        }

        return (<Text>{views}</Text>);
    }

    setBackground(type) {
        this.updateState({
            background : type
        });
    }

    getBackgroundImage(number) {
        switch(number) {
            case 8:
                return require('../images/img-8.png');
                break;
            case 10:
                return require('../images/img-10.png');
                break;
            case 2:
                return require('../images/img-2.png');
                break;
            case 4:
                return require('../images/img-4.png');
                break;
            case 5:
                return require('../images/img-5.png');
                break;
            case 6:
                return require('../images/img-6.png');
                break;
            case 7:
                return require('../images/img-7.png');
                break;
            case 8:
                return require('../images/img-8.png');
                break;
            case 9:
                return require('../images/img-9.png');
                break;
            case 11:
                return require('../images/img-11.png');
                break;
            case 12:
                return require('../images/img-12.png');
                break;

        }
    }
}



export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        feedPosted: state.feed.feedPosted,
        feedPostError : state.feed.feedPostError,
        feedLinkPreview : state.feed.feedLinkPreview
    }
})(FeedEditor)