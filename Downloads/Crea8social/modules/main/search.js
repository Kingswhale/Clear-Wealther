import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {View,Text,ScrollView,FlatList,TouchableOpacity} from 'react-native';
import {
    Header,
    Icon,
    Container,
    Left,Right,Button,Body,Content,Input,Item,Tabs,Tab,ScrollableTab,Badge,Toast
} from 'native-base'
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../../api";
import material from "../../native-base-theme/variables/material";
import FastImage from 'react-native-fast-image';
import UserList from '../user/display/list';
import InlineFeed from '../feed/inlinefeed';
import GroupList from '../group/display/list';
import PageList from '../page/display/list';
import MarketplaceList from '../marketplace/display/list';
import MusicList from '../music/display/list';
import VideoList from '../video/display/list';
import EventList from '../event/display/list';
import BlogList from '../blog/display/list';
import update from 'immutability-helper';
import Feed from '../feed/feed'

class Search extends BaseComponent {
    pages;
    limit = 10;
    constructor(props) {
        super(props);

        //this.state.tab = this.props.navigation.getParam("tab",0);
        this.iniTab = 0;
        this.state = {
            ...this.state,
            term : '',
            tab : this.props.navigation.getParam("tab",0),
            activeTab : this.props.navigation.getParam("tab",0),
            peopleList : [],
            feedList : [],
            groupList : [],
            pageList : [],
            videoList : [],
            musicList : [],
            listingList : [],
            eventList : [],
            blogList : []
        };

        this.places = ['all','people','feeds','group','page','video','music','marketplace','event','blogs'];
        this.pages = this.getDefaultPages();

        this.playerList = null;
        this.playerListIndex = null;
    }

    componentDidMount() {

    }
    getDefaultPages() {
        return {
            people : 0,
            feed : 0,
            group : 0,
            page : 0,
            video: 0,
            music : 0,
            listing : 0,
            event : 0,
            blogs : 0
        }
    }

    search(text) {
        if (this.state.tab === 0 || this.state.tab === 1) this.getPeople(false,text);
        if (this.state.tab === 0 || this.state.tab === 2) this.getFeeds(false,text);
        if (this.state.tab === 0 || this.state.tab === 3) this.getGroups(false,text);
        if (this.state.tab === 0 || this.state.tab === 4) this.getPages(false,text);
        if (this.state.tab === 0 || this.state.tab === 5) this.getVideos(false,text);
        if (this.state.tab === 0 || this.state.tab === 6) this.getMusic(false,text);
        if (this.state.tab === 0 || this.state.tab === 7) this.getListing(false,text);
        if (this.state.tab === 0 || this.state.tab === 8) this.getEvents(false,text);
        if (this.state.tab === 0 || this.state.tab === 9) this.getBlogs(false,text);
    }

    getPeople(type,term) {
        let newoffset = this.limit + this.pages.people;
        this.pages.people = newoffset;
        let page = (type) ? newoffset/this.limit : 1;
        try{
            Api.get("friend/suggestions", {
                userid : this.props.userid,page: page, term: term,limit : this.limit})
                .then((res) => {
                    //console.log(res);
                    let list = [];

                    if (type) {
                        list.push(...this.state.peopleList);
                        list.push(...res);
                    } else {
                        list = res;
                    }
                    this.updateState({peopleList: list});
                });
        } catch(e){
            //console.log(e);
        }
    }

    getFeeds(type,term) {
        let newoffset = this.limit + this.pages.feed;
        this.pages.feed = newoffset;
        let page = (type) ? newoffset : 1;
        //console.log('i am hee');
        try{
            Api.get("feeds", {userid : this.props.userid,offset: page, type_id: term,type:'feed',limit : this.limit})
                .then((res) => {
                    //console.log(res);
                    let list = [];

                    if (type) {
                        list.push(...this.state.feedList);
                        list.push(...res);
                    } else {
                        list = res;
                    }
                    this.updateState({feedList: list});
                });
        } catch (e) {}
    }

