import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";
import {View, TouchableOpacity, Text, ImageBackground, StyleSheet} from 'react-native';
import {Right,Button,Icon} from 'native-base';
import FastImage from 'react-native-fast-image';
import HTMLView from 'react-native-htmlview'
import Time from "../../utils/Time";

class InlineFeed extends BaseComponent {
    constructor(props) {
        super(props);

    }


    render() {
        this.feed = this.props.feed;

        return (
            <TouchableOpacity>
                <View style={{backgroundColor:'white',marginTop:10,marginBottom: 7}}>
                    <View style={{flexDirection: 'row', padding:20,borderBottomWidth:0.5,borderBottomColor: '#EEEEEE'}}>
                        <FastImage style={{width:40,height:40,borderRadius: 20}} source={{uri : this.feed.avatar}}/>
                        <View style={{flex: 1, flexDirection:'row',marginLeft: 10,marginTop:10}}>
                            <Text style={{color:'black',fontWeight:'bold'}}>{this.feed.name} <Text note style={{color:'grey',fontWeight:'normal'}}> - {Time.format(this.feed.time)}</Text></Text>
                        </View>
                    </View>
                    
                    <View style={{marginTop:10}}>
                        {this.feed.full_message !== '' && this.feed.background !== '' && this.feed.background !== 'default' ? (
                            <ImageBackground
                                imageStyle={{resizeMode: 'cover'}}
                                style={{width: '100%',minHeight: 200,flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center'}}
                                source={this.getBackgroundImage(this.feed)}>
                                <HTMLView style={{marginTop: 20,marginBottom: 20, marginLeft: 15,marginRight:15}}
                                          textComponentProps={{ style: bghtmlstyles.defaultStyle }}
                                          value={this.feed.message} />
                            </ImageBackground>

                        ) : null}
                        {this.feed.full_message !== '' && (this.feed.background === '' || this.feed.background === 'default') ? (
                            <HTMLView style={{flex:1, margin:10}}
                                      value={this.feed.message} />
                        ) : null}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    getBackgroundImage(item) {
        let number = item.background.replace("color", "");
        switch(number) {
            case '8':
                return require('./images/img-8.png');
                break;
            case '10':
                return require('./images/img-10.png');
                break;
            case '2':
                return require('./images/img-2.png');
                break;
            case '4':
                return require('./images/img-4.png');
                break;
            case '5':
                return require('./images/img-5.png');
                break;
            case '6':
                return require('./images/img-6.png');
                break;
            case '7':
                return require('./images/img-7.png');
                break;
            case '8':
                return require('./images/img-8.png');
                break;
            case '9':
                return require('./images/img-9.png');
                break;
            case '11':
                return require('./images/img-11.png');
                break;
            case '12':
                return require('./images/img-12.png');
                break;

        }
    }
}

var bghtmlstyles = StyleSheet.create({
    span: {
        fontSize: 35,
        color: 'white',
    },
    defaultStyle: {
        fontSize: 25,
        color: 'white',
        textAlign: 'center',
        margin: 30,
        justifyContent: 'center'
    }
});


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(InlineFeed)