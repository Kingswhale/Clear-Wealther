import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";
import {Text,View,FlatList,Image,TouchableOpacity,ScrollView,Platform,ActivityIndicator} from 'react-native';
import {
    Item,
    Input,
    Icon,
    Button,
    Body,
    Left,
    Label,
    Form,
    Right,Container,Header,Accordion,Content,Toast,Picker,Title
} from 'native-base';
import Api from "../../api";
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-crop-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import ToggleSwitch from 'toggle-switch-react-native'
import storage from "../../store/storage";

class Settings extends BaseComponent {
    constructor(props) {
        super(props);



        this.state = {
            ...this.state,
            settingsLoaded : false,
            processing : false,
            first_name : '',
            last_name : '',
            bio : '',
            city : '',
            state : '',

            //notifications
            not_follow_you : 1,
            not_mention_you : 1,
            not_tag_you : 1,
            not_comment : 1,
            not_reply_comment : 1,
            not_like : 1,

            //privacy
            priv_view_profile : 1,
            priv_post_profile : 1,
            priv_see_bith : 1,
            priv_friend_request : 1,

            //password
            currentPassword : '',
            newPassword : ''
        };

        this.loadSettings()
    }

    loadSettings() {
        Api.get("settings/load", {
            userid : this.props.userid
        }).then((res) => {
            console.log(res);

            this.updateState({
                settingsLoaded: true,
                first_name: res.first_name,
                last_name: res.last_name,
                bio : res.bio,
                city : res.city,
                state : res.state,

                not_follow_you : res.notify_following_you,
                not_mention_you : res.notify_site_mention_you,
                not_tag_you : res.notify_site_tag_you,
                not_comment : res.notify_site_comment,
                not_reply_comment : res.notify_site_reply_comment,
                not_like : res.notify_site_like,

                priv_view_profile : res.who_can_view_profile,
                priv_post_profile : res.who_can_post_profile,
                priv_see_bith : res.who_can_see_birth,
                priv_friend_request : res.turn_on_friend_requests,
            })
        }).catch((r) => {
            Toast.show({
                text : this.lang.t('failed_to_settings')
            });
            this.props.navigation.goBack();
        })
    }

    general() {
        //console.log(this.state);
        return (
            <View style={{backgroundColor:'white', padding:10,zIndex:999}}>
                <Form>
                    <Item floatingLabel>
                        <Label>{this.lang.t('first_name')}</Label>
                        <Input onChangeText={(text) => this.updateState({first_name : text})} value={this.state.first_name} />
                    </Item>

                    <Item floatingLabel>
                        <Label>{this.lang.t('last_name')}</Label>
                        <Input onChangeText={(text) => this.updateState({last_name : text})} value={this.state.last_name} />
                    </Item>

                    <Item floatingLabel>
                        <Label>{this.lang.t('bio')}</Label>
                        <Input onChangeText={(text) => this.updateState({bio : text})} value={this.state.bio} />
                    </Item>

                    <Item floatingLabel>
                        <Label>{this.lang.t('city')}</Label>
                        <Input onChangeText={(text) => this.updateState({city : text})} value={this.state.city} />
                    </Item>

                    <Item floatingLabel>
                        <Label>{this.lang.t('state')}</Label>
                        <Input onChangeText={(text) => this.updateState({state : text})} value={this.state.state} />
                    </Item>
                </Form>
            </View>
        );
    }