    getGroups(type,term) {
        let newoffset = this.limit + this.pages.group;
        this.pages.group =  newoffset ;
        let page = (type) ? newoffset/this.limit : 1;
        try{
            Api.get("group/browse", {userid : this.props.userid,page: page, term: term,type:'search',limit : this.limit})
                .then((res) => {
                    let list = [];

                    if (type) {
                        list.push(...this.state.groupList);
                        list.push(...res.groups);
                    } else {
                        this.updateState({groupList: []});
                        list = res.groups;
                    }

                    this.updateState({groupList: list});
                });
        }catch (e) {}
    }

    getPages(type,term) {
        let newoffset = this.limit + this.pages.page;
        this.pages.page = newoffset;
        let page = (type) ? newoffset/this.limit : 1;
        try{
            Api.get("page/browse", {userid : this.props.userid,page: page, term: term,type:'browse',limit : this.limit})
                .then((res) => {
                    //console.log(res);
                    let list = [];

                    if (type) {
                        list.push(...this.state.pageList);
                        list.push(...res.pages);
                    } else {
                        this.updateState({pageList: []});
                        list = res.pages;
                    }
                    this.updateState({pageList: list});
                });
        } catch (e) {}
    }

    getVideos(type,term) {
        let newoffset = this.limit + this.pages.video;
        this.pages.video = newoffset;
        let page = (type) ? newoffset/this.limit : 1;
        try{
            Api.get("videos/browse", {userid : this.props.userid,page: page, term: term,type:'browse',limit : this.limit})
                .then((res) => {
                    let list = [];

                    if (type) {
                        list.push(...this.state.videoList);
                        list.push(...res.videos);
                    } else {
                        list = res.videos;
                    }
                    this.updateState({videoList: list});
                });
        } catch (e) {}
    }

    getMusic(type,term) {
        let newoffset = this.limit + this.pages.music;
        this.pages.music = newoffset;
        let page = (type) ? newoffset/this.limit : 1;
        try{
            Api.get("music/browse", {userid : this.props.userid,page: page, term: term,type:'browse',limit : this.limit})
                .then((res) => {
                   // console.log(res);
                    let list = [];

                    if (type) {
                        list.push(...this.state.musicList);
                        list.push(...res.songs);
                    } else {
                        list = res.songs;
                    }
                    this.updateState({musicList: list});
                });
        }catch (e) {}
    }

    getListing(type,term) {
        let newoffset = this.limit + this.pages.listing;
        this.pages.listing = newoffset;
        let page = (type) ? newoffset/this.limit : 1;
        try{
            Api.get("marketplace/browse", {userid : this.props.userid,page: page, term: term,type:'',limit : this.limit})
                .then((res) => {
                    console.log(res);
                    let list = [];

                    if (type) {
                        list.push(...this.state.listingList);
                        list.push(...res.listings);
                    } else {
                        list = res.listings;
                    }
                    this.updateState({listingList: list});
                });
        }catch (e) {console.log(e)}
    }

    getEvents(type,term) {
        let newoffset = this.limit + this.pages.event;
        this.pages.event = newoffset;
        let page = (type) ? newoffset/this.limit : 1;
        try{
            Api.get("event/browse", {userid : this.props.userid,page: page, term: term,type:'search',limit : this.limit})
                .then((res) => {
                    let list = [];

                    if (type) {
                        list.push(...this.state.eventList);
                        list.push(...res.events);
                    } else {
                        list = res.events;
                    }
                    this.updateState({eventList: list});
                });
        }catch (e) {}
    }

    getBlogs(type,term) {
        let newoffset = this.limit + this.pages.blog;
        this.pages.blog = newoffset;
        let page = (type) ? newoffset/this.limit : 1;
        try{
            Api.get("blog/browse", {userid : this.props.userid,page: page, term: term,type:'browse',limit : this.limit})
                .then((res) => {
                    let list = [];

                    if (type) {
                        list.push(...this.state.blogList);
                        list.push(...res.blogs);
                    } else {
                        list = res.blogs;
                    }
                    this.updateState({blogList: list});
                });
        }catch (e) {}
    }


