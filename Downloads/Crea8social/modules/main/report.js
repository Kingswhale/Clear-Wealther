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

 class Report extends BaseComponent {
    constructor(props) {
        super(props);

        this.link = this.props.navigation.getParam("link");
        this.type = this.props.navigation.getParam("type");
        this.state = {
            ...this.state,
            reason : '',
            processing : false
        };
    }

    submitForm() {
        if (this.state.reason === '') {
            Toast.show({
                text : this.lang.t('provide_reason_report'),
                type : 'danger'
            })
        } else {
            this.updateState({processing: true});

            Api.get("report/item", {
                link : this.link,
                type : this.type,
                reason : this.state.reason,
                userid : this.props.userid,
            }).then((res) => {
                this.updateState({processing: false});
                Toast.show({
                    text : this.lang.t('thanks_for_report'),
                    type : 'success'
                });
                this.props.navigation.goBack();
            }).catch((e) => {
                this.updateState({processing: false});
                Toast.show({
                    text : this.lang.t('something_went_wrong_try_again'),
                    type : 'danger'
                })
            })
        }
    }

    render() {
        return (
            <Container>
                <Spinner visible={this.state.processing} textContent="" textStyle={{color: '#FFF'}} />
                <Header hasTabs noShadow>
                    <Left>
                        <Button transparent onPress={() => {
                            this.props.navigation.goBack();
                        }}>
                            <Icon name="ios-arrow-round-back"/>
                        </Button>
                    </Left>
                    <Body>
                        <Text style={{color:'white'}}>{this.lang.t('report')}</Text>
                    </Body>
                    <Right>
                        <Button transparent onPress={() => {
                            this.submitForm();
                        }}>
                            <Text style={{color:'white'}}>{this.lang.t('send').toUpperCase()}</Text>
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <Form style={{padding:20}}>
                        <Label >{this.lang.t('why_do_report')}</Label>
                        <Textarea
                            onChangeText={(text) => this.updateState({reason: text})}
                            rowSpan={7} bordered placeholder={this.lang.t('reason')} />
                    </Form>
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
})(Report)