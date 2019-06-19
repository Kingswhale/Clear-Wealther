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
import DatePicker from 'react-native-datepicker'

class EventCreate extends BaseComponent {
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
            location : '',
            privacy : '1',

            start_day : '',
            start_month : '',
            start_year : '',
            start_hour : '',
            start_minute : '',
            start_time_type: '',

            end_day : '',
            end_month : '',
            end_year : '',
            end_hour : '',
            end_minute : '',
            end_time_type: '',
            address : '',
            
            image : null,
            processing : false,
            dataLoaded : false,
            startTime : '',
            endTime : ''
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

        if (this.state.startTime === '') {
            Toast.show({
                text : this.lang.t('choose_event_date'),
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
        formData.append("location", this.state.location);
        formData.append("address", this.state.address);
        formData.append("category_id", this.state.category);

        if (this.state.image !== null) {
            formData.append('image', {
                uri: this.state.image.path,
                type: this.state.image.mime, // or photo.type
                name: this.state.image.path
            });

        }

        let startDate  = new Date(this.state.startTime);
        formData.append("start_day", startDate.getDate());
        formData.append("start_month", startDate.getMonth() + 1);
        formData.append("start_year", startDate.getFullYear());
        formData.append("start_hour", startDate.getHours());
        formData.append("start_minute", startDate.getMinutes());
        let ampm = startDate.getHours() >= 12 ? 'pm' : 'am';
        formData.append("start_time_type", ampm);


        let endDate  = new Date(this.state.endTime);
        formData.append("end_day", endDate.getDate());
        formData.append("end_month", endDate.getMonth() + 1);
        formData.append("end_year", endDate.getFullYear());
        formData.append("end_hour", endDate.getHours());
        formData.append("end_minute", endDate.getMinutes());
        let ampm2 = endDate.getHours() >= 12 ? 'pm' : 'am';
        formData.append("end_time_type", ampm2);

        if (this.type === 'new') {
            Api.post("event/create",formData).then((res) => {
                this.updateState({
                    processing: false
                });
                if (res.status === 1) {
                    this.props.component.refs.createModal.close();
                    this.props.component.finishedCreate(res);
                    Toast.show({
                        text: this.lang.t('event_added_success'),
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
            Api.post("event/edit",formData).then((res) => {
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
        Api.get("event/get/categories", {userid : this.props.userid}).then((res) => {
            let selectedCategory = '';
            if (res.length > 0) selectedCategory = res[0].id;
            this.updateState({categories : res, category: selectedCategory});
        }).catch((e) => {
            //this.updateState({categories:[{id:'all',title: 'All'},{id:'dummy',title: 'Dummies'}, {id:23, title:'Entertainment'}]})
        });
    }

    loadItemDetail() {

        if (this.type === 'edit') {
            let event = this.props.item;
            this.updateState({
                title : event.title,
                privacy : event.privacy,
                location : event.location,
                address : event.address,
                category : event.category,
                startTime : new Date(event.start_time),
                endTime : new Date(event.end_time),
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
                                    {this.type === 'new' ? this.lang.t('new_event').toUpperCase() : this.lang.t('edit_event').toUpperCase()}
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


                                <Item floatingLabel>
                                    <Label>{this.lang.t('location')}</Label>
                                    <Input onChangeText={(text) => this.updateState({location : text})} value={this.state.location} />
                                </Item>

                                <Item floatingLabel>
                                    <Label>{this.lang.t('address')}</Label>
                                    <Input onChangeText={(text) => this.updateState({address : text})} value={this.state.address} />
                                </Item>

                                <Item picker style={{marginBottom: 20,marginLeft:20}}>
                                    <Left>
                                        <Label>{this.lang.t('category')}</Label>
                                    </Left>
                                    <Right>
                                        {this.listCategories()}
                                    </Right>
                                </Item>


                                <Item  style={{marginBottom: 20,marginLeft:20,padding:10}}>
                                    <Left>
                                        <Label>{this.lang.t('profile_cover')}</Label>
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



                                <Item picker style={{marginBottom: 20,marginLeft:20}}>
                                    <Text style={{fontWeight:'bold',marginBottom:15}}>{this.lang.t('start_time')}</Text>
                                </Item>

                                <DatePicker
                                    style={{flex:1,width:300,marginLeft:15}}
                                    date={this.state.startTime}
                                    mode="datetime"
                                    placeholder={this.lang.t('start_time')}
                                    format="YYYY-MM-DD"
                                    confirmBtnText={this.lang.t('ok')}
                                    cancelBtnText={this.lang.t('cancel')}
                                    customStyles={{
                                        dateIcon: {
                                            position: 'absolute',
                                            left: 0,
                                            top: 4,
                                            marginLeft: 0
                                        },
                                        dateInput: {
                                            marginLeft: 36
                                        }
                                        // ... You can check the source to find the other keys.
                                    }}
                                    onDateChange={(date) => {this.updateState({startTime: date})}}
                                />

                                <Item picker style={{marginBottom: 20,marginLeft:20,marginTop:10}}>
                                    <Text style={{fontWeight:'bold',marginBottom:15}}>{this.lang.t('end_time')}</Text>
                                </Item>
                                <DatePicker
                                    style={{flex:1,width:300,marginLeft:15}}
                                    date={this.state.endTime}
                                    mode="datetime"
                                    placeholder={this.lang.t('end_time')}
                                    format="YYYY-MM-DD"
                                    confirmBtnText={this.lang.t('ok')}
                                    cancelBtnText={this.lang.t('cancel')}
                                    customStyles={{
                                        dateIcon: {
                                            position: 'absolute',
                                            left: 0,
                                            top: 4,
                                            marginLeft: 0
                                        },
                                        dateInput: {
                                            marginLeft: 36
                                        }
                                        // ... You can check the source to find the other keys.
                                    }}
                                    onDateChange={(date) => {this.updateState({endTime: date})}}
                                />

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

    }
})(EventCreate)