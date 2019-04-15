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
    Right, Container, Header, Fab, CardItem, Card, ListItem,ScrollableTab
} from 'native-base';
import Api from "../../api";
import FastImage from 'react-native-fast-image';
import material from "../../native-base-theme/variables/material";
import EmptyComponent from "../../utils/EmptyComponent";
import Modal from 'react-native-modalbox';
import EventCreate from './eventCreate';
import {Menu,MenuTrigger,MenuOptions,renderers,MenuProvider} from 'react-native-popup-menu';
import time from "../../utils/Time";
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class Events extends BaseComponent {
    itemOffset = 0;
    pastOffset = 0;
    myOffset = 0;
    limit = 10;
    typeId = "events";
    searchTab = 8;

    constructor(props) {
        super(props);
        this.state.myItemLists = [];
        this.state.pastLists = [];
        this.state.birthdayList  = null;
        this.categories = [];
        this.state.categoryId = 'all';
        this.state.filter = '';
        this.state.myFetchFinished = false;
        this.state.pastFetchFinished = false;
        this.state.pastListNotEnd  = false;
        this.state.myListNotEnd = false;
        this.state.tab = 0;

        this.loadLists('browse', false)
    }

    finishedCreate(res) {
        //newly created events should be append to browse and my event lists
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
             dType = 'upcoming';
            this.state.filter = '';
        } else if(type === 'past') {
            let pageOffset = this.limit + this.pastOffset;
            this.pastOffset = pageOffset;
            page  = pageOffset / this.limit;
            dType = 'past';
            this.state.filter = 'past';
            this.state.categoryId = 'all';
        }
        else {
            let pageOffset = this.limit + this.myOffset;
            this.myOffset = pageOffset;
            page  = pageOffset / this.limit;
            this.state.filter = '';
            dType = "me";
            this.state.categoryId = 'all';
        }

        this.updateState({fetchFinished : false});
        Api.get("event/browse", {
            userid : this.props.userid,
            filter : this.state.filter,
            category_id : this.state.categoryId,
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
                    case 'past':
                        this.updateState({pastLists: lists,pastFetchFinished: true});
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
                    case 'past':
                        this.updateState({pastListNotEnd: true,pastFetchFinished: true});
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
                case 'past':
                    this.updateState({pastLists: [],pastFetchFinished: true});
                    break;
                case 'mine':
                    this.updateState({myItemLists: [],myFetchFinished: true});
                    break
            }

        });


    }


    displayItem(item,index) {

        return (<TouchableWithoutFeedback onPress={() => {
            this.props.navigation.push("eventView", {
                itemId : item.id,
                item : item
            });
        }}>
            <Card>
                <CardItem cardBody>
                    <FastImage source={{uri: item.cover}} style={{height: 200, width: null, flex: 1}}>
                        <View style={{position:'absolute', bottom:10,flexDirection:'row',left:10}}>
                            <FastImage source={{uri: item.image}} style={{width:60,height:60,borderRadius:30,borderColor:'white',borderWidth: 4}}/>
                            <View style={{flex:1,marginLeft:10,flexDirection:'column'}}>
                                <Text style={{fontSize:15,color:'white',textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: {width: -1, height: 1},
                                    textShadowRadius: 10}}>{item.title}</Text>
                                <Text style={{fontSize:15,color:'white',marginTop:10,textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: {width: -1, height: 1},
                                    textShadowRadius: 10}}>{this.lang.t('at')} : {item.location}</Text>
                            </View>
                        </View>
                    </FastImage>
                </CardItem>
                <CardItem>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:60,height:60,borderRadius:10,backgroundColor:material.brandPrimary}}>
                                <Text style={{fontSize:20,fontWeight:'bold',color:'white',alignSelf:'center'}}>{time.getDay(item.start_time)}</Text>
                                <Text style={{fontSize:20,fontWeight:'bold',color: 'white',alignSelf:'center'}}>{time.getMonth(item.start_time)}</Text>
                        </View>
                        <View style={{flex:1,flexDirection:'row',marginTop:15}}>
                            <Text style={{margin:10}}><Text style={{fontWeight:'bold'}}>{item.count_going}</Text> {this.lang.t('going')}</Text>
                            <Text style={{margin:10}}><Text style={{fontWeight:'bold'}}>{item.count_maybe}</Text> {this.lang.t('maybe')}</Text>
                            <Text style={{margin:10}}><Text style={{fontWeight:'bold'}}>{item.count_invited}</Text> {this.lang.t('invited')}</Text>
                        </View>
                    </View>
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
                        <EventCreate navigation={this.props.navigation} type="new" component={this}/>
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
                            <Text style={{color:'white',fontSize: 16,left:-10}}>{this.lang.t('events')}</Text>
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
                                } else if(tab.i === 2) {
                                    if (this.state.pastLists.length < 1) this.loadLists('past', false);
                                } else if (tab.i === 1) {
                                    if (this.state.birthdayList === null) this.loadBirthdays();
                                }
                                else {
                                    if (this.state.myItemLists.length < 1) this.loadLists('mine', false);
                                }
                                this.updateState({tab: tab.i})
                            }}
                            renderTabBar={()=> <ScrollableTab />}
                            initialPage={0} style={{
                            paddingTop: 0,
                            backgroundColor: 'white',
                            elevation: 0,shadowOffset: {height: 0, width: 0},
                            shadowOpacity: 0,flex:1}}>
                            <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('events').toUpperCase()} >
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
                                    ) : (<EmptyComponent text={this.lang.t('no_events_found')}/>)}
                                    renderItem={({ item ,index}) => this.displayItem(item,index)}
                                />
                            </Tab>
                            <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('birthdays').toUpperCase()} >
                                {this.displayBirthDays()}
                            </Tab>
                            <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('past_events').toUpperCase()} >
                                <AnimatedFlatList
                                    keyExtractor={(item, index) => item.id}
                                    data={this.state.pastLists}
                                    style={{flex:1}}
                                    scrollEventThrottle={16}
                                    overScrollMode="never"
                                    onScroll={this.onScroll.bind(this)}
                                    ref='_flatList'
                                    onEndReachedThreshold={.5}
                                    onEndReached={(d) => {
                                        //this.fetchRequests();
                                        if (this.state.pastLists.length > 0 && !this.state.pastListNotEnd) {
                                            this.loadLists('past', true);
                                        }
                                        return true;
                                    }}
                                    extraData={this.state}
                                    refreshing={this.state.refreshing}
                                    onRefresh={() => {
                                        this.pastOffset = 0;
                                        this.loadLists('past', false);
                                    }}
                                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                                        {this.state.pastFetchFinished ? (<Text/>) : (<ActivityIndicator size='large' />)}
                                    </View>}
                                    ListEmptyComponent={!this.state.pastFetchFinished ? (
                                        <Text/>
                                    ) : (<EmptyComponent text={this.lang.t('no_events_found')}/>)}
                                    renderItem={({ item ,index}) => this.displayItem(item,index)}
                                />
                            </Tab>
                            <Tab style={{backgroundColor: '#DEDCDD'}}  heading={this.lang.t('my_events').toUpperCase()} >
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
                                    ) : (<EmptyComponent text={this.lang.t('no_events_found')}/>)}
                                    renderItem={({ item ,index}) => this.displayItem(item,index)}
                                />
                            </Tab>
                        </Tabs>

                    </Animated.View>

                    {this.state.tab === 0 || this.state.tab === 3 ? (
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

    loadBirthdays() {
        Api.get("event/birthdays", {
            userid : this.props.userid
        }).then((res) => {
            this.updateState({birthdayList : res});
        });
    }

    displayBirthDays() {
        let views = [];

        if (this.state.birthdayList !== null) {
            //todays birthday
            let todays = [];
            if (this.state.birthdayList.todays.length > 0) {
                for (let i=0;i<this.state.birthdayList.todays.length; i++) {
                    todays.push(<TouchableOpacity onPress={() => {
                        this.props.navigation.push("profile", {id : this.state.birthdayList.todays[i].id})
                    }}>
                        <FastImage style={{width:50,height:50,borderRadius:5,margin:5}} source={{uri : this.state.birthdayList.todays[i].avatar}}/>
                    </TouchableOpacity>);
                }
            }

            views.push(<View style={{backgroundColor:'white', margin:10,marginTop:5,borderRadius:5,padding:10}}>
                {todays.length > 0 ? (<View style={{flexDirection:'column'}}>
                    <Text>{this.lang.t('todays_birthday')}</Text>
                    <View>
                        {todays}
                    </View>
                </View>) : (
                    <Text>{this.lang.t('no_birthdays_today')}</Text>
                )}
            </View>);

            let thisMonths = [];
            if (this.state.birthdayList.thismonth.length > 0 ) {

                for (let i=0;i<this.state.birthdayList.thismonth.length; i++) {
                    thisMonths.push(<TouchableOpacity onPress={() => {
                        this.props.navigation.push("profile", {id : this.state.birthdayList.thismonth[i].id})
                    }}>
                        <FastImage style={{width:50,height:50,borderRadius:5,margin:5}} source={{uri : this.state.birthdayList.thismonth[i].avatar}}/>
                    </TouchableOpacity>);
                }


            }

            views.push(<View style={{backgroundColor:'white', margin:10,marginTop:5,borderRadius:5,padding:10}}>
                {thisMonths.length > 0 ? (<View style={{flexDirection:'column'}}>
                    <Text>{this.lang.t('this_month_birthday')}</Text>
                    <View>
                        {thisMonths}
                    </View>
                </View>) : (
                    <Text>{this.lang.t('no_birthdays_this_month')}</Text>
                )}
            </View>);

            if (this.state.birthdayList.months.length > 0) {
                let otherMonths = [];
                for(let i = 0;i<this.state.birthdayList.months.length;i++) {
                    let thismonth = [];
                    for (let i2=0;i2<this.state.birthdayList.months[i].users.length; i2++) {
                        thismonth.push(<TouchableOpacity onPress={() => {
                            this.props.navigation.push("profile", {id : this.state.birthdayList.months[i].users[i2].id})
                        }}>
                            <FastImage style={{width:50,height:50,borderRadius:5,margin:5}} source={{uri : this.state.birthdayList.months[i].users[i2].avatar}}/>
                        </TouchableOpacity>);
                    }

                    otherMonths.push(<View style={{backgroundColor:'white', margin:10,marginTop:5,borderRadius:5,padding:10}}>
                        <View style={{flexDirection:'column'}}>
                            <Text>{time.getMonthName(this.state.birthdayList.months[i].title)} {this.lang.t('birthdays')}</Text>
                            <View>
                                {thismonth}
                            </View>
                        </View>
                    </View>);
                }

                views.push(otherMonths);
            }
        }
        return (<ScrollView scrollEventThrottle={16}
                            overScrollMode="never"
                            onScroll={this.onScroll.bind(this)}>{views}</ScrollView>)
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
})(Events)