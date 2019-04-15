import React from 'react';
import BaseComponent from "./BaseComponent";
import {Animated} from "react-native";

export default class ProfileBaseComponent extends BaseComponent {
    constructor(props) {
        super(props);
        this.lastScrollPos = 0;

        this.state.processing = false;
        this.state.showHeaderContent  =  true;
        this.state.scrollY =  new Animated.Value(0);

        this.profileDetails = null;
        this.lastScroll = 0;
        this.state.imageTranslate = this.state.scrollY.interpolate({
            inputRange: [0, 20],
            outputRange: [0, -160],
            extrapolate: 'clamp',
        });
    }

    onScroll(event) {
        const offsetY = event.nativeEvent.contentOffset.y;
        let currentTime = new Date().getTime() / 1000;
        const sensitivity = 130;
        if (Math.abs(offsetY - this.offset) > sensitivity || offsetY === 0) {
            this.offset = offsetY;

            this.isUping = false;
            this.isDowning = true;
            this.lasttime = currentTime;
            Animated.event(
                [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
                {onScroll: this.props.onScroll}
            )(event);

        }

        if (offsetY >= 130) {
            if (this.state.showHeaderContent) {
                this.updateState({
                    showHeaderContent: false
                })
            }
        } else {
            if (!this.state.showHeaderContent) {
                this.updateState({
                    showHeaderContent: true
                })
            }
        }
    }
}