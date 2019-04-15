import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {FlatList,Text,Image} from 'react-native';
import {
    Container,
    Header,
    Left,
    Body,
    Icon,
    Button,
    Content,
    ListItem,
    Input,
    Item
} from 'native-base';
import { MaterialDialog } from 'react-native-material-dialog';

export default class SelectFeelings extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            lists : [
                {name : this.lang.t('listening_to'), icon: require('../images/status/listening-to.png'), id: 'listening-to'},
                {name : this.lang.t('watching'), icon: require('../images/status/watching.png'), id: 'watching'},
                {name : this.lang.t('feeling'), icon: require('../images/status/feeling.png'), id: 'feeling'},
                {name : this.lang.t('thinking'), icon: require('../images/status/thinking-about.png'), id: 'thinking'},
                {name : this.lang.t('reading'), icon: require('../images/status/reading.png'), id: 'reading'},
                {name : this.lang.t('eating'), icon: require('../images/status/eating.png'), id: 'eating'},
                {name : this.lang.t('drinking'), icon: require('../images/status/drinking.png'), id: 'drinking'},
                {name : this.lang.t('celebrating'), icon: require('../images/status/celebrating.png'), id: 'celebrating'},
                {name : this.lang.t('exercising'), icon: require('../images/status/exercising.png'), id: 'exercising-to'},
                {name : this.lang.t('meeting'), icon: require('../images/status/meeting.png'), id: 'meeting'},
                {name : this.lang.t('playing'), icon: require('../images/status/playing.png'), id: 'playing'},
                {name : this.lang.t('looking_for'), icon: require('../images/status/looking-for.png'), id: 'looking-for'},

            ],
            type : '',
            value : '',
            showModal : false,
            modalTitle : ''
        }
    }

    render() {
        return (
            <Container style={{backgroundColor:'white'}}>
                <Header hasTabs>
                    <Left>
                        <Button onPress={() => this.props.navigation.goBack()} transparent>
                            <Icon name="ios-arrow-round-back" />
                        </Button>
                    </Left>
                    <Body >
                        <Text style={{color:'white',fontSize: 16,left:-50}}>{this.lang.t('how_are_feeling')}</Text>
                    </Body>
                </Header>
                <Content>
                    <FlatList
                        keyExtractor={(item, index) => item.id}
                        data={this.state.lists}
                        style={{flex:1}}
                        renderItem={({ item ,index}) => (
                            <ListItem onPress={() => {
                                this.updateState({
                                    type : item.id,
                                    modalTitle: item.name,
                                    showModal : true
                                })
                            }} icon>
                                <Left>
                                    <Image source={item.icon} style={{width:30,height:30}} />
                                </Left>
                                <Body>
                                <Text>{item.name}</Text>
                                </Body>
                            </ListItem>
                        )}
                    />
                </Content>

                <MaterialDialog
                    title={this.state.modalTitle}
                    visible={this.state.showModal}
                    onOk={() => {
                        this.updateState({ showModal: false });
                        if (this.state.value !== "" ) {
                            this.props.navigation.getParam("obj").updateState({
                                feeling_type : this.state.type,
                                feeling_text : this.state.value
                            });
                            this.props.navigation.goBack();
                        }
                    }}
                    onCancel={() => this.updateState({showModal: false })}>
                    <Item rounded>
                        <Input placeholder={this.state.modalTitle}
                               value={this.state.value}
                               onChangeText={(txt) => this.updateState({value: txt})}/>
                    </Item>
                </MaterialDialog>
            </Container>
        )
    }
}