import React, { Component } from 'react'
import {
    View,
    Dimensions,
    WebView
} from 'react-native'

// Based on https://github.com/scazzy/react-native-webview-autoheight
// Made a number of changes mainly to support custom link actions

const injectedScript = function() {
    function addEvent(obj, type, fn) {
        if (obj.addEventListener)
            obj.addEventListener(type, fn, false);
        else if (obj.attachEvent)
            obj.attachEvent('on' + type, function() { return fn.apply(obj, [window.event]);});
    }

    function waitForBridge() {
        if (window.postMessage.length !== 1){
            setTimeout(waitForBridge, 200)
        } else {
            let height = 0;

            if(document.documentElement.clientHeight > document.body.clientHeight) {
                height = document.documentElement.clientHeight
            } else {
                height = document.body.clientHeight
            }

            postMessage(JSON.stringify({ height: height }));

            // Intercept all link clicks
            for(var i=0, a=document.getElementsByTagName('a'), l=a.length; i<l; ++i) {
                addEvent(a[i], 'click', function(e) {
                    postMessage(JSON.stringify({href: this.href}));

                    e.returnValue = false;

                    if (e.preventDefault)
                        e.preventDefault();

                    return false
                })
            }
        }
    }

    waitForBridge()
};

export default class AutoHeightWebView extends Component {
    state = {
        webViewHeight: Number
    };

    static defaultProps = {
        autoHeight: true,
    };

    constructor (props: Object) {
        super(props);

        this.state = {
            webViewHeight: this.props.defaultHeight
        };

        this._onMessage = this._onMessage.bind(this)
    }

    _onMessage(e) {
        const data = JSON.parse(e.nativeEvent.data);

        if (data.height) {
            this.setState({
                webViewHeight: parseInt(data.height)
            })
        } else if (data.href && this.props.onLinkPress) {
            this.props.onLinkPress(data.href)
        }
    }

    render () {
        const _w = this.props.width || Dimensions.get('window').width;
        const _h = this.props.autoHeight ? this.state.webViewHeight : this.props.defaultHeight;

        return (
            <WebView
                injectedJavaScript={'(' + String(injectedScript) + ')();'}
                scrollEnabled={this.props.scrollEnabled || false}
                onMessage={this._onMessage}
                javaScriptEnabled={true}
                automaticallyAdjustContentInsets={true}
                {...this.props}
                style={[{width: _w}, this.props.style, {height: _h}]}
            />
        )
    }
}