    notifications() {
        return (
            <View style={{backgroundColor:'white', padding:10,zIndex:999}}>
                <Text style={{fontWeight:'bold',marginBottom: 20}}>{this.lang.t('notify_me_when')}</Text>
                <View style={{marginTop: 20,flexDirection: 'row'}}>
                    <Text style={{flex: 1}}>{this.lang.t('someone_follow_you')}</Text>
                    <ToggleSwitch
                        isOn={this.state.not_follow_you === 1 || this.state.not_follow_you === '1'}
                        onColor='green'
                        offColor='lightgrey'
                        size='medium'
                        onToggle={ (isOn) => this.updateState({not_follow_you : isOn ? 1 : 0}) }
                    />
                </View>

                <View style={{marginTop: 20,flexDirection: 'row'}}>
                    <Text style={{flex: 1}}>{this.lang.t('someone_mention_you')}</Text>
                    <ToggleSwitch
                        isOn={this.state.not_mention_you === 1 || this.state.not_mention_you === "1"}
                        onColor='green'
                        offColor='lightgrey'
                        size='medium'
                        onToggle={ (isOn) => this.updateState({not_mention_you : isOn ? 1 : 0}) }
                    />
                </View>

                <View style={{marginTop: 20,flexDirection: 'row'}}>
                    <Text style={{flex: 1}}>{this.lang.t('someone_tag_you')}</Text>
                    <ToggleSwitch
                        isOn={this.state.not_tag_you === 1 || this.state.not_tag_you === "1"}
                        onColor='green'
                        offColor='lightgrey'
                        size='medium'
                        onToggle={ (isOn) => this.updateState({not_tag_you : isOn ? 1 : 0}) }
                    />
                </View>

                <View style={{marginTop: 20,flexDirection: 'row'}}>
                    <Text style={{flex: 1}}>{this.lang.t('someone_comment_post')}</Text>
                    <ToggleSwitch
                        isOn={this.state.not_comment === 1 || this.state.not_comment === "1"}
                        onColor='green'
                        offColor='lightgrey'
                        size='medium'
                        onToggle={ (isOn) => this.updateState({not_comment: isOn ? 1 : 0}) }
                    />
                </View>

                <View style={{marginTop: 20,flexDirection: 'row'}}>
                    <Text style={{flex: 1}}>{this.lang.t('someone_reply_comment')}</Text>
                    <ToggleSwitch
                        isOn={this.state.not_reply_comment === 1 || this.state.not_reply_comment === "1"}
                        onColor='green'
                        offColor='lightgrey'
                        size='medium'
                        onToggle={ (isOn) => this.updateState({not_reply_comment: isOn ? 1 : 0}) }
                    />
                </View>

                <View style={{marginTop: 20,flexDirection: 'row'}}>
                    <Text style={{flex: 1}}>{this.lang.t('someone_like_post')}</Text>
                    <ToggleSwitch
                        isOn={this.state.not_like === 1 || this.state.not_like === "1"}
                        onColor='green'
                        offColor='lightgrey'
                        size='medium'
                        onToggle={ (isOn) => this.updateState({not_like: isOn ? 1 : 0}) }
                    />
                </View>
            </View>
        );
    }

    password() {
        return (
            <View style={{backgroundColor:'white', padding:10,zIndex:999}}>
                <Form>
                    <Item floatingLabel>
                        <Label>{this.lang.t('old_password')}</Label>
                        <Input onChangeText={(text) => this.updateState({currentPassword : text})} value={this.state.currentPassword} />
                    </Item>

                    <Item floatingLabel>
                        <Label>{this.lang.t('new_password')}</Label>
                        <Input onChangeText={(text) => this.updateState({newPassword : text})} value={this.state.newPassword} />
                    </Item>

                    <Button small primary onPress={() => {
                        this.changePassword();
                    }}>
                        <Text style={{color:'white',marginLeft: 20,marginRight:20}}>{this.lang.t('change')}</Text>
                    </Button>

                </Form>
            </View>
        );
    }

    privacy() {
        return (
            <View style={{backgroundColor:'white', padding:10,zIndex:999}}>

                <View style={{marginTop: 20,flexDirection: 'row'}}>
                    <Text style={{flex: 1}}>{this.lang.t('who_can_see_profile')}</Text>
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
                        note={false}
                        mode="dropdown"
                        style={{width: 150,borderColor:'lightgrey',borderWidth: 0.7,padding:0,height:35,borderRadius:5,bottom:7 }}
                        selectedValue={this.state.priv_view_profile.toString()}
                        onValueChange={(v) => this.updateState({priv_view_profile : v})}
                    >
                        <Picker.Item label={this.lang.t('public')} value="1" />
                        <Picker.Item label={this.lang.t('friends_only')} value="2" />
                        <Picker.Item label={this.lang.t('only_me')} value="3" />
                    </Picker>
                </View>


                <View style={{marginTop: 20,flexDirection: 'row'}}>
                    <Text style={{flex: 1}}>{this.lang.t('who_can_post_profile')}</Text>
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
                        note={false}
                        mode="dropdown"
                        style={{width: 150,borderColor:'lightgrey',borderWidth: 0.7,padding:0,height:35,borderRadius:5,bottom:7 }}
                        selectedValue={this.state.priv_post_profile.toString()}
                        onValueChange={(v) => this.updateState({priv_post_profile : v})}
                    >
                        <Picker.Item label={this.lang.t('public')} value="1" />
                        <Picker.Item label={this.lang.t('friends_only')} value="2" />
                        <Picker.Item label={this.lang.t('only_me')} value="3" />
                    </Picker>
                </View>


                <View style={{marginTop: 20,flexDirection: 'row'}}>
                    <Text style={{flex: 1}}>{this.lang.t('who_can_see_birth')}</Text>
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
                        note={false}
                        mode="dropdown"
                        style={{width: 150,borderColor:'lightgrey',borderWidth: 0.7,padding:0,height:35,borderRadius:5,bottom:7 }}
                        selectedValue={this.state.priv_see_bith.toString()}
                        onValueChange={(v) => this.updateState({priv_see_bith : v})}
                    >
                        <Picker.Item label={this.lang.t('public')} value="1" />
                        <Picker.Item label={this.lang.t('friends_only')} value="2" />
                        <Picker.Item label={this.lang.t('only_me')} value="3" />
                    </Picker>
                </View>
            </View>
        );
    }

