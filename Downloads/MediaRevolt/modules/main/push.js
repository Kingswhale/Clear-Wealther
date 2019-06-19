import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {View,Text} from 'react-native';
import {
    Header,
    Icon,
    Container,
    Left,Right,Button,Body,Content,Form,Textarea,Label,Toast
} from 'native-base'
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../../api";
import firebase from 'react-native-firebase';

 class Push extends BaseComponent {
    constructor(props) {
        super(props);

        this.message = this.props.navigation.getParam("message");
        this.props.navigation.addListener('didFocus', (status: boolean) => {
            try{
                firebase.notifications().removeDeliveredNotification('push');
            } catch (e) {}
        });
    }

    componentWillMount() {
        try{
            firebase.notifications().removeDeliveredNotification('push');
        } catch (e) {}
    }


    render() {
        return (
            <Container>

                <Header hasTabs noShadow>
                    <Left>
                        <Button transparent onPress={() => {
                            this.props.navigation.goBack();
                        }}>
                            <Icon name="ios-arrow-round-back"/>
                        </Button>
                    </Left>
                    <Body>
                        <Text style={{color:'white'}}>{this.lang.t('notification')}</Text>
                    </Body>
                </Header>
                <Content>
                    <Text style={{margin:10}}>{this.message}</Text>
                </Content>
            </Container>
        );
    }
}


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(Push)