import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";
import {Text,View,FlatList,Image,TouchableOpacity,ScrollView,Platform} from 'react-native';
import {
    CardItem,
    Thumbnail,
    Item,
    Input,
    Icon,
    Button,
    Badge,
    Left,
    Right
} from 'native-base';
import time from "../../utils/Time";
import {
    AdMobBanner,
    AdMobInterstitial,
    PublisherBanner,
    AdMobRewarded,
} from 'react-native-admob'
import {ADMOB_ID} from "../../api";
import FastImage from 'react-native-fast-image'
import assets from "../../assets/assets";

class FeedHeader extends BaseComponent {
    constructor(props) {
        super(props);
        this.filters = [
            {name : 'All', id: 'all', active : true},
            {name : 'Photos', id: 'photo', active: false},
            {name : 'Videos', id: 'video', active: false},
            {name : 'Music', id: 'Music', active: false},
            {name : 'Polls', id: 'poll', active: false},
            {name : 'Files', id: 'files', active: false}
        ];

        this.currentX = 0;
        this.contentSize = 300;
        this.state = {
            ...this.state,
            showWelcome : (this.props.showWelcome === undefined)
        }
    }

    render() {

        return (
            <View>
                {this.props.canPost === undefined || this.props.canPost ? (
                    <CardItem style={{marginBottom:10,flexDirection: 'column'}}>

                        <View style={{flexDirection: 'row', marginBottom: 0, flex:1}}>
                            <FastImage source={{uri : this.props.avatar}} style={{width:45,height:45,borderRadius:22.5}}/>
                            <View style={{flexDirection: 'column', flex: 1,marginLeft:5}}>
                                <Item onPress={() => {
                                    this.props.navigation.navigate("feedEditor", {
                                        type: this.props.feedType,
                                        typeId: this.props.feedTypeId,
                                        entityId: this.props.entityId,
                                        entityType: this.props.entityType,
                                        toUserid: this.props.toUserid,
                                        component : this.props.component
                                    });
                                }} rounded style={{height:50,overflow:'hidden',
                                    borderWidth: 0.3,borderColor: '#B7B7B7',backgroundColor:'white',margin:0}}>
                                    <Text style={{flex: 1,fontSize:17,color:'#303030', left:10}}>{this.lang.t('whats_up')}</Text>
                                    <Icon name="camera" style={{color:'#303030',position:'relative',left: 10,fontSize: 20,marginTop:5}} type="SimpleLineIcons" />
                                    <Icon name="picture" style={{color:'#303030',marginLeft:0,fontSize: 20,marginTop:5}}  type="SimpleLineIcons"/>
                                </Item>
                            </View>

                        </View>
                    </CardItem>
                ) : null}

                {this.state.showWelcome ? (
                    <CardItem style={{marginBottom:10,flex:1}}>
                        <View style={{flexDirection:'row'}}>
                            <Image source={assets.cloud} style={{width:40,height:40}}/>
                            <Text style={{color: 'grey',fontWeight:'bold',fontSize:15,top:10,
                                flex:1,
                                alignSelf: 'flex-start',
                                marginBottom: 5,marginLeft:15}}>{this.lang.t('good')} {time.getGreetingTime()} {this.props.username}</Text>
                            <Button transparent small onPress={() => {
                                this.updateState({showWelcome: false})
                            }}>
                                <Icon name="md-close" style={{color:'grey',top:5}}/>
                            </Button>
                        </View>
                    </CardItem>
                ) : null}

                <CardItem style={{marginBottom:10,flex:1}}>
                    <View style={{flex:1,flexDirection: 'row'}}>
                        <TouchableOpacity onPress={() => {
                            if (this.currentX > 0)  this.scrollView.scrollTo({x:this.currentX - 70})
                        }}>
                            <Icon style={{fontSize:15,color:'grey',top:5}} name="arrow-left"  type="SimpleLineIcons"/>
                        </TouchableOpacity>
                        <ScrollView
                            ref={(ref) => this.scrollView = ref} horizontal={true}
                            onScroll={(event) => {
                                this.contentSize = event.nativeEvent.contentSize.width;
                                this.currentX = event.nativeEvent.contentOffset.x;
                            }}
                            style={{flex:1}} showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity onPress={() => {
                                this.props.component.sortBy("all")
                            }}>
                                <Badge light style={{backgroundColor: this.props.component.state.sort=== 'all' ? '#F5F4F5' : '#F5F4F5', marginRight: 20}}>
                                    <Text style={{color:'#303030',fontWeight:'bold',top : (Platform.OS === 'android')  ? 4 : 0}}>{this.lang.t('all')}</Text></Badge>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this.props.component.sortBy("photo")
                            }}>
                            <Badge light style={{backgroundColor: this.props.component.state.sort=== 'photo' ? '#DBD7DB' : '#F5F4F5', marginRight: 20}}>
                                <Text style={{color:'#303030',fontWeight:'bold',top : (Platform.OS === 'android')  ? 4 : 0}}>{this.lang.t('photos')}</Text></Badge>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this.props.component.sortBy("videos")
                            }}>
                            <Badge light style={{backgroundColor: this.props.component.state.sort=== 'videos' ? '#DBD7DB' : '#F5F4F5', marginRight: 20}}>
                                <Text style={{color:'#303030',fontWeight:'bold',top : (Platform.OS === 'android')  ? 4 : 0}}>{this.lang.t('videos')}</Text></Badge>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                this.props.component.sortBy("text")
                            }}>
                                <Badge light style={{backgroundColor: this.props.component.state.sort=== 'text' ? '#DBD7DB' : '#F5F4F5', marginRight: 20}}>
                                    <Text style={{color:'#303030',fontWeight:'bold',top : (Platform.OS === 'android')  ? 4 : 0}}>{this.lang.t('text')}</Text></Badge>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this.props.component.sortBy("musics")
                            }}>
                            <Badge light style={{backgroundColor: this.props.component.state.sort=== 'musics' ? '#DBD7DB' : '#F5F4F5', marginRight: 20}}>
                                <Text style={{color:'#303030',fontWeight:'bold',top : (Platform.OS === 'android')  ? 4 : 0}}>{this.lang.t('music')}</Text></Badge>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this.props.component.sortBy("polls")
                            }}>
                            <Badge light style={{backgroundColor: this.props.component.state.sort=== 'poll' ? '#DBD7DB' : '#F5F4F5', marginRight: 20}}>
                                <Text style={{color:'#303030',fontWeight:'bold',top : (Platform.OS === 'android')  ? 4 : 0}}>{this.lang.t('poll')}</Text></Badge>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this.props.component.sortBy("files")
                            }}>
                            <Badge light style={{backgroundColor: this.props.component.state.sort=== 'files' ? '#DBD7DB' : '#F5F4F5', marginRight: 20}}>
                                <Text style={{color:'#303030',fontWeight:'bold',top : (Platform.OS === 'android')  ? 4 : 0}}>{this.lang.t('files')}</Text></Badge>
                            </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity onPress={() => {
                            //console.log(this.currentX);
                            if (this.contentSize > this.currentX) {
                                this.scrollView.scrollTo({x :this.currentX +100})
                            }
                        }}>
                            <Icon style={{fontSize:15,color:'grey',left:20,top:5}} name="arrow-right" type="SimpleLineIcons"/>
                        </TouchableOpacity>
                    </View>
                </CardItem>

                {ADMOB_ID !== '' ? (
                    <AdMobBanner
                        adSize="fullBanner"
                        adUnitID={ADMOB_ID}
                        testDevices={[AdMobBanner.simulatorId]}
                    />
                ) : null}
            </View>
        )
    }
}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        welcomeNote : state.auth.welcomeNote
    }
})(FeedHeader)