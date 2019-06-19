import React, {Component} from 'react';

import {
    Container,
    Button,
    Icon,
    Item,
    Input,
    Header,Body
} from 'native-base';

import {
    Text,
    WebView,View,ActivityIndicator
} from 'react-native';

import material from '../../native-base-theme/variables/material';
import Spinner from 'react-native-loading-spinner-overlay';
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";
import {API_KEY, WEBSITE} from "../../api";
import storage from "../../store/storage";
import {NavigationActions, StackActions} from "react-navigation";

class Membership extends BaseComponent {

    constructor(props) {
        super(props);
        this.link = WEBSITE + 'membership/choose-plan?webview=true&api_userid=' + this.props.userid+'&apikey=' + API_KEY;
        this.state = {
            loading : true,
            url : this.link,
            key : 1
        }
    }

    render() {
        return (
            <Container>
                <Header hasTabs style={{height:59}}>

                    <Body >
                    <Text style={{color:'white',fontSize: 16,bottom:5}}>{this.lang.t('membership_plan')}</Text>
                    </Body>

                </Header>
                <WebView
                    ref="webView"
                    source={{uri: this.state.url}}
                    key={this.state.key}
                    startInLoadingState={this.state.loading}
                    bounces={false}
                    allowUniversalAccessFromFileURLs={true}
                    userAgent={"Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13E233 Safari/601.1"}
                    onLoadEnd={() => this.updateState({loading: false})}

                    onNavigationStateChange={(event) => {
                        if (event.url !== this.state.url) {

                            if (event.url.match(WEBSITE)) {
                                if (event.url.match("payment/success") || event.url.match("user/welcome") || event.url.match("feed")) {
                                    //payment done we can go ahead to getstarted
                                    storage.set('need_membership', "0"); //disable re-show of membership plan selection
                                    if (this.props.avatar !== '') {
                                        const resetAction = StackActions.reset({
                                            index: 0,
                                            actions: [NavigationActions.navigate({ routeName: 'main' })],
                                        });
                                        this.props.navigation.dispatch(resetAction);
                                    } else {
                                        const resetAction = StackActions.reset({
                                            index: 0,
                                            actions: [NavigationActions.navigate({ routeName: 'getstarted' })],
                                        });
                                        this.props.navigation.dispatch(resetAction);
                                    }
                                    return false;
                                } else if(event.url.match("payment/cancel")) {
                                    //payment canceled
                                    this.updateState({url : this.link, key : this.state.key + 1});
                                    return false;
                                }
                            }
                        }
                        return true;
                    }}
                />
            </Container>
        )
    }
}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(Membership)