    render() {
        //auto focus on the search input

        if (this.state.term === '') {
            setTimeout(() => {
                this.searchInput._root.focus();
            }, 200);
        } else {
            setTimeout(() => {
                if (this.state.tab !== this.iniTab && this.tabView !== null ) {
                    this.tabView.goToPage(this.state.tab);
                    this.iniTab = this.state.tab;
                }
            }, 100)
        }

        return (
            <Container>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
                <Header hasTabs   noShadow rounded>
                    <View style={{flexDirection: 'row',width:'100%'}}>
                        <Button style={{left:-10}} transparent onPress={() => {
                            this.props.navigation.goBack();
                        }}>
                            <Icon name="ios-arrow-round-back"/>
                        </Button>
                        <Item style={{backgroundColor: material.brandPrimary,borderBottomWidth:0,borderBottomColor:'white',flex:1,bottom:2}}>

                            <Input ref={(ref) => this.searchInput = ref}
                                   onChangeText={(text) => {
                                       this.updateState({term : text});
                                       this.search(text);
                                   }}
                                   style={{color:'white', placeholderTextColor: 'lightgrey'}}
                                   placeholder="Search" />
                            <Icon style={{color: 'lightgrey'}} name="ios-search" />
                        </Item>
                    </View>
                </Header>
                {this.state.term !== '' ? (
                    <Tabs style={{flex:1, backgroundColor: 'white'}}
                          onChangeTab={(p) => {
                              this.updateState({
                                  tab : p.i
                              });
                          }}
                          ref={(tabView)  => {this.tabView = tabView}}
                          scrollWithoutAnimation={true}
                          initialPage={0}
                          page={this.state.tab} renderTabBar={()=> <ScrollableTab />}>
                        <Tab heading={this.lang.t('all')} style={{backgroundColor: '#EEEEEE'}}>
                            <ScrollView>
                                {this.displayAll()}
                            </ScrollView>
                        </Tab>
                        <Tab heading={this.lang.t('people')}>
                            <FlatList
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                style={{flex:1}}
                                onEndReachedThreshold={.5}
                                onEndReached={(d) => {
                                    this.getPeople(true);
                                    return true;
                                }}
                                ref='_flatList'
                                data={this.state.peopleList}
                                extraData={this.state}
                                refreshing={false}

                                keyExtractor={(item, index) => item.id}
                                renderItem={({ item ,index}) => (
                                    <UserList navigation={this.props.navigation} index={index} user={item} listId="peopleList" component={this}/>
                                )}
                            />
                        </Tab>
                        <Tab heading={this.lang.t('posts')} style={{backgroundColor: '#EEEEEE'}}>
                            <FlatList
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                style={{flex:1}}
                                onEndReachedThreshold={.5}
                                onEndReached={(d) => {
                                    this.getFeeds(true);
                                    return true;
                                }}
                                ref='_flatList'
                                data={this.state.feedList}
                                extraData={this.state}
                                refreshing={false}

                                keyExtractor={(item, index) => item.id}
                                renderItem={({ item ,index}) => (
                                    <Feed
                                        component={this}
                                        listId="feedList"
                                        index={index}
                                        navigation={this.props.navigation}
                                        feedType={item.type}
                                        entityTypeId={this.props.userid}
                                        entityType="user"
                                        item={item}/>
                                )}
                            />
                        </Tab>
                        <Tab heading={this.lang.t('groups')}>
                            <FlatList
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                style={{flex:1}}
                                onEndReachedThreshold={.5}
                                onEndReached={(d) => {
                                    this.getGroups(true);
                                    return true;
                                }}
                                ref='_flatList'
                                data={this.state.groupList}
                                extraData={this.state}
                                refreshing={false}

                                keyExtractor={(item, index) => item.id}
                                renderItem={({ item ,index}) => (
                                    <GroupList navigation={this.props.navigation} index={index} group={item}  component={this}/>
                                )}
                            />
                        </Tab>
                        <Tab heading={this.lang.t('pages')}>
                            <FlatList
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                style={{flex:1}}
                                onEndReachedThreshold={.5}
                                onEndReached={(d) => {
                                    this.getGroups(true);
                                    return true;
                                }}
                                ref='_flatList'
                                data={this.state.pageList}
                                extraData={this.state}
                                refreshing={false}

                                keyExtractor={(item, index) => item.id}
                                renderItem={({ item ,index}) => (
                                    <PageList navigation={this.props.navigation} index={index} page={item}  component={this}/>
                                )}
                            />
                        </Tab>
                        <Tab heading={this.lang.t('video')}>
                            <FlatList
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                style={{flex:1}}
                                onEndReachedThreshold={.5}
                                onEndReached={(d) => {
                                    this.getGroups(true);
                                    return true;
                                }}
                                ref='_flatList'
                                data={this.state.videoList}
                                extraData={this.state}
                                refreshing={false}

                                keyExtractor={(item, index) => item.id}
                                renderItem={({ item ,index}) => (
                                    <VideoList navigation={this.props.navigation} index={index} video={item}  component={this}/>
                                )}
                            />
                        </Tab>
                        <Tab heading={this.lang.t('music')}>
                            <FlatList
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                style={{flex:1}}
                                onEndReachedThreshold={.5}
                                onEndReached={(d) => {
                                    this.getGroups(true);
                                    return true;
                                }}
                                ref='_flatList'
                                data={this.state.musicList}
                                extraData={this.state}
                                refreshing={false}

                                keyExtractor={(item, index) => item.id}
                                renderItem={({ item ,index}) => (
                                    <MusicList navigation={this.props.navigation} index={index} music={item}  component={this}/>
                                )}
                            />
                        </Tab>
                        <Tab heading={this.lang.t('marketplace')}>
                            <FlatList
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                style={{flex:1}}
                                onEndReachedThreshold={.5}
                                onEndReached={(d) => {
                                    this.getGroups(true);
                                    return true;
                                }}
                                ref='_flatList'
                                data={this.state.listingList}
                                extraData={this.state}
                                refreshing={false}

                                keyExtractor={(item, index) => item.id}
                                renderItem={({ item ,index}) => (
                                    <MarketplaceList navigation={this.props.navigation} index={index} listing={item}  component={this}/>
                                )}
                            />
                        </Tab>
                        <Tab heading={this.lang.t('event')}>
                            <FlatList
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                style={{flex:1}}
                                onEndReachedThreshold={.5}
                                onEndReached={(d) => {
                                    this.getGroups(true);
                                    return true;
                                }}
                                ref='_flatList'
                                data={this.state.eventList}
                                extraData={this.state}
                                refreshing={false}

                                keyExtractor={(item, index) => item.id}
                                renderItem={({ item ,index}) => (
                                    <EventList navigation={this.props.navigation} index={index} event={item}  component={this}/>
                                )}
                            />
                        </Tab>
                        <Tab heading={this.lang.t('blogs')}>
                            <FlatList
                                scrollEventThrottle={16}
                                overScrollMode="never"
                                style={{flex:1}}
                                onEndReachedThreshold={.5}
                                onEndReached={(d) => {
                                    this.getGroups(true);
                                    return true;
                                }}
                                ref='_flatList'
                                data={this.state.blogList}
                                extraData={this.state}
                                refreshing={false}

                                keyExtractor={(item, index) => item.id}
                                renderItem={({ item ,index}) => (
                                    <BlogList navigation={this.props.navigation} index={index} blog={item}  component={this}/>
                                )}
                            />
                        </Tab>
                    </Tabs>
                ) : null}
            </Container>
        );
    }

