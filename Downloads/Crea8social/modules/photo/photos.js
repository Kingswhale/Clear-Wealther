import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";
import {Text, View, Image, ActivityIndicator,StyleSheet,Alert,TouchableOpacity} from 'react-native';
import {
    Tabs,
    Tab,
    Container,
    Header,
    Icon,
    Left, Right, Button, Body, Title, Toast,ListItem
} from 'native-base';
import GridView from 'react-native-super-grid';
import EmptyComponent from "../../utils/EmptyComponent";
import FastImage from 'react-native-fast-image'
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../../api";

class Photos extends BaseComponent {
    photosOffset = 0;
    limit = 20;
    constructor(props) {
        super(props);
        this.state.processing = false;

        this.fetchPhotos(false);
    }

    fetchPhotos(type) {
        let pageOffset = this.photosOffset;
        this.photosOffset = pageOffset + this.limit;

        Api.get("photos", {
            offset : pageOffset,
            userid : this.props.userid,
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
        }).catch((e) => {
            //console.log(e)
        })
    }

    handlerPhotoRefresh() {
        this.photosOffset = 0;
        this.fetchPhotos(false);
    }


    render() {
        //console.log(this.props.photos);
        return (
            <Container>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
                <Header hasTabs noShadow>
                    <Left>
                        <Button transparent onPress={() => {
                            this.props.navigation.goBack()
                        }}>
                            <Icon name="ios-arrow-round-back" style={{color:'white'}}/>
                        </Button>
                    </Left>
                    <Body>
                    <Title><Text>{this.lang.t('photos')}</Text></Title>
                    </Body>
                    <Right/>

                </Header>

                <GridView
                    itemDimension={130}
                    style={{flex: 1,marginTop:10}}
                    items={this.state.itemLists}
                    onScroll={this.onScroll.bind(this)}
                    onEndReachedThreshold={.5}
                    onEndReached={(d) => {
                        //this.fetchRequests();
                        if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
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


            </Container>
        );
    }

    async uploadPhotos(images) {
        this.updateState({processing: true});
        let results = [];
        for(let i = 0;i<images.length;i++) {
            let res = await uploadPhotoAlbum({
                userid : this.props.userid,
                albumId : this.albumId,
                path : images[i].path,
                mime : images[i].mime
            }).then((res) => {
                console.log("Updload done first");
                return res;
            });
            results.push(res)
        }

        let lists = [];
        lists.push(...results);
        lists.push(...this.state.itemLists);
        console.log(lists);
        console.log("Updload done");
        this.updateState({itemLists : lists});

        this.updateState({processing: false});
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
        photos : state.user.photos,
        actionDone : state.user.actionDone
    }
})(Photos)