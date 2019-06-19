import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {connect} from "react-redux";
import {View,TouchableOpacity,Text} from 'react-native';
import {Right,Button,Icon} from 'native-base';
import FastImage from 'react-native-fast-image';

class EventList extends BaseComponent {
    constructor(props) {
        super(props);

    }


    render() {
        this.event = this.props.event;
        return (
            <TouchableOpacity onPress={() => {
                this.props.navigation.push('eventView', {
                    itemId : this.event.id,
                    item : this.event
                })
            }}>
                <View style={{flexDirection:'row',padding:10,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <FastImage source={{ uri: this.event.cover }} style={{width:60,height:60,borderRadius:30}} />
                    <View style={{flex:1, marginLeft:10, marginTop:5}}>
                        <Text style={{fontWeight:'bold',marginTop: 10,color:'grey'}}>{this.event.title}</Text>
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
})(EventList)