import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";
import {Text, View, Image, ActivityIndicator,TouchableOpacity} from 'react-native';
import {
    Tabs,
    Tab,
    Container,
    Header,
    Left,Right,Segment,Button,Body,CardItem,Card,Icon
} from 'native-base';
import GridView from 'react-native-super-grid';
import EmptyComponent from "../../utils/EmptyComponent";
import FastImage from 'react-native-fast-image';
import Util from "../../utils/Util";
import {getProfileAlbums, getProfilePhotos} from "../user/store";

class ProfilePhotos extends BaseComponent {
    photosOffset = 0;
    limit = 10;
    albumsOffset = 0;
    constructor(props) {
        super(props);

        this.profileDetails = this.props.profileDetails;
        this.userid = this.props.theUserid;
        this.state.currentPage = "all";

        this.state.albumLists = [];
        this.fetchPhotos(false);
    }

    onScroll(event) {
        return this.props.component.onScroll(event)
    }

    fetchPhotos(type) {
        let pageOffset = this.photosOffset;
        this.photosOffset = pageOffset + this.limit;
        getProfilePhotos({
            offset : pageOffset,
            userid : this.props.userid,
            theUserid : this.userid,
            limit : this.limit
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

        });
    }

    handlerPhotoRefresh() {
        this.photosOffset = 0;
        this.fetchPhotos(false);
    }


    fetchAlbums(type) {
        let pageOffset = this.albumsOffset;
        this.albumsOffset = pageOffset + this.limit;

        getProfileAlbums({
            offset : pageOffset,
            userid : this.props.userid,
            theUserid : this.userid,
            limit : this.limit
        }).then((res) => {

            if (res.length  > 0) {
                if (type) {
                    //more
                    let lists = [];
                    lists.push(...this.state.albumLists);
                    lists.push(...res);

                    this.updateState({albumLists: lists,fetchFinished: true})
                } else {
                    //refresh
                    this.updateState({albumLists: res,fetchFinished: true})
                }
            } else {
                this.updateState({itemListNotEnd: true,fetchFinished: true})
            }
        });
    }

    handlerAlbumRefresh() {
        this.albumsOffset = 0;
        this.fetchAlbums(false);
    }

    refreshAlbum() {
        this.albumsOffset = 0;
        this.fetchAlbums(false);
    }

    render() {
       return (
           <Container style={{flex: 1}}>
               <Header hasSegment style={{backgroundColor: 'white',borderBottomColor: '#EEEEEE',borderBottomWidth: 0.4}}>
                   <Left/>
                   <Body>
                   <Segment style={{backgroundColor: 'white',bottom:4}}>
                       <Button
                           onPress={() => {
                               this.photosOffset = 0;
                               this.fetchPhotos(false);
                               this.updateState({
                                   currentPage : 'all',
                                   itemListNotEnd: false,
                                   fetchFinished : false
                               });
                           }}
                           first active bordered dark style={{paddingLeft: 10,paddingRight: 10}}>
                           <Text>{this.lang.t('all_photos')}</Text>
                       </Button>
                       <Button
                           onPress={() => {
                               this.albumsOffset = 0;
                               this.fetchAlbums(false);
                               this.updateState({
                                   currentPage : 'albums',
                                   itemListNotEnd: false,
                                   fetchFinished : false

                               });
                           }}
                           last bordered dark style={{paddingLeft: 10,paddingRight: 10}}>
                           <Text>{this.lang.t('albums')}</Text>
                       </Button>
                   </Segment>
                   </Body>
                   <Right>
                       {this.userid === this.props.userid && this.state.currentPage === 'albums'  ? (
                           <Button
                               onPress={() => {
                                    this.props.component.showCreateAlbumm();
                               }}
                               primary small style={{bottom: 4}}>
                               <Icon name="ios-add"/>
                           </Button>
                       ) : null}
                   </Right>

               </Header>
               {this.state.currentPage === 'all' ? (
                   <GridView
                       itemDimension={130}
                       style={{flex: 1, marginBottom: 80}}
                       items={this.state.itemLists}
                       onScroll={this.onScroll.bind(this)}
                       onEndReachedThreshold={.5}
                       onEndReached={(d) => {
                           if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                               this.updateState({
                                   itemListNotEnd: false,
                                   fetchFinished : false
                               });
                               this.fetchPhotos(true);
                           }
                           return true;
                       }}
                       ref='_flatList'
                       extraData={this.state}
                       refreshing={this.state.refreshing}
                       onRefresh={() => {
                           this.handlerPhotoRefresh();
                       }}
                       keyExtractor={(item, index) => item.id}
                       ListEmptyComponent={!this.state.fetchFinished ? (<Text/>) : (
                           <EmptyComponent text={this.lang.t('no_photos_found')} iconType="Ionicons" icon="ios-images-outline"/>
                       )}
                       ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                           {(!this.state.fetchFinished) ? (
                               <ActivityIndicator size='large' />
                           ) : null}

                       </View>}
                       renderItem={item => (
                           <View style={{height: 130,padding:0}}>
                               <TouchableOpacity onPress={() => {
                                   this.launchPhotoViewer(item.path);
                               }}>
                                   <FastImage style={{width:'100%',height:130,resizeMode: 'cover'}} source={{uri : item.path}}/>
                               </TouchableOpacity>
                           </View>
                       )}
                   />
               )  : (
                   <GridView
                       itemDimension={130}
                       style={{flex: 1, marginBottom: 100}}
                       items={this.state.albumLists}
                       onScroll={this.onScroll.bind(this)}
                       onEndReachedThreshold={.5}
                       onEndReached={(d) => {
                           //this.fetchRequests();
                           if (this.state.albumLists.length > 0 && !this.state.itemListNotEnd) {
                               this.updateState({
                                   itemListNotEnd: false,
                                   fetchFinished : false
                               });
                               this.fetchAlbums(true);
                           }
                           return true;
                       }}
                       ref='_flatList'
                       extraData={this.state}
                       refreshing={this.state.refreshing}
                       onRefresh={() => {
                           this.handlerAlbumRefresh();
                       }}
                       keyExtractor={(item, index) => item.id}
                       ListEmptyComponent={!this.state.fetchFinished ? (<Text/>) : (
                           <EmptyComponent text={this.lang.t('no_albums_found')} iconType="Ionicons" icon="ios-albums-outline"/>
                       )}
                       ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                           {(!this.state.fetchFinished) ? (
                               <ActivityIndicator size='large' />
                           ) : null}

                       </View>}
                       renderItem={item => (
                           <TouchableOpacity onPress={() => {
                               this.props.navigation.push("albumPhotos", {
                                   theUserid : this.userid,
                                   albumId : item.id,
                                   albumTitle : item.title,
                                   component : this
                               });
                           }}>
                               <Card  style={{height: 180,padding:0,overflow:'hidden'}}>
                                   <FastImage style={{width:'100%',height:130,resizeMode: 'cover'}} source={{uri : item.image}}/>
                                   <CardItem footer bordered>
                                       <Text>{Util.getAlbumTitle(item.title)}</Text>
                                   </CardItem>
                               </Card>
                           </TouchableOpacity>
                       )}
                   />
               )}
           </Container>
       ) ;
    }

    launchPhotoViewer(image) {
        let images = [];
        for(let i = 0;i<this.state.itemLists.length;i++) {
            images.push(this.state.itemLists[i].path);
        }
        this.props.navigation.push("photoViewer", {
            photos : images,
            selected : image
        });
    }
}


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        fetchFinished: state.user.fetchFinished,
        pageEndReached : state.user.pageEndReached,
    }
})(ProfilePhotos)