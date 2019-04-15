import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {connect} from "react-redux";
import {Text, View, ScrollView, ActivityIndicator,StyleSheet,FlatList,TouchableOpacity,Platform} from 'react-native';
import {
    Container,
    Header,
    Icon,
    Input, Button, Item
} from 'native-base';
import EmptyComponent from "../../../utils/EmptyComponent";
import FastImage from 'react-native-fast-image'
import Api from "../../../api";
import material from "../../../native-base-theme/variables/material";
import update from 'immutability-helper';
import Feed from '../feed'

class ViewFeed extends BaseComponent {
    offset = 0;
    limit = 20;
    constructor(props) {
        super(props);
        this.state.processing = false;
        this.state.itemLists.push(this.props.navigation.getParam("item", null));
        this.entityType = this.props.navigation.getParam("entityType", "user");
        this.entityTypeId = this.props.navigation.getParam("entityTypeId", this.props.userid);

        this.state.selected =  (new Map(): Map<string, Object>);
    }

    render() {
        //console.log(this.props.photos);
        return (
            <Container style={{backgroundColor:'white'}}>

                <Header hasTabs noShadow style={{height:50,padding:0}}>
                    <View style={{flexDirection:'row',width:'100%'}}>
                        <Button style={{bottom: 5,left:-10}} transparent onPress={() => {
                            this.props.navigation.goBack()
                        }}>
                            <Icon name="ios-arrow-round-back" style={{color:'white'}}/>
                        </Button>
                        <Text style={{color:'white',fontWeight: 'bold',left:-12, marginTop: (Platform.OS === 'android') ? 10 : 0}}>{this.lang.t('post')}</Text>

                    </View>

                </Header>

                <ScrollView style={{flexDirection:'column',flex:1}}>
                    <Feed
                        component={this}
                        listId="itemLists"
                        index={0}
                        navigation={this.props.navigation}
                        feedType={this.state.itemLists[0].type}
                        entityId={this.state.itemLists[0].entity_id}
                        entityType={this.state.itemLists[0].entity_type}
                        item={this.state.itemLists[0]}/>
                </ScrollView>


            </Container>
        );
    }

}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
    }
})(ViewFeed)