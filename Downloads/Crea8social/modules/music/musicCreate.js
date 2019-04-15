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
    Textarea,
    Title,Toast
} from 'native-base';
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../../api";
import ImagePicker from 'react-native-image-crop-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

class MusicCreate extends BaseComponent {
    constructor(props) {
        super(props);

        this.type = this.props.type;
        this.itemId = this.props.itemId;
        this.preSetData = false;
        //this is to make sure we are not coping data from preview state

        this.state = {
            ...this.state,
            isNew : (this.type === 'new'),
            title : '',
            content : '',
            category : '',
            categories : [],
            album : '',
            artist : '',
            privacy : '1',
            music : null,
            cover : null,
            processing : false,
            dataLoaded : false
        };

        if (this.type === 'edit') {
            this.loadItemDetail();
        }

        this.loadItemCategories();

    }

    submitData() {
        if (this.state.title === '') {
            Toast.show({
                text : this.lang.t('provide_a_title'),
                type : 'danger'
            });
            return false;
        }
        if (this.state.category === '') {
            Toast.show({
                text : this.lang.t('choose_a_category'),
                type : 'danger'
            });
            return false;
        }
        this.updateState({
            processing: true
        });
        let formData = new FormData();
        formData.append("userid", this.props.userid);
        formData.append("title", this.state.title);
        //formData.append("description", this.state.content);
        formData.append("privacy", this.state.privacy);
        formData.append("album", this.state.album);
        formData.append("artist", this.state.artist);
        formData.append("category_id", this.state.category);
        if (this.state.music !== null) {
            formData.append('music_file', {
                uri: this.state.music.uri,
                type: this.state.music.type, // or photo.type
                name: this.state.music.fileName
            });

        }

        if (this.state.cover !== null) {
            formData.append('cover_art', {
                uri: this.state.cover.path,
                type: this.state.cover.mime, // or photo.type
                name: this.state.cover.path
            });
        }
        if (this.type === 'new') {
            Api.post("music/create",formData).then((res) => {
                this.updateState({
                    processing: false
                });
                if (res.status === 1) {
                    this.props.component.refs.createModal.close();
                    this.props.component.finishedCreate(res);
                    Toast.show({
                        text: this.lang.t('music_added_success'),
                        type : 'success'
                    });
                } else {
                    Toast.show({
                        text: res.message,
                        type : 'danger'
                    })
                }
            }).catch((e) => {
                this.updateState({
                    processing: false
                });
                Toast.show({
                    text: this.lang.t('internet_problem'),
                    type : 'danger'
                })
            })
        } else {
            formData.append("id", this.itemId);
            Api.post("music/edit",formData).then((res) => {
                this.updateState({
                    processing: false
                });
                if (res.status === 1) {
                    this.props.component.refs.createModal.close();
                    this.props.component.finishedEdit(res);
                    Toast.show({
                        text: this.lang.t('saved_success'),
                        type : 'success'
                    });
                } else {
                    Toast.show({
                        text: res.message,
                        type : 'danger'
                    })
                }
            }).catch((e) => {
                this.updateState({
                    processing: false
                });
                Toast.show({
                    text: this.lang.t('internet_problem'),
                    type : 'danger'
                })
            });

        }
    }

    loadItemCategories() {
        Api.get("music/get/categories", {userid : this.props.userid}).then((res) => {
            let selectedCategory = '';
            if (res.length > 0) selectedCategory = res[0].id;
            this.updateState({categories : res, category: selectedCategory});
        }).catch((e) => {
            this.updateState({categories:[{id:'all',title: 'All'},{id:'dummy',title: 'Dummies'}, {id:23, title:'Entertainment'}]})
        });
    }

    loadItemDetail() {

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
                                        this.props.component.refs.createModal.close();
                                    }}
                                    transparent>
                                    <Icon name="ios-arrow-round-back"/>
                                </Button>
                            </Left>
                            <Body>
                                <Text style={{color: 'white'}}>
                                    {this.type === 'new' ? this.lang.t('new_music').toUpperCase() : this.lang.t('edit_music').toUpperCase()}
                                    </Text>
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
                                <Item floatingLabel>
                                    <Label>{this.lang.t('title')}</Label>
                                    <Input onChangeText={(text) => this.updateState({title : text})} value={this.state.title} />
                                </Item>

                                <Item floatingLabel>
                                    <Label>{this.lang.t('artist')}</Label>
                                    <Input onChangeText={(text) => this.updateState({artist : text})} value={this.state.artist} />
                                </Item>
                                <Item floatingLabel>
                                    <Label>{this.lang.t('album')}</Label>
                                    <Input onChangeText={(text) => this.updateState({album : text})} value={this.state.album} />
                                </Item>



                                <Item picker style={{marginBottom: 20,marginLeft:20}}>
                                    <Left>
                                        <Label>{this.lang.t('category')}</Label>
                                    </Left>
                                    <Right>
                                        {this.listCategories()}
                                    </Right>
                                </Item>

                                <Item picker style={{marginBottom: 20,marginLeft:20}}>
                                    <Left>
                                        <Label>{this.lang.t('cover_art')}</Label>
                                    </Left>
                                    <Right>
                                        {this.state.image === null ? (
                                            <Button onPress={() => {
                                                ImagePicker.openPicker({mediaType : 'image'}).then(image => {
                                                    this.updateState({
                                                        cover : image
                                                    });
                                                });
                                            }} light small>
                                                <Text style={{marginLeft:20, marginRight:20}}>{this.lang.t('choose_image')}</Text>
                                            </Button>
                                        ) : (<Button onPress={() => {
                                            ImagePicker.openPicker({mediaType : 'image'}).then(image => {
                                                this.updateState({
                                                    cover: image
                                                });
                                            });
                                        }} primary small>
                                            <Text style={{marginLeft:20, marginRight:20,color:'white'}}>{this.lang.t('choose_image')}</Text>
                                        </Button>)}
                                    </Right>
                                </Item>

                                <Item picker style={{marginBottom: 20,marginLeft:20}}>
                                    <Left>
                                        <Label>{this.lang.t('music_file')}</Label>
                                    </Left>
                                    <Right>
                                        {this.state.image === null ? (
                                            <Button onPress={() => {
                                                DocumentPicker.show({
                                                    filetype: [DocumentPickerUtil.audio()],
                                                },(error,res) => {
                                                    // Android
                                                    this.updateState({
                                                        music: res
                                                    });
                                                });
                                            }} light small>
                                                <Text style={{marginLeft:20, marginRight:20}}>{this.lang.t('choose_music')}</Text>
                                            </Button>
                                        ) : (<Button onPress={() => {
                                            DocumentPicker.show({
                                                filetype: [DocumentPickerUtil.audio()],
                                            },(error,res) => {
                                                // Android
                                                this.updateState({
                                                    music: res
                                                });
                                            });
                                        }} primary small>
                                            <Text style={{marginLeft:20, marginRight:20,color:'white'}}>{this.lang.t('choose_music')}</Text>
                                        </Button>)}
                                    </Right>
                                </Item>

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

    listCategories() {
        let pickers = [];
        for(let i=0;i<this.state.categories.length;i++) {
            pickers.push(<Picker.Item label={this.state.categories[i].title} value={this.state.categories[i].id} />)
        }
        return (<Picker
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

            selectedValue={this.state.category}
            onValueChange={(val) => this.updateState({category: val})}
        >
            {pickers}
        </Picker>)
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
})(MusicCreate)