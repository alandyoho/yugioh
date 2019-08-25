import React, { Component } from "react"

import { View, FlatList, Text, StyleSheet, Dimensions, Image, Animated } from "react-native"

let FriendRequestLoadingSmall = require("../../assets/friendRequestLoadingSmall.gif")

export default class FriendRow extends Component {
    constructor() {
        super()
        this.state = { loadingImageOpacity: new Animated.Value(0), contentOpacity: new Animated.Value(0) }
    }

    fadeInLoadingImage = () => {
        Animated.timing(this.state.loadingImageOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }
    handleContentLoad = () => {
        setTimeout(() => {
            Animated.timing(this.state.loadingImageOpacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();
            Animated.timing(this.state.contentOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, 1000)
    }
    render() {
        const { username, imageURL } = this.props.item
        return (
            <View style={{ width: "100%", height: 120, flexDirection: "row" }}>
                <Animated.View
                    style={{ opacity: this.state.contentOpacity, flexDirection: "row", width: "100%", height: 80 }}
                >
                    <Image
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            borderColor: "#000000",
                            marginLeft: "5%"
                        }}
                        onLoad={this.handleContentLoad}
                        source={{ uri: imageURL }} />
                    <View style={{ flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
                        <Animated.Text
                            style={{
                                fontWeight: 'bold',
                                backgroundColor: 'transparent',
                                fontSize: 18,
                                left: 20,
                            }}
                        >{username}</Animated.Text>
                    </View>
                </Animated.View>
                <Animated.Image
                    resizeMode={"cover"}
                    onLoad={this.fadeInLoadingImage}
                    style={{
                        width: "100%", height: "80%", position: "absolute", left: 0, top: 0, opacity: this.state.loadingImageOpacity, zIndex: 10
                    }}
                    source={FriendRequestLoadingSmall} />
            </View>
        )
    }
}