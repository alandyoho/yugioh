import { View, StyleSheet, Animated, Text } from 'react-native';
import React, { Component } from "react"

export default class FadeScaleText extends Component {
    state = {
        opacity: new Animated.Value(0),

    }

    onLayout = () => {
        Animated.timing(this.state.opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }
    render() {
        return (
            <Animated.Text
                onLayout={this.onLayout}
                {...this.props}
                style={[
                    {
                        opacity: this.state.opacity,
                        transform: [
                            {
                                scale: this.state.opacity.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.85, 1],
                                })
                            }]
                    },
                    this.props.style,
                ]}
            >{this.props.title}</Animated.Text>
        );
    }
}
