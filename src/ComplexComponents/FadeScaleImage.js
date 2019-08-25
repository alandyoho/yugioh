import { View, StyleSheet, Animated } from 'react-native';
import React, { Component } from "react"

export default class FadeScaleImage extends Component {
    state = {
        opacity: new Animated.Value(0),

    }

    onLoad = () => {
        Animated.timing(this.state.opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }

    // source={this.props.item.set ? require("../assets/default_card.png") : { uri: this.props.item.card_images[0].image_url_small }} resizeMode={"contain"} style={[{ transform: this.props.item.defensePosition ? [{ rotate: '90deg' }] : [{ rotate: '0deg' }] }
    render() {

        return (
            <Animated.Image
                onLoad={this.onLoad}
                {...this.props}
                source={(this.props.item && this.props.item.set) ? require("../../assets/default_card.png") : this.props.source}
                style={[
                    {
                        opacity: this.state.opacity,
                        transform: [
                            {
                                scale: this.state.opacity.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.85, 1],
                                })
                            }, { rotate: (this.props.item && this.props.item.defensePosition) ? '90deg' : '0deg' }]
                    },
                    this.props.style,
                ]}
            />
        );
    }
}
