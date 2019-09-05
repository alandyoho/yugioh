import { View, StyleSheet, Animated, Easing, Text, TouchableOpacity } from 'react-native';
import React, { Component } from "react"

export default class ShakingImage extends Component {
    constructor() {
        super()
        this.animatedValue = new Animated.Value(0)

    }
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
    handleAnimation = () => {
        // A loop is needed for continuous animation
        return Animated.loop(
            // Animation consists of a sequence of steps
            Animated.sequence([
                // start rotation in one direction (only half the time is needed)
                Animated.timing(this.animatedValue, { toValue: 1.0, duration: 150, easing: Easing.linear, useNativeDriver: true }),
                // rotate in other direction, to minimum value (= twice the duration of above)
                Animated.timing(this.animatedValue, { toValue: -1.0, duration: 300, easing: Easing.linear, useNativeDriver: true }),
                // return to begin position
                Animated.timing(this.animatedValue, { toValue: 0.0, duration: 150, easing: Easing.linear, useNativeDriver: true })
            ])
        )
    }

    render() {
        if (this.props.shaking) {
            this.handleAnimation().start();
        } else {
            this.handleAnimation().stop()
            Animated.timing(this.animatedValue, { toValue: 0.0, duration: 150, easing: Easing.linear, useNativeDriver: true }).start()

        }
        return (
            <Animated.View
                style={[
                    {
                        opacity: this.state.opacity,
                        transform: [
                            {

                                rotate: this.animatedValue.interpolate({
                                    inputRange: [-1, 1],
                                    outputRange: ['-0.1rad', '0.1rad']
                                })
                            }]
                    },
                    this.props.style,
                ]}>
                <Animated.Image
                    onLoad={this.onLoad}
                    {...this.props}
                    source={this.props.source}
                />
                {this.props.shaking ?
                    <TouchableOpacity style={{ width: 30, height: 30, position: "absolute", top: 0, right: 0, borderRadius: 15, zIndex: 5, borderColor: "black", borderWidth: 2, backgroundColor: "red", justifyContent: "center", alignItems: "center" }} onPress={() => this.props.deleteCard(this.props.item)}>
                        <Text>x</Text>
                    </TouchableOpacity> : <View style={{ width: 30, height: 30, position: "absolute", top: 0, right: 0, borderRadius: 15, zIndex: 5, borderColor: "black", borderWidth: 2, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" }}>
                        <Text>x{this.props.item && this.props.item.quantity}</Text>
                    </View>}

            </Animated.View>





        );
    }
}
