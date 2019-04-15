import React from 'react';
import BaseComponent from "../../../utils/BaseComponent";
import {connect} from "react-redux";
import {Text} from 'react-native';

class EditFeed extends BaseComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Text>Edit Feed</Text>
        )
    }
}


export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username
    }
})(EditFeed)