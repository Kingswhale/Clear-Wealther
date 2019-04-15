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
import Util from "../../utils/Util";
import {Menu,MenuTrigger,MenuOptions,renderers,MenuProvider} from 'react-native-popup-menu';
import Modal from 'react-native-modalbox';
import AlbumCreate from './albumCreate';
import ImagePicker from 'react-native-image-crop-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import {deleteAlbum, getAlbumPhotos, uploadPhotoAlbum} from "../user/store";

class AlbumPhotos extends BaseComponent {
    photosOffset = 0;
    limit = 20;
    constructor(props) {
        super(props);
        //this.profileDetails = this.props.profileDetails;
        this.userid = this.props.navigation.getParam("theUserid");
        this.albumId = this.props.navigation.getParam("albumId");
        this.albumTitle = this.props.navigation.getParam("albumTitle");
        this.component = this.props.navigation.getParam("component");

        this.state.processing = false;

        this.fetchPhotos(false);
    }

    fetchPhotos(type) {
        let pageOffset = this.photosOffset;
        this.photosOffset = pageOffset + this.limit;

        getAlbumPhotos({
            offset : pageOffset,
            userid : this.props.userid,
            albumId : this.albumId,
            theUserid : this.userid,
            type : type,
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
        })
    }

    handlerPhotoRefresh() {
        this.photosOffset = 0;
        this.fetchPhotos(false);
    }

    hideCreateAlbum(title) {
        this.albumTitle = title;
        this.refs.albumModal.close();

    }

    render() {
        //console.log(this.props.photos);
        return (
            <MenuProvider customStyles={menuProviderStyles}>
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
                        <Title><Text>{Util.getAlbumTitle(this.albumTitle)}</Text></Title>
                        </Body>
                        {this.userid === this.props.userid && Util.albumEditable(this.albumTitle) ? (
                            <Right>
                                <Button
                                    onPress={() => {
                                        ImagePicker.openPicker({
                                            multiple: true
                                        }).then(images => {
                                            //console.log(images);
                                            this.uploadPhotos(images)
                                        });
                                    }}
                                    transparent>
                                    <Icon name="cloud-upload" type="SimpleLineIcons" style={{color: 'grey',fontSize:17}}/>
                                </Button>
                                <Button transparent onPress={() => {
                                    this.menu.open();
                                }}>
                                    <Icon name="options-vertical" type="SimpleLineIcons" style={{color: 'grey',fontSize:17,marginLeft:10}}/>
                                </Button>
                            </Right>
                        ) : null}
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

                    <Menu ref={(c) => this.menu = c} renderer={renderers.SlideInMenu}>
                        <MenuTrigger>

                        </MenuTrigger>
                        <MenuOptions>
                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                this.refs.albumModal.open();
                            }}>
                                <Left><Icon active name="pencil" type="SimpleLineIcons" style={{color:'#2196F3', fontSize: 15}} /></Left>
                                <Body><Text>{this.lang.t('edit_album')}</Text></Body>
                            </ListItem>

                            <ListItem noBorder icon onPress={()=>{
                                this.menu.close();
                                Alert.alert(
                                    this.lang.t('do_you_delete_album'),
                                    '',
                                    [
                                        {text: this.lang.t('cancel'), onPress: () => {

                                            }, style: 'cancel'},
                                        {text: this.lang.t('yes'), onPress: () => {
                                                this.deleteAlbum();
                                            }},
                                    ],
                                    { cancelable: true }
                                );
                            }}>
                                <Left><Icon active name="trash" type="SimpleLineIcons" style={{color:'#F44336', fontSize: 15}} /></Left>
                                <Body><Text>{this.lang.t('delete_album')}</Text></Body>
                            </ListItem>
                        </MenuOptions>
                    </Menu>

                    <Modal
                        ref={"albumModal"}
                        coverScreen={false}
                        entry="top"
                        backButtonClose={true}
                        swipeToClose={false}
                        backdropPressToClose={false}
                        onClosingState={this.onClosingState}
                        >
                        <AlbumCreate navigation={this.props.navigation} type="edit" albumId={this.albumId} component={this}/>
                    </Modal>
                </Container>
            </MenuProvider>
        );
    }

    deleteAlbum() {
        deleteAlbum({
            userid : this.props.userid,
            albumId : this.albumId
        });
        //we can go back
        this.props.navigation.goBack();
        this.component.refreshAlbum();
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
        fetchFinished: state.user.fetchFinished,
        pageEndReached : state.user.pageEndReached,
        photos : state.user.photos,
        actionDone : state.user.actionDone
    }
})(AlbumPhotos)