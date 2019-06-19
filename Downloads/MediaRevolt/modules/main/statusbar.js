import React, {Component} from 'react';

import {View,StyleSheet,Platform,Text} from 'react-native';
import material from "../../native-base-theme/variables/material";


export default class StatusBarBackground extends Component{
    render(){
        return(
            <View style={[styles.statusBarBackground, this.props.style || {}]}/>
        );
    }
}

const styles = StyleSheet.create({
    statusBarBackground: {
        height: (Platform.OS === 'ios') ? 18 : 0,
        backgroundColor: material.headerSearchBg,
    }

});