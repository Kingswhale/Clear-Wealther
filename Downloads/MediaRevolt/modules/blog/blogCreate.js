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

class BlogCreate extends BaseComponent {
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
            tags : '',
            privacy : '1',
            status : '1',
            image : null,
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
        formData.append("content", this.state.content);
        formData.append("privacy", this.state.privacy);
        formData.append("tags", this.state.tags);
        formData.append("status", this.state.status);
        formData.append("category_id", this.state.category);
        if (this.state.image !== null) {
            formData.append('image', {
                uri: this.state.image.path,
                type: this.state.image.mime, // or photo.type
                name: this.state.image.path
            });

        }
        if (this.type === 'new') {
            Api.post("blog/add",formData).then((res) => {
                this.updateState({
                    processing: false
                });
                if (res.status === 1) {
                    this.props.component.refs.createModal.close();
                    this.props.component.finishedCreate(res);
                    Toast.show({
                        text: this.lang.t('blog_added_success'),
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
            Api.post("blog/edit",formData).then((res) => {
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
        Api.get("blog/categories", {userid : this.props.userid}).then((res) => {
            let selectedCategory = '';
            if (res.length > 0) selectedCategory = res[0].id;
            this.updateState({categories : res, category: selectedCategory});
        }).catch((e) => {
            this.updateState({categories:[]})
        });
    }

    loadItemDetail() {
        Api.get("blog/view",{
            userid : this.props.userid,
            blog_id : this.itemId
        }).then((res) => {
            this.updateState({
                title : res.title,
                content : res.content,
                privacy : res.privacy,
                tags : res.tags,
                category : res.category,
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
                                        this.props.component.refs.createModal.close();
                                    }}
                                    transparent>
                                    <Icon name="ios-arrow-round-back"/>
                                </Button>
                            </Left>
                            <Body>
                                <Text style={{color: 'white'}}>
                                    {this.type === 'new' ? this.lang.t('new_blog').toUpperCase() : this.lang.t('edit_blog').toUpperCase()}
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

                                <View style={{margin:15,marginRight:0}} >
                                    <Label>{this.lang.t('content')}</Label>
                                    <Textarea bordered multiline={true} rowSpan={8} onChangeText={(text) => this.updateState({content : text})} value={this.state.content}/>
                                </View>


                                <Item floatingLabel>
                                    <Label>{this.lang.t('tags')}</Label>
                                    <Input onChangeText={(text) => this.updateState({tags : text})} value={this.state.tags} />
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
                                        <Label>{this.lang.t('preview_image')}</Label>
                                    </Left>
                                    <Right>
                                        {this.state.image === null ? (
                                            <Button onPress={() => {
                                                ImagePicker.openPicker({}).then(image => {
                                                    this.updateState({
                                                        image: image
                                                    });
                                                });
                                            }} light small>
                                                <Text style={{marginLeft:20, marginRight:20}}>{this.lang.t('choose_image')}</Text>
                                            </Button>
                                        ) : (<Button onPress={() => {
                                            ImagePicker.openPicker({}).then(image => {
                                                this.updateState({
                                                    image: image
                                                });
                                            });
                                        }} primary small>
                                            <Text style={{marginLeft:20, marginRight:20,color:'white'}}>{this.lang.t('choose_image')}</Text>
                                        </Button>)}
                                    </Right>
                                </Item>

                                <Item picker style={{marginBottom: 20,marginLeft:20}}>
                                    <Left>
                                        <Label>{this.lang.t('status')}</Label>
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

                                            selectedValue={this.state.status}
                                            onValueChange={(val) => this.updateState({status: val})}
                                        >
                                            <Picker.Item label={this.lang.t('published')} value="1" />
                                            <Picker.Item label={this.lang.t('draft')} value="0" />
                                        </Picker>
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
})(BlogCreate)