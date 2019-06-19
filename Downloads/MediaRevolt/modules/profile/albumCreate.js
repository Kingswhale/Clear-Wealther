import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {
    Text,
    ActivityIndicator,
    TouchableOpacity,
    View} from 'react-native';
import {
    Button,
    Container,
    Header,
    Left,
    Right,
    Body,
    Icon,
    Content,
    Item,
    Input,
    Label,
    Form,
    Picker,
    Textarea
} from 'native-base';
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import {createAlbum, loadAlbumDetails, saveAlbum} from "../user/store";

class AlbumCreate extends BaseComponent {
    constructor(props) {
        super(props);

        this.type = this.props.type;
        this.albumId = this.props.albumId;
        this.preSetData = false;
        //this is to make sure we are not coping data from preview state

        this.state = {
            ...this.state,
            isNew : (this.type === 'new'),
            title : '',
            description : '',
            privacy : '1',
            processing : false,
            dataLoaded : false
        };

        if (this.type === 'edit') {
            this.loadAlbumDetail();
        }

    }

    submitData() {
        this.updateState({
            processing: true
        });
        if (this.type === 'new') {
            createAlbum({
                name : this.state.title,
                description : this.state.description,
                privacy : this.state.privacy,
                userid : this.props.userid,
            }).then((res) => {
                this.props.component.hideCreateAlbum();
                setTimeout(() => {
                    this.updateState({
                        processing: true
                    });
                    this.props.navigation.push("albumPhotos", {
                        theUserid : this.props.userid,
                        albumId : res.album_id,
                        albumTitle : this.state.title
                    });
                }, 300)
            });
        } else {
            saveAlbum({
                name : this.state.title,
                description : this.state.description,
                privacy : this.state.privacy,
                userid : this.props.userid,
                albumId : this.albumId
            }).then((res) => {
                this.props.component.hideCreateAlbum(this.state.title);
            });

        }
    }

    onValueChange(value: string) {
        this.updateState({
            privacy: value
        });
    }

    loadAlbumDetail() {
        loadAlbumDetails({
            userid : this.props.userid,
            albumId : this.albumId
        }).then((res) => {
            this.updateState({
                title : res.title,
                description : res.description,
                privacy : res.privacy,
                dataLoaded: true
            });
        })

    }

    render() {


        return (
            <Container>
                {this.type === 'edit' && !this.state.dataLoaded ? (
                    <View style={{flex:1,flexDirection:'column', justifyContent : 'space-between'}}>
                        <Text/>
                        <ActivityIndicator size='large' style={{marginTop:200}} />
                    </View>
                ) : (
                    <Container>
                        <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
                        <Header noShadow hasTabs>
                            <Left>
                                <Button
                                    onPress={() => {
                                        this.props.component.hideCreateAlbum();
                                    }}
                                    transparent>
                                    <Icon name="ios-arrow-round-back"/>
                                </Button>
                            </Left>
                            <Body>
                                <Text style={{color: 'white'}}>{this.type === 'new' ? this.lang.t('create_new_album') : this.lang.t('edit_album')}</Text>
                            </Body>
                            <Right>
                                <Button
                                    onPress={() => {
                                        this.submitData();
                                    }}
                                    transparent>
                                    <Text style={{color: 'white'}}>{this.lang.t((this.type === 'new') ? 'create' : 'save').toUpperCase()}</Text>
                                </Button>
                            </Right>
                        </Header>

                        <Content >
                            <Form style={{flex: 1,margin:20}}>
                                <Item style={{marginBottom: 20}}>
                                    <Input
                                        onChangeText={(text) => this.updateState({title : text})}
                                        value={this.state.title}
                                        placeholder={this.lang.t('album_title')} />
                                </Item>

                                <View style={{margin:15,marginRight:0}} >
                                    <Label>{this.lang.t('description')}</Label>
                                    <Textarea
                                        bordered multiline={true} rowSpan={5}
                                        onChangeText={(text) => this.updateState({description: text})}
                                        value={this.state.description}
                                         placeholder={this.lang.t('album_description')} />
                                </View>


                                <Item picker style={{marginBottom: 20,marginLeft:20}}>
                                    <Left>
                                        <Label>{this.lang.t('privacy')}</Label>
                                    </Left>
                                    <Right>
                                        <Picker
                                            renderHeader={backAction =>
                                                <Header noShadow hasTabs style={{ backgroundColor: "#E9E7E9" }}>
                                                    <Left>
                                                        <Button transparent onPress={backAction}>
                                                            <Icon name="ios-arrow-round-back" style={{ color: "grey" }} />
                                                        </Button>
                                                    </Left>
                                                    <Body style={{ flex: 3 }}>
                                                    <Title style={{color: 'grey'}}/>
                                                    </Body>
                                                    <Right />
                                                </Header>}
                                            mode="dropdown"
                                            iosIcon={<Icon name="ios-arrow-down-outline" />}
                                            style={{ width: 150 }}

                                            selectedValue={this.state.privacy}
                                            onValueChange={(val) => this.updateState({privacy: val})}
                                        >
                                            <Picker.Item label={this.lang.t('public')} value="1" />
                                            <Picker.Item label={this.lang.t('friends_followers')} value="2" />
                                            <Picker.Item label={this.lang.t('only_me')} value="3" />

                                        </Picker>
                                    </Right>
                                </Item>

                            </Form>
                        </Content>
                    </Container>
                )}
            </Container>
        );
    }
}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        albumDetails : state.user.albumDetails,
        actionDone : state.user.actionDone
    }
})(AlbumCreate)