import React, {Component} from 'react';

import {
    Container,
    Button,
    Icon,
    Item,
    Input,
    Label,
    Toast,
    Form,Picker,Left,Right,Body,Header,Title,CheckBox
} from 'native-base';

import {
    Text,
    View,
    Image, TouchableHighlight,ScrollView,Linking,TouchableOpacity
} from 'react-native';
import { Formik } from 'formik';
import material from '../../native-base-theme/variables/material';
import Spinner from 'react-native-loading-spinner-overlay';
import BaseComponent from "../../utils/BaseComponent";
import storage from "../../store/storage";
import CountryPicker, {
    getAllCountries
} from 'react-native-country-picker-modal'
import DatePicker from 'react-native-datepicker'
import time from "../../utils/Time";
import Api, {WEBSITE} from "../../api";
import {connect} from "react-redux";
import {NavigationActions, StackActions} from "react-navigation";


const stateMap = (state) => {
    return {
        userid : state.auth.userid,
        username : state.auth.username,
        password : state.auth.password,
        avatar : state.auth.avatar
    };
};

class SignupScreen extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            stage : 1,
            first_name : '',
            last_name : '',
            username : '',
            email_address : '',
            password : '',
            gender :'male',
            country : 'United States',
            countryCode : 'US',
            birthdate : '',
            term : false

        }
    }

    goTo() {
        this.updateState({
            stage: this.state.stage + 1
        })
    }

    goBack() {
        if (this.state.stage > 1) {
            this.updateState({
                stage: this.state.stage - 1
            })
        } else {
            this.props.navigation.goBack()
        }
    }

    submit() {
        if (!this.state.term) {
            Toast.show({
                text : this.lang.t('please_accept_terms')
            });
            return;
        }
        if (this.state.first_name === '') {
            Toast.show({
                text : this.lang.t('provide_first_name_error')
            });
            return;
        }

        if (this.state.username === '') {
            Toast.show({
                text : this.lang.t('provide_username_error')
            });
            return;
        }

        if (this.state.email_address === '') {
            Toast.show({
                text : this.lang.t('provide_email_address_error')
            });
            return;
        }

        if (this.state.password === '') {
            Toast.show({
                text : this.lang.t('choose_a_password_error')
            });
            return;
        }

        if (this.state.birthdate === '') {
            Toast.show({
                text : this.lang.t('provide_birthdate_error')
            });
            return;
        }

        this.updateState({loading: true});
        let date  = new Date(this.state.birthdate);
        Api.get("signup", {
            firstname : this.state.first_name,
            lastname : this.state.last_name,
            username : this.state.username,
            email_address : this.state.email_address,
            password : this.state.password,
            day : date.getDate(),
            month : time.getMonthName(date.getMonth()),
            year : date.getFullYear(),
            gender: this.state.gender,
            country : this.state.country
        }).then((result) => {
            this.updateState({loading: false});
            console.log(result);
            if (result.status === 1) {
                if (result.activated === 1) {
                    storage.loginUser(result.userid, result.password);
                    storage.set('first_name', result.first_name);
                    storage.set('last_name', result.first_name);
                    storage.set('avatar', result.avatar);
                    storage.set('cover', result.cover);
                    storage.set('user_name', result.name);
                    storage.set('has_getstarted', '0');
                    storage.set('need_membership', result.need_membership.toString());


                    //global data
                    this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                            userid : result.userid,
                            username : result.name,
                            password : result.password,
                            avatar : result.avatar,
                            cover : result.cover
                        }});

                    if (result.need_membership === 1) {
                        //we moving to membership page
                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: 'membership' })],
                        });
                        this.props.navigation.dispatch(resetAction);

                    } else {
                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: 'getstarted' })],
                        });
                        this.props.navigation.dispatch(resetAction);
                    }


                } else {
                    this.props.navigation.goBack();
                    Toast.show({
                        text: this.lang.t('please_check_email'),
                        type: 'info'
                    });
                }
            } else {
                Toast.show({
                    text: result.message,
                    type: 'danger'
                });
            }
        }).catch((e) => console.log(e));
    }

    render() {

        return (
            <Container>
                <ScrollView  bounces={false} style={{flex: 1,flexDirection: 'column',backgroundColor: 'white'}}>
                    <View style={{flex: 1,flexDirection: 'column',backgroundColor: material.accentBgColor}}>

                        <Spinner visible={this.state.loading} textContent={""} textStyle={{color: '#FFF'}} />
                        <View style={{height:150, backgroundColor: material.accentBgColor,padding:30,flexDirection: 'row'}}>
                            <TouchableHighlight
                                underlayColor="black"
                                activeOpacity={0.1}
                            >
                                <Icon onPress={() => {this.goBack()}} name="ios-arrow-round-back-outline" style={{fontSize: 50,color:'white', marginTop: 35}}/>
                            </TouchableHighlight>
                            <Text style={{fontSize: 25,color:'white', marginTop: 45,marginLeft:15}}>{this.lang.t('signup')}</Text>

                        </View>
                        <View style={{flex:1, justifyContent: 'center',backgroundColor: 'white',paddingLeft: 30,paddingRight: 30}}>

                            {this.state.stage == 1 ? (
                                <View style={{marginTop:70}}>
                                    <Item floatingLabel style={{marginBottom:20}}>
                                        <Icon style={{color:material.accentBgColor}} name='person' />
                                        <Label>{this.lang.t('first_name')}</Label>

                                        <Input
                                            onChangeText={(t) => this.updateState({first_name : t})}
                                            value={this.state.first_name}/>
                                    </Item>
                                    <Item floatingLabel style={{marginBottom:20}}>
                                        <Icon style={{color:material.accentBgColor}} name='person' />
                                        <Label>{this.lang.t('last_name')}</Label>

                                        <Input
                                            onChangeText={(t) => this.updateState({last_name : t})}
                                            value={this.state.last_name}/>
                                    </Item>
                                </View>
                            ) : null}

                            {this.state.stage == 2 ? (
                                <View style={{marginTop:70}}>
                                    <Item floatingLabel style={{marginBottom:20}}>
                                        <Icon style={{color:material.accentBgColor}} name='person' />
                                        <Label>{this.lang.t('username')}</Label>

                                        <Input
                                            onChangeText={(t) => this.updateState({username: t})}
                                            value={this.state.username}/>
                                    </Item>

                                    <Item floatingLabel style={{marginBottom:20}}>
                                        <Icon style={{color:material.accentBgColor}} name='ios-mail' />
                                        <Label>{this.lang.t('email_address')}</Label>

                                        <Input
                                            onChangeText={(t) => this.updateState({email_address: t})}
                                            value={this.state.email_address}/>
                                    </Item>

                                    <Item floatingLabel>
                                        <Icon style={{color:material.accentBgColor}} name='lock' />
                                        <Label >Password</Label>
                                        <Input
                                            onChangeText={(t) => this.updateState({password: t})}
                                            secureTextEntry
                                            value={this.state.password}
                                        />
                                    </Item>
                                </View>
                            ) : null}

                            {this.state.stage == 3 ? (
                                <View style={{marginTop:70}}>
                                    <View style={{flexDirection:'row',marginBottom:20}}>
                                        <Text style={{flex:1,fontWeight:'bold',fontSize:15}}>{this.lang.t('gender')}</Text>
                                        <View >
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
                                                style={{ width: 150,bottom:10 }}

                                                selectedValue={this.state.gender}
                                                onValueChange={(val) => this.updateState({gender: val})}
                                            >
                                                <Picker.Item label={this.lang.t('male')} value="male" />
                                                <Picker.Item label={this.lang.t('female')} value="female" />
                                            </Picker>
                                        </View>
                                    </View>

                                    <View style={{flexDirection:'row',marginBottom:20}}>
                                        <Text style={{flex:1,fontWeight:'bold',fontSize:15}}>{this.lang.t('birthdate')}</Text>
                                        <View >
                                            <DatePicker
                                                style={{flex:1,width:200,bottom:5}}
                                                mode="date"
                                                date={this.state.birthdate}
                                                placeholder={this.lang.t('birthdate')}
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
                                                        marginLeft: 36,
                                                        borderColor:'white',
                                                        borderBottomColor:'#BFC0C0',
                                                        bottom:7
                                                    }
                                                    // ... You can check the source to find the other keys.
                                                }}
                                                onDateChange={(date) => {
                                                    this.updateState({birthdate: date})}}
                                            />
                                        </View>
                                    </View>



                                    <View style={{flexDirection:'row',marginBottom:30}}>
                                        <Text style={{flex:1,fontWeight:'bold',fontSize:15}}>{this.lang.t('country')}</Text>
                                        <View style={{flexDirection:'row'}}>
                                            <CountryPicker
                                                filterable={true}
                                                onChange={value => {
                                                    //console.log(value)
                                                    this.updateState({ countryCode: value.cca2,country:value.name})
                                                }}
                                                children={ <View
                                                    style={{ flexDirection:'row',alignItems: 'center',
                                                        justifyContent: 'center',
                                                        height: 19}}
                                                >
                                                    {CountryPicker.renderFlag(this.state.countryCode)}<Text style={{marginLeft:10}}>{this.state.country}</Text>
                                                </View>}
                                                closeable={true}
                                                cca2={this.state.countryCode}
                                                translation="eng"
                                            />
                                        </View>
                                    </View>

                                    <View style={{flexDirection:'row',marginTop:10}}>
                                        <CheckBox checked={this.state.term} color="green" onPress={(v) => {
                                            this.updateState({term :  !this.state.term});
                                        }}/>
                                        <TouchableOpacity style={{marginLeft:30}} onPress={() => {
                                           Linking.openURL(WEBSITE + 'terms-and-condition')
                                        }}>
                                            <Text>{this.lang.t('accept_our_terms')}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Button primary  rounded block  onPress={() => this.submit()} style={{marginTop:30, paddingLeft: 30, paddingRight: 30}}>
                                        <Text style={{color:'white'}}>{this.lang.t('submit')}</Text>
                                    </Button>
                                </View>
                            ) : null}

                        </View>
                        {this.state.stage < 3 ?  (
                            <View style={{position: 'absolute', right: 30, top: 121}}>
                                <Button onPress={() => {this.goTo()}} rounded large danger style={{width:60,height:60,backgroundColor:material.brandPrimary}}>
                                    <Icon name="ios-arrow-forward-outline" style={{color:'white',fontSize:30,marginLeft:25}}/>
                                </Button>
                            </View>
                        ): null}
                    </View>
                </ScrollView>

            </Container>
        )
    }
}

export default connect(stateMap)(SignupScreen);