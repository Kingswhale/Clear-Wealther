import React from 'react';
import BaseComponent from "../../utils/BaseComponent";
import {connect} from "react-redux";
import {
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    Platform,
    WebView,
    ActivityIndicator,
    Animated, StyleSheet, Dimensions
} from 'react-native';
import {
    Picker,
    Tabs,
    Tab,
    Icon,
    Button,
    Body,
    Left,
    Right, Container, Header, Content
} from 'native-base';
import Api, {API_KEY, BASE_CURRENCY, WEBSITE} from "../../api";
import FastImage from 'react-native-fast-image';
import material from "../../native-base-theme/variables/material";
import EmptyComponent from "../../utils/EmptyComponent";
import Modal from 'react-native-modalbox';
import storage from "../../store/storage";

class MyWebview extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            url : this.props.navigation.getParam('link') + '?webview=true&api_userid=' + this.props.userid +'&apikey=' + API_KEY,
            key : 1
        };
        this.title = this.props.navigation.getParam("title");
    }



    render() {

        return (
            <Container>

                <Header hasTabs>
                    <Left>
                        <Button onPress={() => this.props.navigation.openDrawer()} transparent>
                            <Icon name="ios-menu" />
                        </Button>
                    </Left>
                    <Body >
                    <Text style={{color:'white',fontSize: 16,left:-10}}>{this.title}</Text>
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
                       
                        return true;
                    }}
                />
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column'
    },
    backdrop: {
        backgroundColor: 'black',
        opacity: 0.5,
    },
    anchorStyle: {
        backgroundColor: 'blue',
    },
});


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
    }
})(MyWebview)