    render() {
        this.dataArray = [
            { title: this.lang.t('general'), content: this.general() },
            { title: this.lang.t('change_password'), content: this.password() },
            { title: this.lang.t("notifications"), content: this.notifications() },
            { title: this.lang.t("privacy"), content: this.privacy() }
        ];
        return (
          <Container>
              <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
              <Header hasTabs>
                  <Left>
                      <Button onPress={() => this.props.navigation.goBack()} transparent>
                          <Icon name="ios-arrow-round-back" />
                      </Button>
                  </Left>
                  <Body >
                  <Text style={{color:'white',fontSize: 16,left:-10}}>{this.lang.t('account_settings')}</Text>
                  </Body>

                  <Right>
                      <Button transparent onPress={() => {
                            this.submitSettings();
                      }}>
                          <Text style={{color:'white'}}>{this.lang.t('save').toUpperCase()}</Text>
                      </Button>
                  </Right>
              </Header>

              <Content padder>
                  {this.state.settingsLoaded ? (
                      <View style={{flexDirection: 'column'}}>
                          <View style={{padding: 30, alignContent: 'center'}}>
                                <FastImage style={{width:100,height:100,borderRadius:50,alignSelf:'center'}} source={{uri : this.props.avatar}}/>

                              <Button
                                  onPress={() => {
                                      this.changeAvatar();
                                  }}
                                  small light style={{marginTop: 20,borderRadius: 10,alignSelf:'center'}}>
                                  <Text style={{ marginLeft:10,marginRight:10}}>{this.lang.t('change_profile_picture')}</Text>
                              </Button>
                          </View>
                          <Accordion dataArray={this.dataArray} expanded={0} renderContent={(content) => content}/>
                      </View>
                      ) : (
                      <View style={{flex:1,flexDirection:'column', justifyContent : 'center'}}>
                          <Text/>
                          <ActivityIndicator size='large' style={{marginTop:0}} />
                      </View>
                  )}
              </Content>
          </Container>
        );
    }


    submitSettings() {
        this.updateState({processing : true});
        let formData = new FormData();
        formData.append("userid", this.props.userid);
        formData.append("first_name", this.state.first_name);
        formData.append("last_name", this.state.last_name);
        formData.append("bio", this.state.bio);
        formData.append("city", this.state.city);
        formData.append("state", this.state.state);

        formData.append("notify-following-you", this.state.not_follow_you);
        formData.append("notify-site-mention-you", this.state.not_mention_you);
        formData.append("notify-site-tag-you", this.state.not_tag_you);
        formData.append("notify-site-comment", this.state.not_comment);
        formData.append("notify-site-reply-comment", this.state.not_reply_comment);
        formData.append("notify-site-like", this.state.not_like);

        formData.append("who_can_view_profile", this.state.priv_view_profile);
        formData.append("who_can_post_profile", this.state.priv_post_profile);
        formData.append("who_can_see_birth", this.state.priv_see_bith);
        formData.append("turn_on_friend_requests", this.state.priv_friend_request);

        Api.post("settings/save", formData).then((res) => {
            this.updateState({processing : false});
            Toast.show({
                text : this.lang.t('settings_saved'),
                type : 'success'
            });
        }).catch((e) => {
            this.updateState({processing : false});
            Toast.show({
                text : this.lang.t('settings_save_failed'),
                type : 'danger'
            });
        })
    }

    changePassword() {
        this.updateState({processing : true});
        Api.get("settings/password", {
            current_password : this.state.currentPassword,
            new_password: this.state.newPassword
        }).then((res) => {
            this.updateState({processing : false});
            if (res.status === 1) {
                //password changed
                this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                        userid : this.props.userid,
                        username : this.props.username,
                        password : res.data_one,
                        avatar : this.props.avatar,
                        cover : this.props.cover
                    }});
                Toast.show({
                    text : this.lang.t('password_changed'),
                    type : 'success'
                });
            } else {
                Toast.show({
                    text : this.lang.t('password_does_not_match'),
                    type : 'danger'
                });
            }
        }).catch((e) => {
            this.updateState({processing : false});
        })
    }


    changeAvatar() {
        ImagePicker.openPicker({
        }).then(image => {

            let form  = new FormData();
            form.append("userid", this.props.userid);
            form.append('avatar', {
                uri: image.path,
                type: image.mime, // or photo.type
                name: image.path
            });
            this.updateState({processing : true});

            Api.post("profile/change/avatar", form).then((res) => {
                this.updateState({processing : false});
                if (res.status === 1) {
                    let image = res.data_one;
                    storage.set('avatar', image);
                    this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                            userid : this.props.userid,
                            username : this.props.username,
                            password : this.props.password,
                            avatar : image,
                            cover : this.props.cover
                        }});
                    Toast.show({
                        text : this.lang.t('avatar_changed'),
                        type : 'success'
                    })
                } else {
                    Toast.show({
                        text : res.message,
                        type : 'danger'
                    })
                }
            });
        });
    }
}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        cover : state.auth.cover,
        password : state.auth.password
    }
})(Settings)