    displayAll() {
        let views = [];

        if (this.state.peopleList.length > 0) {
            let peoples = [];
            for(let i=0;i<this.state.peopleList.length;i++) {
                let user = this.state.peopleList[i];
                peoples.push(
                    <UserList navigation={this.props.navigation} index={i} state={this.state} user={user} listId="peopleList" component={this}/>
                );
                if (i > 2) break;//we only need to display 5 items
            }
            views.push(
                <View style={{backgroundColor:'white', marginTop:10, marginBottom:7,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <View style={{flexDirection: 'row',padding:15,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                        <Badge warning style={{width:30,height:30,borderRadius:15}}><Icon name="md-people" style={{color:'white',fontSize:20}} /></Badge>
                        <Text style={{flex:1, marginLeft:10,marginTop:5}}>{this.lang.t('people')}</Text>
                    </View>
                    {peoples}

                    <View style={{flexDirection: 'row',padding:15,borderTopWidth:0.6,borderTopColor:'#EEEEEE'}}>
                        <TouchableOpacity onPress={() => this.goTab(1)}>
                            <Text style={{textAlign: 'center',color:'grey'}}>{this.lang.t('view_all').toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }



        //group
        if (this.state.groupList.length > 0) {
            //console.log('ia dsfds')
            let groups = [];
            for(let i=0;i<this.state.groupList.length;i++) {
                let group = this.state.groupList[i];
                console.log(group);
                groups.push(
                    <GroupList navigation={this.props.navigation} index={i}  group={group} listId="groupList" component={this}/>
                );
                if (i > 2) break;//we only need to display 5 items
            }
            views.push(
                <View style={{backgroundColor:'white', marginTop:10, marginBottom:7,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <View style={{flexDirection: 'row',padding:15,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                        <Badge warning style={{width:30,height:30,borderRadius:15}}><Icon name="md-people" style={{color:'white',fontSize:20}} /></Badge>
                        <Text style={{flex:1, marginLeft:10,marginTop:5}}>{this.lang.t('groups')}</Text>
                    </View>
                    {groups}

                    <View style={{flexDirection: 'row',padding:15,borderTopWidth:0.6,borderTopColor:'#EEEEEE'}}>
                        <TouchableOpacity onPress={() => this.goTab(3)}>
                            <Text style={{textAlign: 'center',color:'grey'}}>{this.lang.t('view_all').toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

        
        //pages
        if (this.state.pageList.length > 0) {
            let pages = [];
            for(let i=0;i<this.state.pageList.length;i++) {
                let page = this.state.pageList[i];
                pages.push(
                    <PageList navigation={this.props.navigation} index={i}  page={page} listId="pageList" component={this}/>
                );
                if (i > 2) break;//we only need to display 5 items
            }
            views.push(
                <View style={{backgroundColor:'white', marginTop:10, marginBottom:7,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <View style={{flexDirection: 'row',padding:15,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                        <Badge warning style={{width:30,height:30,borderRadius:15}}><Icon name="ios-document" style={{color:'white',fontSize:20}} /></Badge>
                        <Text style={{flex:1, marginLeft:10,marginTop:5}}>{this.lang.t('pages')}</Text>
                    </View>
                    {pages}

                    <View style={{flexDirection: 'row',padding:15,borderTopWidth:0.6,borderTopColor:'#EEEEEE'}}>
                        <TouchableOpacity onPress={() => this.goTab(4)}>
                            <Text style={{textAlign: 'center',color:'grey'}}>{this.lang.t('view_all').toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

        //video
        if (this.state.videoList.length > 0) {
            let videos = [];
            for(let i=0;i<this.state.videoList.length;i++) {
                let video = this.state.videoList[i];
                videos.push(
                    <VideoList navigation={this.props.navigation} index={i}  video={video} listId="videoList" component={this}/>
                );
                if (i > 2) break;//we only need to display 5 items
            }
            views.push(
                <View style={{backgroundColor:'white', marginTop:10, marginBottom:7,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <View style={{flexDirection: 'row',padding:15,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                        <Badge warning style={{width:30,height:30,borderRadius:15}}><Icon name="ios-videocam" style={{color:'white',fontSize:20}} /></Badge>
                        <Text style={{flex:1, marginLeft:10,marginTop:5}}>{this.lang.t('videos')}</Text>
                    </View>
                    {videos}

                    <View style={{flexDirection: 'row',padding:15,borderTopWidth:0.6,borderTopColor:'#EEEEEE'}}>
                        <TouchableOpacity onPress={() => this.goTab(5)}>
                            <Text style={{textAlign: 'center',color:'grey'}}>{this.lang.t('view_all').toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

        if (this.state.musicList.length > 0) {
            let musics = [];
            for(let i=0;i<this.state.musicList.length;i++) {
                let music = this.state.musicList[i];
                musics.push(
                    <MusicList navigation={this.props.navigation} index={i}  music={music} listId="musicList" component={this}/>
                );
                if (i > 2) break;//we only need to display 5 items
            }
            views.push(
                <View style={{backgroundColor:'white', marginTop:10, marginBottom:7,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <View style={{flexDirection: 'row',padding:15,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                        <Badge warning style={{width:30,height:30,borderRadius:15}}><Icon name="ios-musical-notes" style={{color:'white',fontSize:20}} /></Badge>
                        <Text style={{flex:1, marginLeft:10,marginTop:5}}>{this.lang.t('musics')}</Text>
                    </View>
                    {musics}

                    <View style={{flexDirection: 'row',padding:15,borderTopWidth:0.6,borderTopColor:'#EEEEEE'}}>
                        <TouchableOpacity onPress={() => this.goTab(6)}>
                            <Text style={{textAlign: 'center',color:'grey'}}>{this.lang.t('view_all').toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }


        //marketplace
        if (this.state.listingList.length > 0) {
            let listings = [];
            for(let i=0;i<this.state.listingList.length;i++) {
                let listing = this.state.listingList[i];
                listings.push(
                    <MarketplaceList navigation={this.props.navigation} index={i}  listing={listing} listId="listingList" component={this}/>
                );
                if (i > 2) break;//we only need to display 5 items
            }
            views.push(
                <View style={{backgroundColor:'white', marginTop:10, marginBottom:7,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <View style={{flexDirection: 'row',padding:15,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                        <Badge warning style={{width:30,height:30,borderRadius:15}}><Icon name="ios-list" style={{color:'white',fontSize:20}} /></Badge>
                        <Text style={{flex:1, marginLeft:10,marginTop:5}}>{this.lang.t('listings')}</Text>
                    </View>
                    {listings}

                    <View style={{flexDirection: 'row',padding:15,borderTopWidth:0.6,borderTopColor:'#EEEEEE'}}>
                        <TouchableOpacity onPress={() => this.goTab(7)}>
                            <Text style={{textAlign: 'center',color:'grey'}}>{this.lang.t('view_all').toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

        //event
        if (this.state.eventList.length > 0) {
            let events = [];
            for(let i=0;i<this.state.eventList.length;i++) {
                let event = this.state.eventList[i];
                events.push(
                    <EventList navigation={this.props.navigation} index={i}  event={event} listId="eventList" component={this}/>
                );
                if (i > 2) break;//we only need to display 5 items
            }
            views.push(
                <View style={{backgroundColor:'white', marginTop:10, marginBottom:7,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <View style={{flexDirection: 'row',padding:15,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                        <Badge warning style={{width:30,height:30,borderRadius:15}}><Icon name="ios-calendar" style={{color:'white',fontSize:20}} /></Badge>
                        <Text style={{flex:1, marginLeft:10,marginTop:5}}>{this.lang.t('events')}</Text>
                    </View>
                    {events}

                    <View style={{flexDirection: 'row',padding:15,borderTopWidth:0.6,borderTopColor:'#EEEEEE'}}>
                        <TouchableOpacity onPress={() => this.goTab(8)}>
                            <Text style={{textAlign: 'center',color:'grey'}}>{this.lang.t('view_all').toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }


        if (this.state.blogList.length > 0) {
            let blogs = [];
            for(let i=0;i<this.state.blogList.length;i++) {
                let blog = this.state.blogList[i];
                blogs.push(
                    <BlogList navigation={this.props.navigation} index={i}  blog={blog} listId="blogList" component={this}/>
                );
                if (i > 2) break;//we only need to display 5 items
            }
            views.push(
                <View style={{backgroundColor:'white', marginTop:10, marginBottom:7,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <View style={{flexDirection: 'row',padding:15,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                        <Badge warning style={{width:30,height:30,borderRadius:15}}><Icon name="ios-document" style={{color:'white',fontSize:20}} /></Badge>
                        <Text style={{flex:1, marginLeft:10,marginTop:5}}>{this.lang.t('blogs')}</Text>
                    </View>
                    {blogs}

                    <View style={{flexDirection: 'row',padding:15,borderTopWidth:0.6,borderTopColor:'#EEEEEE'}}>
                        <TouchableOpacity onPress={() => this.goTab(3)}>
                            <Text style={{textAlign: 'center',color:'grey'}}>{this.lang.t('view_all').toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        
        return (
            <View>{views}</View>
        )
    }

    goTab(tab) {
        this.updateState({activeTab : tab});
    }
}


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(Search)