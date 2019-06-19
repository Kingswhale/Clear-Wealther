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
import EventCreate from './eventCreate';
import HTMLView from 'react-native-htmlview'
import Share from "react-native-share";
import time from "../../utils/Time";
import {doFeedAction} from "../feed/store";


class EventView extends ProfileBaseComponent {
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

        this.itemName = 'event';
       // this.loadItemDetail();

    }

    finishedEdit(res) {
        this.updateState({itemDetails: res.event});
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
        console.log(this.state.itemDetails);
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
                            <EventCreate navigation={this.props.navigation} type="edit" item={this.state.itemDetails} itemId={this.state.itemDetails.id} component={this}/>
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
                                                    square large source={{uri : this.state.itemDetails.image}}/>
                                                <View style={{flexDirection: 'column',flex:1, marginLeft:10,marginTop:0}}>
                                                    <Text style={{fontSize:20,color:'white',marginTop:10}}>
                                                        {this.state.itemDetails.title}
                                                    </Text>

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
                                <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('about')} >
                                    <ScrollView scrollEventThrottle={16}
                                                overScrollMode="never"

                                                onScroll={this.onScroll.bind(this)}>
                                        <View style={{margin:10, backgroundColor:'white',flexDirection: 'row',padding:10,borderRadius:5}}>
                                            <Button block small light onPress={() => this.rsvp(0)}
                                                    style={{borderRadius:5,width:'100%',flex:1,
                                                        backgroundColor: parseInt(this.state.itemDetails.rsvp) !== 0 ? '#EFEFEF' : material.brandPrimary
                                                    }}>
                                                <Text style={{color:parseInt(this.state.itemDetails.rsvp) === 0 ? 'white' : 'black',
                                                    marginLeft:15,marginRight:15}}>{this.lang.t('not_going')}</Text>
                                            </Button>
                                            <Button block small light onPress={() => this.rsvp(1)}
                                                    style={{borderRadius:5,marginLeft:5,width:'100%',flex:1,
                                                backgroundColor: parseInt(this.state.itemDetails.rsvp) !== 1 ? '#EFEFEF' : material.brandPrimary
                                            }}>
                                                <Text style={{color:parseInt(this.state.itemDetails.rsvp) === 1? 'white' : 'black',
                                                    marginLeft:15,marginRight:15}}>{this.lang.t('going')}</Text>
                                            </Button>
                                            <Button block small light onPress={() => this.rsvp(2)}
                                                    style={{borderRadius:5,marginLeft:5,width:'100%',flex:1,
                                                backgroundColor: parseInt(this.state.itemDetails.rsvp) !== 2 ? '#EFEFEF' : material.brandPrimary
                                            }}>
                                                <Text style={{color:parseInt(this.state.itemDetails.rsvp) === 2 ? 'white' : 'black',
                                                    marginLeft:15,marginRight:15}}>{this.lang.t('maybe')}</Text>
                                            </Button>
                                        </View>

                                        <View style={{margin:10, backgroundColor:'white',flexDirection: 'row',padding:10,borderRadius:5}}>
                                            <View style={{flex:1,alignContent:'center'}}>
                                                <Text style={{fontWeight:'bold',fontSize:20,marginBottom:10,alignSelf:'center'}}>{this.state.itemDetails.count_going}</Text>
                                                <Text style={{color:'grey',alignSelf:'center'}}>{this.lang.t('going')}</Text>
                                            </View>

                                            <View style={{flex:1,alignContent:'center'}}>
                                                <Text style={{fontWeight:'bold',fontSize:20,marginBottom:10,alignSelf:'center'}}>{this.state.itemDetails.count_maybe}</Text>
                                                <Text style={{color:'grey',alignSelf:'center'}}>{this.lang.t('maybe')}</Text>
                                            </View>

                                            <View style={{flex:1,alignContent:'center'}}>
                                                <Text style={{fontWeight:'bold',fontSize:20,marginBottom:10,alignSelf:'center'}}>{this.state.itemDetails.count_invited}</Text>
                                                <Text style={{color:'grey',alignSelf:'center'}}>{this.lang.t('invited')}</Text>
                                            </View>
                                        </View>

                                        <View style={{margin:10, backgroundColor:'white',flexDirection: 'row',padding:10,borderRadius:5}}>
                                            <View style={{
                                                flexDirection: 'row',
                                                flex:1,
                                                borderColor:'#B5B5B5',borderWidth:0.6,borderRadius:10,padding:15,marginRight:10}}>
                                                <View style={{flexDirection:'column'}}>
                                                    <Text style={{color: material.accentTextColor,marginBottom:5}}>{time.getMonth(this.state.itemDetails.start_time)}</Text>
                                                    <Text style={{color:'black'}}>{time.getDay(this.state.itemDetails.start_time)}</Text>
                                                </View>
                                                <View style={{flex:1,marginLeft:3,top:8}}>
                                                    <Text style={{color:'black',fontWeight:'bold'}}>
                                                        {time.getDayName(this.state.itemDetails.start_time)} {time.getHour(this.state.itemDetails.start_time)} {time.getHourType(this.state.itemDetails.start_time)}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={{margin:10}}>To</Text>

                                            <View style={{
                                                flexDirection: 'row',
                                                flex:1,
                                                borderColor:'#B5B5B5',borderWidth:0.6,borderRadius:10,padding:15,marginRight:10}}>
                                                <View style={{flexDirection:'column'}}>
                                                    <Text style={{color: material.accentTextColor,marginBottom:5}}>{time.getMonth(this.state.itemDetails.end_time)}</Text>
                                                    <Text style={{color:'black'}}>{time.getDay(this.state.itemDetails.end_time)}</Text>
                                                </View>
                                                <View style={{flex:1,marginLeft:3,top:8}}>
                                                    <Text style={{color:'black',fontWeight:'bold'}}>
                                                        {time.getDayName(this.state.itemDetails.end_time)} {time.getHour(this.state.itemDetails.end_time)} {time.getHourType(this.state.itemDetails.end_time)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{margin:10, backgroundColor:'white',flexDirection: 'column',padding:10,borderRadius:5,marginBottom:200}}>
                                            {this.state.itemDetails.description !== '' ? (
                                                <Text style={{fontSize:15,marginBottom:15}}>{this.state.itemDetails.description}</Text>
                                            ) : null}

                                            {this.state.itemDetails.location !== '' ? (
                                                <View style={{flexDirection:'row',marginBottom:10}}>
                                                    <Icon name="md-locate"/>
                                                    <Text style={{flex:1,marginLeft:10}}>{this.state.itemDetails.location}</Text>
                                                </View>
                                            ) : null}

                                            {this.state.itemDetails.address !== '' ? (
                                                <View style={{flexDirection:'row',marginBottom:10}}>
                                                    <Icon name="md-pin"/>
                                                    <Text style={{flex:1,marginLeft:10}}>{this.state.itemDetails.address}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </ScrollView>
                                </Tab>
                                <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('discussion')} >
                                    <FeedComponent
                                        navigation={this.props.navigation}
                                        type="profile"
                                        feedType="event"
                                        feedTypeId={this.state.itemDetails.id}
                                        entityId={this.props.userid}
                                        entityType="user"
                                        toUserid=""
                                        canPost={true}
                                        showWelcome={false}
                                        style={{flex: 1}} component={this}/>
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
                                    this.refs.createModal.open();
                                }}>
                                    <Left><Icon active name="pencil" type="SimpleLineIcons" style={{color:'#2196F3', fontSize: 15}} /></Left>
                                    <Body><Text>{this.lang.t('edit_event')}</Text></Body>
                                </ListItem>

                                <ListItem noBorder icon onPress={()=>{
                                    this.menu.close();
                                    Alert.alert(
                                        this.lang.t('do_you_really_delete'),
                                        '',
                                        [
                                            {text: this.lang.t('cancel'), onPress: () => {}, style: 'cancel'},
                                            {text: this.lang.t('delete'), onPress: () => {
                                                    Api.get("event/delete", {
                                                        event_id : this.state.itemDetails.id,
                                                        userid : this.props.userid
                                                    });
                                                    this.props.navigation.goBack();
                                                }},
                                        ],
                                        { cancelable: true }
                                    );
                                }}>
                                    <Left><Icon active name="md-trash"  style={{color:'#2196F3', fontSize: 15}} /></Left>
                                    <Body><Text>{this.lang.t('delete_event')}</Text></Body>
                                </ListItem>
                            </View>
                        ) : null}

                        <ListItem noBorder icon onPress={()=>{
                            this.menu.close();
                            this.props.navigation.push("report", {
                                link : WEBSITE + "event/" + this.state.itemDetails.id,
                                type : 'event'
                            })
                        }}>
                            <Left><Icon active name="ios-alert-outline" style={{color:'#2196F3', fontSize: 15}} /></Left>
                            <Body><Text>{this.lang.t('report')}</Text></Body>
                        </ListItem>

                        {this.state.itemDetails.privacy === "1" ? (
                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                let url = WEBSITE + "event/" + this.state.itemDetails.id;
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

    rsvp(type) {
        if (this.state.itemDetails.rsvp !== type) {
            this.updateState({processing : true});
            Api.get("event/rsvp", {
                userid : this.props.userid,
                event_id: this.state.itemDetails.id,
                rsvp : type
            }).then((res) => {
                this.updateState({processing : false});
                let details = {
                    ...this.state.itemDetails,
                    rsvp : type,
                    count_going : res.data_one,
                    count_maybe : res.data_two,
                    count_invited : res.data_three
                };

                this.updateState({itemDetails: details});
            })
        }
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
})(EventView)