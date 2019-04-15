import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {connect} from "react-redux";
import {View,TouchableOpacity,Text} from 'react-native';
import {Right,Button,Icon} from 'native-base';
import FastImage from 'react-native-fast-image';

class GroupList extends BaseComponent {
    constructor(props) {
        super(props);

    }


    render() {
        this.group = this.props.group;
        return (
            <TouchableOpacity onPress={() => {
                this.props.navigation.push("groupView", {
                    itemId : this.group.id,
                    item : this.group
                });
            }}>
                <View style={{flexDirection:'row',padding:10,borderBottomWidth:0.6,borderBottomColor:'#EEEEEE'}}>
                    <FastImage source={{ uri: this.group.logo }} style={{width:60,height:60,borderRadius:30}} />
                    <View style={{flex:1, marginLeft:10, marginTop:5}}>
                        <Text style={{fontWeight:'bold',marginTop: 10,color:'grey'}}>{this.group.title}</Text>
                    </View>
                    <Button onPress={() => {

                    }} small style={{}} primary >
                        <Text style={{color:'white',marginLeft:10,marginRight: 10}}>{this.lang.t('group')}</Text>
                    </Button>
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
})(GroupList)