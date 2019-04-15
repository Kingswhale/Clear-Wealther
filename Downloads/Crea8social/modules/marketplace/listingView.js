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
import Spinner from 'react-native-loading-spinner-overlay';
import Api, {BASE_CURRENCY, LIKE_TYPE, WEBSITE} from "../../api";
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modalbox';
import {Menu,MenuTrigger,MenuOptions,renderers,MenuProvider} from 'react-native-popup-menu';
import ProfileBaseComponent from "../../utils/profileBaseComponent";
import material from "../../native-base-theme/variables/material";
import ListingCreate from './listingCreate';
import HTMLView from 'react-native-htmlview'
import Share from "react-native-share";

class ListingView extends ProfileBaseComponent {
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

        this.itemName = 'listing';


    }

    finishedEdit(res) {
        this.updateState({itemDetails: res.listing});
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
                            backdropPressToClose={false}
                            onClosingState={this.onClosingState}>
                            <ListingCreate navigation={this.props.navigation} type="edit" itemId={this.state.itemDetails.id} component={this}/>
                        </Modal>
                        <Animated.View style={{
                            height: Dimensions.get('window').height + 160,
                            transform: [{translateY: this.state.imageTranslate}],
                            backgroundColor: 'white'
                        }}>

                            <View style={{height:230,backgroundColor: material.brandPrimary,flexDirection: 'column'}}>
                                {this.state.showHeaderContent ? (
                                    <View style={{height:230}}>
                                        {this.renderHeader(false)}
                                        <View style={{position: 'absolute', bottom: 0,width:'100%',padding:20,flexDirection: 'row'}}>
                                            <FastImage
                                                style={{borderColor: 'white',borderWidth: 3,borderRadius: 5,width:80,height:80}}
                                                square large source={{uri : this.state.itemDetails.image}}/>
                                            <View style={{flexDirection: 'column',flex:1, marginLeft:10,marginTop:0}}>
                                                <Text style={{fontSize:20,color:'white'}}>
                                                    {this.state.itemDetails.title}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={{height: 70,position:'absolute', bottom:0,flex:1,width: '100%',paddingTop:10,flexDirection:'row'}}>
                                        {this.renderHeader(true)}
                                    </View>
                                )}
                            </View>
                            <View>
                                <CardItem style={{backgroundColor:'#FAFAFA'}}>
                                    <Left>
                                        <View style={{flexDirection:'column'}}>
                                            <Text><Text style={{fontWeight:'bold'}}>{this.lang.t('price')}</Text> -
                                                {this.state.itemDetails.price === '' ? (<Text>{this.lang.t('free')}</Text>) : (<Text>{BASE_CURRENCY}{this.state.itemDetails.price}</Text>)}
                                            </Text>
                                            <Text note style={{color:'grey'}}>{this.state.itemDetails.time}</Text>
                                        </View>
                                    </Left>
                                    <Right>
                                        <View style={{flexDirection:'row'}}>
                                            <Icon name="ios-chatbubbles-outline"/>
                                            <Text style={{fontWeight:'bold',color:'grey',marginRight:5,marginLeft:5}}>{this.state.itemDetails.comments}</Text>

                                        </View>
                                    </Right>
                                </CardItem>
                            </View>

                            <ScrollView
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                onScroll={this.onScroll.bind(this)}
                                style={{padding:10}}>
                                <HTMLView style={{flex:1,color: 'grey',marginBottom:120}} textComponentProps={{ style: bghtmlstyles.defaultStyle }}
                                          value={this.state.itemDetails.description}/>
                            </ScrollView>
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
                        <ListItem noBorder icon onPress={()=>{
                            this.menu.close();
                            this.props.navigation.push("report", {
                                link :  WEBSITE + 'marketplace/listing/' + this.state.itemDetails.slug,
                                type : 'marketplace'
                            })
                        }}>
                            <Left><Icon active name="ios-alert-outline" style={{color:'#2196F3', fontSize: 15}} /></Left>
                            <Body><Text>{this.lang.t('report')}</Text></Body>
                        </ListItem>
                        <ListItem noBorder icon onPress={()=>{
                            this.menu.close();
                            let url = WEBSITE + 'marketplace/listing/' + this.state.itemDetails.slug;
                            const shareOptions = {
                                title: this.lang.t('share_via'),
                                url: url
                            };
                            Share.open(shareOptions);
                        }}>
                            <Left><Icon active name="md-share"  style={{color:'#2196F3', fontSize: 15}} /></Left>
                            <Body><Text>{this.lang.t('share')}</Text></Body>
                        </ListItem>
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
})(ListingView)