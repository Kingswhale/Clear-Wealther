import React from 'react';
import {
    Text, View,
    StyleSheet, ActivityIndicator,
    Animated, Dimensions, TouchableOpacity, FlatList, Alert,ScrollView,WebView
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
import VideoCreate from './videoCreate';
import HTMLView from 'react-native-htmlview'
import Share from "react-native-share";

class VideoView extends ProfileBaseComponent {
    constructor(props) {
        super(props);

        this.type = this.props.type;
        this.itemId = this.props.navigation.getParam("itemId");
        this.asPlayer = this.props.navigation.getParam("player", false);
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

        this.itemName = 'video';


    }

    finishedEdit(res) {
        this.updateState({itemDetails: res.video});
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
                            <VideoCreate navigation={this.props.navigation} type="edit" itemId={this.state.itemDetails.id} component={this}/>
                        </Modal>
                        <Animated.View style={{
                            height: Dimensions.get('window').height + 160,
                            transform: [{translateY: this.state.imageTranslate}],
                            backgroundColor: 'white'
                        }}>
                            <Header hasTabs>
                                <Left>
                                    <Button onPress={() => this.props.navigation.goBack()} transparent>
                                        <Icon name="ios-arrow-round-back" style={{color:'white'}}/>
                                    </Button>
                                </Left>
                                <Body />
                                <Right/>
                            </Header>

                            <View style={{height:230,backgroundColor: material.brandPrimary,flexDirection: 'column'}}>
                                <HTMLView renderNode={renderNode} value={this.state.itemDetails.code} style={{width: '100%',backgroundColor: material.brandPrimary}}/>
                            </View>


                            <ScrollView
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                onScroll={this.onScroll.bind(this)}
                                style={{}}>
                                <CardItem header  style={{backgroundColor:'#EFEFEF'}}>
                                    <Text style={{fontSize:15}}>{this.state.itemDetails.title}</Text>
                                </CardItem>

                                {!this.asPlayer ? (
                                    <View>
                                        <View style={{position:'absolute', top : 0,zIndex:9,padding:10}}>
                                            {this.displayReactions()}
                                        </View>
                                        <View >
                                            <View style={{padding:10}}>
                                                {this.displayLikeCommentStats('white', 'black')}
                                            </View>
                                            <View style={{flexDirection: 'row',borderColor:'white',borderTopColor:'#EFEFEF',borderWidth:.6,marginTop:10}}>


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
                                                            type : 'video',
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
                                                        let url = WEBSITE + "video/" + this.state.itemDetails.slug;
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

                                        <HTMLView style={{flex:1,color: 'grey',padding:10,marginTop:20}} textComponentProps={{ style: bghtmlstyles.defaultStyle }}
                                                  value={this.state.itemDetails.description}/>
                                    </View>
                                ) : null}
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
                        {this.state.itemDetails.user_id === this.props.userid ? (
                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                this.refs.createModal.open();
                            }}>
                                <Left><Icon active name="pencil" type="SimpleLineIcons" style={{color:'#2196F3', fontSize: 15}} /></Left>
                                <Body><Text>{this.lang.t('edit_video')}</Text></Body>
                            </ListItem>
                        ) : null}
                    </MenuOptions>
                </Menu>
            </View>
        );
    }
}


function renderNode(node, index, siblings, parent, defaultRenderer) {
    if (node.name == 'iframe') {
        const a = node.attribs;
        const iframeHtml = `<iframe src="${a.src}"></iframe>`;
        return (
            <View key={index} style={{width: '100%', height: 230}}>
                <WebView source={{uri: a.src}} style={{width: '100%', height: 350}} />
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
})(VideoView)