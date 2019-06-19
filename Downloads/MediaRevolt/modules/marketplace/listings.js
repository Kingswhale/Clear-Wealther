import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";
import {
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    Platform,
    ActivityIndicator,
    Animated, StyleSheet, Dimensions
} from 'react-native';
import {
    Picker,
    Tabs,
    Tab,
    Icon,
    Button,
    Body,
    Left,
    Right, Container, Header, Fab, CardItem, Card, ListItem
} from 'native-base';
import Api, {BASE_CURRENCY} from "../../api";
import FastImage from 'react-native-fast-image';
import material from "../../native-base-theme/variables/material";
import EmptyComponent from "../../utils/EmptyComponent";
import Modal from 'react-native-modalbox';
import ListingCreate from './listingCreate';
import {Menu,MenuTrigger,MenuOptions,renderers,MenuProvider} from 'react-native-popup-menu';
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class Listings extends BaseComponent {
    itemOffset = 0;
    featuredOffset = 0;
    myOffset = 0;
    limit = 10;
    typeId = "listings";
    searchTab = 7;

    constructor(props) {
        super(props);
        this.state.myItemLists = [];
        this.state.featuredLists = [];
        this.categories = [];
        this.state.categoryId = 'all';
        this.state.filter = '';
        this.state.myFetchFinished = false;
        this.state.featuredFetchFinished = false;
        this.state.featuredListNotEnd  = false;
        this.state.myListNotEnd = false;
        this.state.tab = 0;

        this.loadLists('browse', false)
    }

    finishedCreate(res) {
        //newly created listings should be append to browse and my listing lists
        let browseLists = [];
        browseLists.push(res);
        browseLists.push(...this.state.itemLists);

        let myLists = [];
        myLists.push(res);
        myLists.push(...this.state.myItemLists);

        this.updateState({itemLists: browseLists, myItemLists: myLists});
    }

    loadLists(type, more) {
        let page;
        let dType = type;
        if (type === 'browse') {
            let pageOffset = this.limit + this.itemOffset;
            this.itemOffset = pageOffset;
             page = pageOffset / this.limit;
            this.state.filter = '';
            dType  = '';
        } else if(type === 'featured') {
            let pageOffset = this.limit + this.featuredOffset;
            this.featuredOffset = pageOffset;
            page  = pageOffset / this.limit;
            dType = 'featured ';
            this.state.filter = 'featured';
            this.state.categoryId = 'all';
        }
        else {
            let pageOffset = this.limit + this.myOffset;
            this.myOffset = pageOffset;
            page  = pageOffset / this.limit;
            this.state.filter = '';
            this.state.categoryId = 'all';
            dType = 'mine';
        }

        this.updateState({fetchFinished : false});
        Api.get("marketplace/browse", {
            userid : this.props.userid,

            category_id : (this.state.categoryId !== 'all') ? this.state.categoryId :  '',
            limit : this.limit,
            page : page,
            type : dType
        }).then((res) => {
            //console.log(res[this.typeId]);
            this.categories  = res.categories;
            if (res[this.typeId].length  > 0) {
                let lists = [];
                if (more) {
                    //more
                    lists.push(...this.state.itemLists);
                    lists.push(...res[this.typeId]);
                } else {
                    lists.push(...res[this.typeId]);
                }

                switch (type) {
                    case 'browse':
                        this.updateState({itemLists: lists,fetchFinished: true});
                        break;
                    case 'featured':
                        this.updateState({featuredLists: lists,featuredFetchFinished: true});
                        break;
                    case 'mine':
                        this.updateState({myItemLists: lists,myFetchFinished: true});
                        break
                }
            } else {
                switch (type) {
                    case 'browse':
                        this.updateState({itemListNotEnd: true,fetchFinished: true});
                        break;
                    case 'featured':
                        this.updateState({featuredListNotEnd: true,featuredFetchFinished: true});
                        break;
                    case 'mine':
                        this.updateState({myListNotEnd: true,myFetchFinished: true});
                        break
                }

            }
        }).catch((e) => {
            //this.categories = [{id:'all',title: 'All'},{id:'dummy',title: 'Dummies'}, {id:23, title:'Entertainment'}];
            switch (type) {
                case 'browse':
                    this.updateState({itemLists: [],fetchFinished: true});
                    break;
                case 'featured':
                    this.updateState({featuredLists: [],featuredFetchFinished: true});
                    break;
                case 'mine':
                    this.updateState({myItemLists: [],myFetchFinished: true});
                    break
            }

        });


    }


    displayItem(item,index) {
        return (<TouchableWithoutFeedback onPress={() => {
            this.props.navigation.push("listingView", {
                itemId : item.id,
                item : item
            });
        }}>
            <Card>
                <CardItem header >
                    <Text style={{fontSize:15}}>{item.title}</Text>
                </CardItem>
                {item.image !== ''? (
                    <CardItem cardBody>
                        <FastImage source={{uri: item.image}} style={{height: 200, width: null, flex: 1}}/>
                    </CardItem>
                ) : null}
                <CardItem>
                    <Left>
                        <View style={{flexDirection:'column'}}>
                            <Text><Text style={{fontWeight:'bold'}}>{this.lang.t('price')}</Text> -
                                {item.price === '' ? (<Text>{this.lang.t('free')}</Text>) : (<Text>{BASE_CURRENCY}{item.price}</Text>)}
                            </Text>
                            <Text note style={{color:'grey'}}>{item.time}</Text>
                        </View>
                    </Left>
                    <Right>
                        <View style={{flexDirection:'row'}}>

                            <Icon name="ios-chatbubbles-outline"/>
                            <Text style={{fontWeight:'bold',color:'grey',marginRight:5,marginLeft:5}}>{item.comments}</Text>

                        </View>
                    </Right>
                </CardItem>
            </Card>
        </TouchableWithoutFeedback>)
    }

    render() {

        return (
            <MenuProvider customStyles={menuProviderStyles}>

                <Container>
                    <Modal
                        ref={"createModal"}
                        coverScreen={false}
                        entry="top"
                        position="top"
                        backButtonClose={true}
                        swipeToClose={false}
                        backdropPressToClose={false}
                        onClosingState={this.onClosingState}>
                        <ListingCreate navigation={this.props.navigation} type="new" component={this}/>
                    </Modal>
                    <Animated.View style={{
                        width: "100%",
                        elevation: 0,
                        height: Dimensions.get('window').height + 60,
                        transform: [{translateY: this.state.imageTranslate}],
                        backgroundColor: 'white'
                    }}>

                        <Header hasTabs>
                            <Left>
                                <Button onPress={() => this.props.navigation.openDrawer()} transparent>
                                    <Icon name="ios-menu" />
                                </Button>
                            </Left>
                            <Body >
                            <Text style={{color:'white',fontSize: 16,left:-10}}>{this.lang.t('listings')}</Text>
                            </Body>

                            <Right>
                                <Button transparent onPress={() => {
                                    this.props.navigation.push("search", {tab:this.searchTab})
                                }}>
                                    <Icon name="ios-search"/>
                                </Button>

                                {this.state.tab === 0 ? (
                                    <Button transparent onPress={() => {
                                        this.menu.open();
                                    }}>
                                        <Icon name="md-funnel" style={{color: (this.state.categoryId !== 'all') ? material.accentTextColor : 'white'}}/>
                                    </Button>
                                ) : null}
                            </Right>
                        </Header>
                        <Menu ref={(c) => this.menu = c} renderer={renderers.SlideInMenu}>
                            <MenuTrigger/>
                            <MenuOptions>
                                {this.listCategories()}
                            </MenuOptions>
                        </Menu>
                        <Tabs
                            ref={(tabView)  => {this.tabView = tabView}}
                            onChangeTab={(tab) => {
                                if (tab.i === 0) {
                                    if (this.state.itemLists.length < 1) this.loadLists('browse', false);
                                } else if(tab.i === 1) {
                                    if (this.state.featuredLists.length < 1) this.loadLists('featured', false);
                                } else {
                                    if (this.state.myItemLists.length < 1) this.loadLists('mine', false);
                                }
                                this.updateState({tab: tab.i})
                            }}
                            initialPage={0} style={{
                            paddingTop: 0,
                            backgroundColor: 'white',
                            elevation: 0,shadowOffset: {height: 0, width: 0},
                            shadowOpacity: 0,flex:1}}>
                            <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('listings').toUpperCase()} >
                                <AnimatedFlatList
                                    keyExtractor={(item, index) => item.id}
                                    data={this.state.itemLists}
                                    style={{flex:1}}
                                    scrollEventThrottle={16}
                                    overScrollMode="never"
                                    onScroll={this.onScroll.bind(this)}
                                    ref='_flatList'
                                    onEndReachedThreshold={.5}
                                    onEndReached={(d) => {
                                        if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                                            this.loadLists('browse', true);
                                        }
                                        return true;
                                    }}
                                    extraData={this.state}
                                    refreshing={this.state.refreshing}
                                    onRefresh={() => {
                                        this.itemOffset = 0;
                                        this.loadLists('browse', false);
                                    }}
                                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                                        {this.state.fetchFinished ? (<Text/>) : (<ActivityIndicator size='large' />)}
                                    </View>}
                                    ListEmptyComponent={!this.state.fetchFinished ? (
                                        <Text/>
                                    ) : (<EmptyComponent text={this.lang.t('no_listings_found')}/>)}
                                    renderItem={({ item ,index}) => this.displayItem(item,index)}
                                />
                            </Tab>
                            <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('featured').toUpperCase()} >
                                <AnimatedFlatList
                                    keyExtractor={(item, index) => item.id}
                                    data={this.state.featuredLists}
                                    style={{flex:1}}
                                    scrollEventThrottle={16}
                                    overScrollMode="never"
                                    onScroll={this.onScroll.bind(this)}
                                    ref='_flatList'
                                    onEndReachedThreshold={.5}
                                    onEndReached={(d) => {
                                        //this.fetchRequests();
                                        if (this.state.featuredLists.length > 0 && !this.state.featuredListNotEnd) {
                                            this.loadLists('featured', true);
                                        }
                                        return true;
                                    }}
                                    extraData={this.state}
                                    refreshing={this.state.refreshing}
                                    onRefresh={() => {
                                        this.featuredOffset = 0;
                                        this.loadLists('featured', false);
                                    }}
                                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                                        {this.state.featuredFetchFinished ? (<Text/>) : (<ActivityIndicator size='large' />)}
                                    </View>}
                                    ListEmptyComponent={!this.state.featuredFetchFinished ? (
                                        <Text/>
                                    ) : (<EmptyComponent text={this.lang.t('no_listings_found')}/>)}
                                    renderItem={({ item ,index}) => this.displayItem(item,index)}
                                />
                            </Tab>
                            <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('my_listings').toUpperCase()} >
                                <AnimatedFlatList
                                    keyExtractor={(item, index) => item.id}
                                    data={this.state.myItemLists}
                                    style={{flex:1}}
                                    scrollEventThrottle={16}
                                    overScrollMode="never"
                                    onScroll={this.onScroll.bind(this)}
                                    ref='_flatList'
                                    onEndReachedThreshold={.5}
                                    onEndReached={(d) => {
                                        //this.fetchRequests();
                                        if (this.state.myItemLists.length > 0 && !this.state.myListNotEnd) {
                                            this.loadLists('mine', true);
                                        }
                                        return true;
                                    }}
                                    extraData={this.state}
                                    refreshing={this.state.refreshing}
                                    onRefresh={() => {
                                        this.myOffset = 0;
                                        this.loadLists('mine', false);
                                    }}
                                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                                        {this.state.myFetchFinished ? (<Text/>) : (<ActivityIndicator size='large' />)}
                                    </View>}
                                    ListEmptyComponent={!this.state.myFetchFinished ? (
                                        <Text/>
                                    ) : (<EmptyComponent text={this.lang.t('no_listings_found')}/>)}
                                    renderItem={({ item ,index}) => this.displayItem(item,index)}
                                />
                            </Tab>
                        </Tabs>

                    </Animated.View>

                    {this.state.tab === 0 || this.state.tab === 2 ? (
                        <Fab
                            direction="up"
                            containerStyle={{ }}
                            style={{ backgroundColor: material.accentTextColor,elevation: 0,shadowOffset: {width:0,height:0},shadowOpacity:0}}
                            position="bottomRight"

                            onPress={() => {
                                this.refs.createModal.open()
                            }}>
                            <Icon name="add" />
                        </Fab>
                    ) : null}
                </Container>
            </MenuProvider>
        );
    }

    listCategories() {
        let items = [];
        for(let i=0;i<this.categories.length;i++) {
            items.push(<TouchableOpacity noBorder icon onPress={()=>{
                this.menu.close();
                this.updateState({categoryId : this.categories[i].id,itemLists: [], fetchFinished: false,itemListNotEnd:false});
                this.itemOffset = 0;
                setTimeout(() => {
                    this.loadLists("browse", false);
                }, 200)
            }}>
                <Text style={{margin:10,fontSize:15,color:this.state.categoryId === this.categories[i].id ? material.accentTextColor : 'grey'}}>{this.categories[i].title}</Text>
            </TouchableOpacity>);
        }
        return (<View>
            <Text style={{color:'black',fontSize:16,margin:10}}>{this.lang.t('filter_by_category')}</Text>
            {items}
            </View>)
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
    }
})(Listings)