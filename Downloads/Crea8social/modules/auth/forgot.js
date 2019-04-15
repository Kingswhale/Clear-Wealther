import React, {Component} from 'react';

import {
    Container,
    Button,
    Icon,
    Item,
    Input,
    Label,
    Toast,
    Form,View
} from 'native-base';

import {
    Text,
    Image, TouchableHighlight,Platform,ScrollView
} from 'react-native';
import Api from '@api';
import { Formik } from 'formik';
import material from '../../native-base-theme/variables/material';
import Spinner from 'react-native-loading-spinner-overlay';
import storage from "../../store/storage";
import Assets from '@assets/assets'
import {avatar, password, userid, username} from "../../App";
import { connect } from "react-redux";
import BaseComponent from "../../utils/BaseComponent";
import {NavigationActions, StackActions} from "react-navigation";


const stateMap = (state) => {
    console.log('state', state);
    return {
        userid : state.auth.userid,
        username : state.auth.username,
        password : state.auth.password,
        avatar : state.auth.avatar
    };
};


 class ForgotScreen extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            email : '',
        }
    }

    render() {

        return (
            <Container>
                <ScrollView bounces={false} style={{flex: 1,flexDirection: 'column',backgroundColor: 'white'}}>

                    <Spinner visible={this.state.loading} textContent={""} textStyle={{color: '#FFF'}} />
                    <View style={{height:150, backgroundColor: material.accentBgColor,padding:30,flexDirection: 'row'}}>
                        <TouchableHighlight
                            underlayColor="black"
                            activeOpacity={0.1}
                            >
                            <Icon onPress={() => {this.props.navigation.goBack()}} name="ios-arrow-round-back-outline" style={{fontSize: 50,color:'white', marginTop: 35}}/>
                        </TouchableHighlight>
                        <Text style={{fontSize: 25,color:'white', marginTop: 45,marginLeft:15}}>{this.lang.t('reset_password')}</Text>

                    </View>
                    <View style={{ justifyContent: 'center',backgroundColor: 'white',paddingLeft: 30,paddingRight: 30, marginTop: 70}}>
                        <Item floatingLabel style={{marginBottom:30}}>
                            <Icon style={{color:material.accentBgColor}} name='person' />
                            <Label>{this.lang.t('your_email')}</Label>

                            <Input
                                onChangeText={(t) => this.updateState({email : t})}
                                value={this.state.email}/>
                        </Item>






                        <Button primary  rounded block  onPress={() => this.reset()} style={{marginTop:30, paddingLeft: 30, paddingRight: 30}}>
                            <Text style={{color:'white'}}>{this.lang.t('submit')}</Text>
                        </Button>

                    </View>

                </ScrollView>
            </Container>
        )
    }

    reset() {
        if (this.state.email === '') {
            Toast.show({
                text : this.lang.t('provide_your_email'),
                type :'danger'
            })
        }

        this.updateState({loading: true});
        Api.get("forgotpassword", {
            email : this.state.email
        }).then((res) => {
            this.updateState({loading: false});
            if (res.status === 1) {
                Toast.show({
                    text : this.lang.t("please_check_email_forgot"),
                    type : 'success'
                });
                this.props.navigation.goBack();
            } else {
                Toast.show({
                    text : this.lang.t("email_not_found"),
                    type : 'danger'
                })
            }
        })
    }
}


export default connect(stateMap)(ForgotScreen);