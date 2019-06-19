import React, {Component} from 'react';

import {
    Container,
    Button,
    Icon,
    Item,
    Input,
    Header, Body, Toast
} from 'native-base';

import {
    Text,
    WebView,View,ActivityIndicator
} from 'react-native';

import material from '../../native-base-theme/variables/material';
import Spinner from 'react-native-loading-spinner-overlay';
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";
import {API_KEY, WEBSITE} from "../../api";
import storage from "../../store/storage";
import {NavigationActions, StackActions} from "react-navigation";
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-crop-picker';
import Api from "../../api";


class Getstarted extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            avatar : this.props.avatar
        }
    }

    render() {

        return (
            <Container>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
                <Header hasTabs style={{height:59}}>

                    <Body >
                    <Text style={{color:'white',fontSize: 16,bottom:5}}>{this.lang.t('choose_photo')}</Text>
                    </Body>

                </Header>

                <View style={{padding: 30, alignContent: 'center'}}>
                    <FastImage style={{width:100,height:100,borderRadius:50,alignSelf:'center'}} source={{uri : this.state.avatar}}/>

                    <Button
                        onPress={() => {
                            this.changeAvatar();
                        }}
                        small light style={{marginTop: 20,borderRadius: 10,alignSelf:'center'}}>
                        <Text style={{ marginLeft:10,marginRight:10}}>{this.lang.t('change_profile_picture')}</Text>
                    </Button>
                </View>
            </Container>
        )
    }

    changeAvatar() {
        ImagePicker.openPicker({
        }).then(image => {

            let form  = new FormData();
            form.append("userid", this.props.userid);
            this.updateState({avatar : image.path});
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
                    });
                    storage.set('avatar', image);
                    storage.set('has_getstarted', '1');
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'main' })],
                    });
                    this.props.navigation.dispatch(resetAction);
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
})(Getstarted)
