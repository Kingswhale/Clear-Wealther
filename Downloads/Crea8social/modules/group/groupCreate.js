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

class GroupCreate extends BaseComponent {
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
            description : '',
            category : '',
            categories : [],
            name : '',
            privacy : '1',
            processing : false,
            dataLoaded : false
        };

        if (this.type === 'edit') {

        }

        this.loadItemCategories();

    }

    componentDidMount() {
        this.loadItemDetail();
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
        formData.append("description", this.state.description);
        formData.append("privacy", this.state.privacy);
        //formData.append("name", this.state.name);
        formData.append("category_id", this.state.category);

        if (this.type === 'new') {
            Api.post("group/create",formData).then((res) => {
                this.updateState({
                    processing: false
                });
                if (res.status === 1) {
                    this.props.component.refs.createModal.close();
                    this.props.component.finishedCreate(res);
                    Toast.show({
                        text: this.lang.t('group_added_success'),
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
            formData.append("group_id", this.itemId);
            Api.post("group/edit",formData).then((res) => {
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
        Api.get("group/get/categories", {userid : this.props.userid}).then((res) => {
            let selectedCategory = '';
            if (res.length > 0) selectedCategory = res[0].id;
            this.updateState({categories : res, category: selectedCategory});
        }).catch((e) => {
            this.updateState({categories:[{id:'all',title: 'All'},{id:'dummy',title: 'Dummies'}, {id:23, title:'Entertainment'}]})
        });
    }

    loadItemDetail() {

        if (this.type === 'edit') {
            let group = this.props.item;
            console.log(group);
            this.updateState({
                title : group.title,
                privacy : group.privacy.toString(),
                description : group.description,
                category : group.category,
                dataLoaded: true
            });
        }

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
                                    {this.type === 'new' ? this.lang.t('new_group').toUpperCase() : this.lang.t('edit_group').toUpperCase()}
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
                                    <Label>{this.lang.t('description')}</Label>
                                    <Textarea bordered multiline={true} rowSpan={4} onChangeText={(text) => this.updateState({description : text})} value={this.state.description}/>
                                </View>




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
                                            <Picker.Item label={this.lang.t('private')} value="6" />

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
})(GroupCreate)