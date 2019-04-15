import React, {Component} from 'react';
import {Text,View,Image,TouchableOpacity,FlatList} from 'react-native';
import { connect } from "react-redux";
import {
    Container,
    ListItem,
    Left,
    Body,
    Icon,
    List,
    Button,
    Badge
} from 'native-base';
import {menus} from '../../menu'
import {NavigationActions,StateUtils,StackActions} from 'react-navigation'
import BaseComponent from "../../utils/BaseComponent";
import FastImage from 'react-native-fast-image'
import material from "../../native-base-theme/variables/material";
import {Storage} from "../../store/storage";
import storage from "../../store/storage";
import Api from "../../api";

const stateMap = (state) => {
   // console.log('state', state);
    return {
        userid : state.auth.userid,
        username : state.auth.username,
        password : state.auth.password,
        avatar : state.auth.avatar,
        menus : state.auth.menus,
        cover : state.auth.cover
    };
};

 class Menu extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            menuItems : [],
            adminMenus : []
        };
        //console.log(this.props.userid + ' - i am here');

    }

    componentDidMount() {
        this.loadAdminMenus();
    }
     loadAdminMenus() {
        Api.get("get/menu", {
            userid : this.props.userid
        }).then((res) => {
            let adminMenus = [];
            for(let i = 0;i<res.length;i++) {
                adminMenus.push({
                    name : res[i].title,
                    id : 'webview',
                    icon : 'ios-arrow-dropup',
                    color : material.brandPrimary,
                    param : {link : res[i].link, title : res[i].title}
                })
            };

            this.updateState({adminMenus: adminMenus});
        });
     }

    getMenuItems() {
        let theMenus = [];
        for(let i =0;i<menus.length;i++) {
            let menu = menus[i];
            if (menu.translated === undefined) {
                menu.name = this.lang.t(menu.name);
                menu.translated = true;
            }
            theMenus.push(menu);
        }
        return theMenus;
    }

    getOtherMenus() {
        return [
            {id : 'divider'},
            {name : this.lang.t('account_settings'), id : 'settings', icon : 'ios-cog', color: '#2196F3'},
            {name : this.lang.t('logout'), id : 'logout', icon : 'md-power', color: '#F44336'}
        ]
    }


    render() {
        const resizeMode = 'cover';

        let menuItems = [];
        let mainMenus = this.getMenuItems();
        menuItems.push(...mainMenus);
        menuItems.push(...this.state.adminMenus);

        let otherMenus = this.getOtherMenus();
        menuItems.push(...otherMenus);
        //console.log(this.props.cover + 'sdjdsksdjk');
        return (
            <Container style={{flex:1, backgroundColor: 'white'}}>
                <FlatList
                    ListHeaderComponent={<View style={{height: 170,backgroundColor: material.brandPrimary}}>
                            <FastImage
                                style={{width: '100%',height: 170,flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'}}
                                source={{uri : this.props.cover}}>

                            <View style={{position:'absolute', top: 0,height:170,width:'100%',backgroundColor:'rgba(0,0,0,0.5)'}}/>
                            <View style={{ borderBottomColor: '#F9FAFB', borderBottomWidth: 2,padding: 30, paddingTop: 30, position: 'absolute', top: 0, left: 0,right:0,bottom:0,height:170}}>

                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.dispatch(StackActions.push({
                                        routeName: 'profile',
                                        params: { id: this.props.userid },
                                    }));
                                }}>
                                    <FastImage style={{width:70,height:70,borderRadius:35,borderWidth: 3,borderColor:'white'}} source={{uri: this.props.avatar}} />
                                </TouchableOpacity>
                                <Text style={{color:'lightgrey',fontSize:17, marginTop: 15}}>{this.props.username}</Text>
                                <View style={{position:'absolute', right: 20, top: 50,flexDirection:'row'}}>
                                    <Button onPress={() => {
                                        //console.log(this.props.userid);
                                        this.props.navigation.navigate("settings")
                                        //this.props.navigation.push("profile", {userid: 4})
                                    }} transparent>
                                        <Icon name="ios-cog" style={{color:'lightgrey', fontSize:30,marginTop:0}}/>
                                    </Button>

                                    <Button onPress={() => {
                                        this.props.navigation.dispatch(StackActions.push({
                                            routeName: 'profile',
                                            params: { id: this.props.userid },
                                        }));
                                    }} transparent>
                                        <Icon name="md-person" style={{color:'lightgrey', fontSize:30,marginLeft:10}}/>
                                    </Button>
                                </View>
                            </View>
                        </FastImage>
                    </View>}
                    data={menuItems}
                    keyExtractor={(item, index) => item.name}
                    bounces={false}
                    renderItem={(data) => (
                        <List style={{marginBottom: 0}}>
                            {data.item.id === 'divider' ? (
                                <View itemDivider style={{
                                    marginBottom:10,
                                    paddingLeft:15,
                                    borderBottomColor:'#CCCCCC',
                                    borderBottomWidth: .7,
                                    paddingTop:5,paddingBottom:5}}>
                                    <Text>{data.item.name}</Text>
                                </View>
                            ) : (
                                <ListItem onPress={() => {
                                    this.navigate(data.item);
                                }} noBorder icon style={{marginBottom:10}}>
                                    <Left>
                                        <Badge style={{width:30,height:30,borderRadius:15,backgroundColor: data.item.color, top:10}}>
                                            <Icon style={{color:'white',fontSize:18,top:3,left:2 }} name={data.item.icon} />
                                        </Badge>
                                    </Left>
                                    <Body>
                                    <Text style={{fontSize:16,fontWeight:'bold', color:'#303030'}}>{data.item.name}</Text>
                                    </Body>
                                </ListItem>
                            )}
                        </List>
                    )}/>
            </Container>
        )
    }

    navigate(item) {
        this.props.navigation.closeDrawer();
        if (item.webview !== undefined) {
            //its a webview
        } else if(item.id === 'logout') {
            //console.log('I am logoing out')
            storage.logout().then(() => {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'start' })],
                });
                this.props.navigation.dispatch(resetAction);
            });
        }
        else {
            if (item.param !== undefined) {
                this.props.navigation.dispatch(StackActions.push({
                    routeName: item.id,
                    params: item.param,
                }));
            } else {
                this.props.navigation.navigate(item.id, item.param);
            }
        }
    }
}

export default connect(stateMap)(Menu)