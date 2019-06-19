import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {connect} from "react-redux";
import {View,TouchableOpacity,Text} from 'react-native';
import {Right,Button,Icon} from 'native-base';
import FastImage from 'react-native-fast-image';

class BlogList extends BaseComponent {
    constructor(props) {
        super(props);

    }


    render() {
        this.blog = this.props.blog;
        return (
            <TouchableOpacity onPress={() => {
                this.props.navigation.push('blogView', {
                    itemId : this.blog.id,
                    item : this.blog
                })
            }}>
                <View style={{flexDirection:'row',padding:10,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <FastImage source={{ uri: this.blog.cover }} style={{width:60,height:60}} />
                    <View style={{flex:1, marginLeft:10, marginTop:5}}>
                        <Text style={{fontWeight:'bold',marginTop: 10,color:'grey'}}>{this.blog.title}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(BlogList)