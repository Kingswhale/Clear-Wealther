import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {View,Text,TouchableOpacity,ActivityIndicator} from 'react-native';
import {
    Header,
    Icon,
    Container,
    Left,Right,Button,Body,Content,Form,Textarea,Label,Toast,Input,Item
} from 'native-base'
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../../../api";
import GridView from 'react-native-super-grid';
import EmptyComponent from "../../../utils/EmptyComponent";
import FastImage from 'react-native-fast-image'
import material from "../../../native-base-theme/variables/material";
import Frisbee from "frisbee";

class Gif extends BaseComponent {
    limit = 20;
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            term : '',
            processing : false
        };

    }


    componentDidMount() {
        this.fetchGifs('');
    }
    fetchGifs(term) {
        let search_url = "https://api.tenor.com/v1/search";
        Api.get(search_url,{
            tag : term,
            limit : this.limit,
        }, false).then((res) => {
            console.log(res);
            this.updateState({itemLists: res.results,fetchFinished: true})
        }).catch((e) => {
            //console.log(e);
        })
    }

    render() {
        return (
            <Container>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
                <Header hasTabs >
                    <Button transparent onPress={() => {
                        this.props.navigation.goBack();
                    }} style={{marginLeft:10}}>
                        <Icon name="ios-arrow-round-back"/>
                    </Button>
                    <View style={{flexDirection:'row',width:'100%'}}>
                        <Item style={{bottom: 3,borderRadius:10,flex:1,backgroundColor:material.brandPrimary,borderColor:material.brandPrimary}}>

                            <Input style={{color:'white'}} ref={(ref) => this.searchInput = ref} placeholder={this.lang.t('search_gif')}  onChangeText={(text) => {
                                this.fetchGifs(text);
                            }}/>
                            <Icon style={{color:'white',marginRight:30}} name="ios-search" />
                        </Item>
                    </View>
                </Header>
                <GridView
                    itemDimension={130}
                    style={{flex: 1,marginTop:10}}
                    items={this.state.itemLists}
                    onEndReachedThreshold={.5}
                    ref='_flatList'
                    extraData={this.state}
                    refreshing={this.state.refreshing}
                    keyExtractor={(item, index) => item.id}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {(!this.state.fetchFinished) ? (
                            <ActivityIndicator size='large' />
                        ) : null}

                    </View>}
                    renderItem={item => (
                        <View style={{height: 130,padding:0}}>
                            <TouchableOpacity onPress={() => {
                                this.submitToRequestor(item.media[0].gif.url);
                            }}>
                                <FastImage style={{width:'100%',height:130,resizeMode: 'cover'}} source={{uri : item.media[0].gif.url}}/>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </Container>
        );
    }

    submitToRequestor(item) {
        this.props.navigation.getParam("component").receiveGif(item);
        this.props.navigation.goBack();
    }
}


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(Gif)