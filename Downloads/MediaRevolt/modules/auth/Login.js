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


 class LoginScreen extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading : false
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
                        <Text style={{fontSize: 25,color:'white', marginTop: 45,marginLeft:15}}>{this.lang.t('login')}</Text>

                    </View>
                    <View style={{ justifyContent: 'center',backgroundColor: 'white',paddingLeft: 30,paddingRight: 30, marginTop: 50}}>
                        <Formik
                            initialValues={{
                                email: '',
                                password: '',
                            }}
                            validate = {values =>  {
                                const errors = {};

                                return errors;
                            }}
                            onSubmit={(values,{setSubmitting, setErrors}) =>  {
                                if (!values.email) {
                                    Toast.show({
                                        text: this.lang.t('provide_email_username'),
                                        type: 'danger'
                                    });

                                    return false;
                                }

                                if (!values.password) {
                                    Toast.show({
                                        text: this.lang.t('provide_password'),
                                        type: 'danger'
                                    });
                                    return false;
                                }
                                this.setState({loading : true});
                                Api.get(Api.login, {
                                    username : values.email,
                                    password : values.password
                                }).then(response => {
                                    this.setState({loading : false});
                                    let result = response;
                                    console.log(result);

                                    if (result.status == 0) {
                                        Toast.show({
                                            text : this.lang.t('invalid_login_details'),
                                            type: 'danger'});
                                    } else {


                                        //console.log(result.);
                                        if (result.activated == "1") {
                                            storage.loginUser(result.userid, result.password);
                                            storage.set('first_name', result.first_name);
                                            storage.set('last_name', result.first_name);
                                            storage.set('avatar', result.avatar);
                                            storage.set('cover', result.cover);
                                            storage.set('user_name', result.name);
                                            storage.set('has_getstarted', '1');
                                            storage.set('need_membership', result.need_membership.toString());


                                            //global data
                                            this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                                                    userid : result.userid,
                                                    username : result.name,
                                                    password : result.password,
                                                    avatar : result.avatar,
                                                    cover : result.cover
                                                    //needMembership : this.needMembership,
                                                    // hasGetstarted : this.hasGetstarted
                                                }});
                                            if (result.need_membership === 1) {
                                                const resetAction = StackActions.reset({
                                                    index: 0,
                                                    actions: [NavigationActions.navigate({ routeName: 'membership' })],
                                                });
                                                this.props.navigation.dispatch(resetAction);
                                            } else {
                                                const resetAction = StackActions.reset({
                                                    index: 0,
                                                    actions: [NavigationActions.navigate({ routeName: 'main' })],
                                                });
                                                this.props.navigation.dispatch(resetAction);
                                            }


                                        } else {
                                            Toast.show({
                                                text: this.lang.t('please_check_email'),
                                                type: 'info'
                                            });
                                        }
                                    }
                                }).catch(error => {
                                    this.setState({loading : false});
                                    Toast.show({
                                        text : error.message,
                                        type: 'warning'
                                    });
                                    console.log(error);
                                })
                            }}
                            render={props => (
                                <Form onSubmit={props.handleSubmit}>
                                    <Item floatingLabel>
                                        <Icon style={{color:material.accentBgColor}} name='person' />
                                        <Label>{this.lang.t('username_email')}</Label>

                                        <Input
                                            onChangeText={(t) => {
                                                props.setFieldValue('email', t)
                                            }}
                                            value={props.values.email}/>
                                    </Item>

                                    <Item floatingLabel>
                                        <Icon style={{color:material.accentBgColor}} name='lock' />
                                        <Label >{this.lang.t('password')}</Label>
                                        <Input
                                            onChangeText={(t) => {
                                                props.setFieldValue('password', t)
                                            }}
                                            secureTextEntry
                                            value={props.values.password}
                                        />
                                    </Item>




                                    <Button primary  rounded block  onPress={props.handleSubmit} style={{marginTop:30, paddingLeft: 30, paddingRight: 30}}>
                                        <Text style={{color:'white'}}>{this.lang.t('signin')}</Text>
                                    </Button>

                                    <Text onPress={()=> {
                                        this.props.navigation.navigate('forgot');
                                    }} style={{marginTop:40,textAlign:'center', color: material.brandPrimary}}>
                                        {this.lang.t('forgot_password')}
                                    </Text>

                                </Form>
                            )}
                        />
                    </View>
                    <Button onPress={() => {this.props.navigation.navigate('signup')}} rounded large danger style={{position: 'absolute', right: 30, top: 121,width:60,height:60,backgroundColor:material.brandPrimary}}>
                        <Icon name="ios-add-outline" style={{color:'white',fontSize:40,marginLeft:20}}/>
                    </Button>
                </ScrollView>
            </Container>
        )
    }
}


export default connect(stateMap)(LoginScreen);