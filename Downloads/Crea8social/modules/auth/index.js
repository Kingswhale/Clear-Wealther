import React, {Component} from 'react';
import {
    View,
    Image,
    StyleSheet,NativeModules,TouchableOpacity
} from 'react-native';

import {Text} from 'react-native';
import Assets from '@assets/assets';
import storage from "../../store/storage";
import { Header, Container,
    Drawer, Tab,
    Root,
    Fab,
    Tabs,TabHeading,
    Icon,Title,Left,Right,Body,Button,Toast} from 'native-base';
import {NavigationActions, StackActions} from "react-navigation";
import Spinner from 'react-native-loading-spinner-overlay';
import Api, {ENABLE_SOCIAL_INTEGRATION, IOS_CLIENT_ID, TWITTER_COMSUMER_KEY, TWITTER_CONSUMER_SECRET} from "../../api";
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";

const { RNTwitterSignIn } = NativeModules;
const FBSDK = require('react-native-fbsdk');
const {
    LoginManager,AccessToken,GraphRequestManager,GraphRequest
} = FBSDK;

import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
const stateMap = (state) => {
    console.log('state', state);
    return {
        userid : state.auth.userid,
        username : state.auth.username,
        password : state.auth.password,
        avatar : state.auth.avatar
    };
};
var obj;
class Homescreen extends BaseComponent {

    constructor(props) {
        super(props);
        let currentImage = 1;
        this.state = {
            image : Assets.slide1,
            loading: false
        };

        obj = this;
        setInterval(() => {
            let dImage = Assets.slide1;
            if (currentImage == 1) {
                dImage = Assets.slide2;
                currentImage = 2;
            } else if(currentImage == 2) {
                dImage = Assets.slide3;
                currentImage = 3;
            } else {
                dImage = Assets.slide1;
                currentImage = 1;
            }
            this.setState({image : dImage})
        }, 2000)
    }

    render() {
        const resizeMode = 'cover';
        return <Container>
            <Spinner visible={this.state.loading} textContent={""} textStyle={{color: '#FFF'}} />
            <View style={{flex: 1}}>
                <Image source={this.state.image} style={{flex:1, resizeMode}}/>
                <View style={{position: 'absolute', top: 0, left: 0,right:0,bottom:0,backgroundColor : 'rgba(65,68,83,0.9)'}}>
                    <View style={{flex:1, flexDirection: 'column'}}>
                        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 30}}>
                            <Image source={Assets.logo} style={{width: 70, height: 70,alignSelf: 'center'}}/>
                            <Text style={{alignContent: 'center', marginTop: 30, color: '#FFF', fontSize: 19,textAlign:'center'}}>

                                Connect with your friends and family and share similar contents
                            </Text>

                        </View>
                        <View style={{margin: 30, flexDirection: 'column'}}>

                            <Button onPress={() => {
                                this.props.navigation.navigate('login')
                            }} primary full rounded style={{marginBottom: 10}}><Text style={{color:'white'}}> Login to your account </Text></Button>
                            <Button onPress={() => {this.props.navigation.navigate("signup")}} transparent full rounded><Text style={{color:'white', fontSize: 17}}> Signup for account</Text></Button>
                        </View>
                    </View>
                    {ENABLE_SOCIAL_INTEGRATION ? (
                        <View style={styles.bottomPanel}>
                            <TouchableOpacity onPress={() => {
                                LoginManager.logInWithReadPermissions(['public_profile']).then(
                                    function(result) {

                                        if (result.isCancelled) {
                                            Toast.show({
                                                text : this.lang.t('problem_auth_facebook')
                                            })
                                        } else {
                                            console.log(result);
                                            ///this.updateState({loading: true});
                                            const infoRequest = new GraphRequest(
                                                '/me?fields=id,name,first_name,last_name,email,gender',
                                                null,
                                                (err, result) => {
                                                    //this.updateState({loading:true});
                                                    obj.socialSignin({
                                                        firstName : result.first_name,
                                                        lastName : result.last_name,
                                                        username : 'fb_' + result.id,
                                                        image : '',
                                                        id : result.id,
                                                        email : result.email,
                                                        gender : result.gender,
                                                        type : 'facebook'
                                                    });
                                                }
                                            );
                                            // Start the graph request.
                                            new GraphRequestManager().addRequest(infoRequest).start();
                                        }
                                    },
                                    function(error) {
                                        Toast.show({
                                            text : this.lang.t('problem_auth_facebook')
                                        })
                                    }
                                );
                            }}>
                                <Icon name="logo-facebook" style={{width: 40, height: 40, margin: 10,color: 'white'}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                RNTwitterSignIn.init(TWITTER_COMSUMER_KEY, TWITTER_CONSUMER_SECRET);
                                RNTwitterSignIn.logIn()
                                    .then(loginData => {
                                        this.socialSignin({
                                            firstName : loginData.userName,
                                            lastName : '',
                                            username : loginData.userName,
                                            image : 'https://twitter.com/'+loginData.userName+'/profile_image?size=bigger',
                                            id : loginData.userID,
                                            email : loginData.email,
                                            gender : '',
                                            type : 'twitter'
                                        });
                                    })
                                    .catch(error => {
                                            Toast.show({
                                                text : this.lang.t('problem_auth_twitter')
                                            })
                                        }
                                    );
                            }}>
                                <Icon name="logo-twitter" style={{width: 40, height: 40, margin: 10,color: 'white'}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                GoogleSignin.configure({
                                    iosClientId: IOS_CLIENT_ID, // only for iOS
                                }).then(() => {
                                    // you can now call currentUserAsync()
                                    obj.googleSignIn();
                                });
                            }}>
                                <Icon name="logo-google" style={{width: 40, height: 40, margin: 10,color: 'white'}}/>
                            </TouchableOpacity>

                        </View>
                    ) : null}
                </View>
            </View>

        </Container>

    }

    googleSignIn = async () => {
        try {
            const user = await GoogleSignin.signIn();
            console.log(user);
            obj.socialSignin({
                firstName : user.givenName,
                lastName : user.familyName,
                username : 'gplus_' + user.id,
                image : user.photo,
                id : user.id,
                email : user.email,
                gender : '',
                type : 'google'
            });
        } catch (error) {
            Toast.show({
                text : this.lang.t('problem_auth_twitter')
            })
        }
    };
    
    socialSignin(data) {
        this.updateState({loading: true});
        Api.get("register/social", {
            firstname : data.firstName,
            lastname : data.lastName,
            gender : data.gender,
            email : data.email,
            username : data.username,
            type : data.type,
            id : data.id,
            image : data.image
        }).then((result) => {
            this.updateState({loading: false});
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
        }).catch((e) => {
            console.log(e);
        })
    }
}

const styles = StyleSheet.create({
   bottomPanel : {
       height:100,
       backgroundColor: 'rgba(65,68,83,0.8)',
       padding: 20,
       flexDirection : 'row',
       justifyContent: 'center'
   }
});

export default connect(stateMap)(Homescreen);