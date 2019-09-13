// import { View, StyleSheet, Animated, Easing, Text, TouchableOpacity } from 'react-native';
// import React, { Component } from "react"
// import * as FileSystem from "expo-file-system"


// export default class ShakingImage extends Component {
//     constructor() {
//         super()
//         this.animatedValue = new Animated.Value(0)

//     }
//     state = {
//         opacity: new Animated.Value(0),
//     }
//     async componentDidMount() {
//         FileSystem.documentDirectory + "CARD_IMAGES"
//     }


//     onLoad = () => {
//         Animated.timing(this.state.opacity, {
//             toValue: 1,
//             duration: 500,
//             useNativeDriver: true,
//         }).start();

//     }
//     handleAnimation = () => {
//         // A loop is needed for continuous animation
//         return Animated.loop(
//             // Animation consists of a sequence of steps
//             Animated.sequence([
//                 // start rotation in one direction (only half the time is needed)
//                 Animated.timing(this.animatedValue, { toValue: 1.0, duration: 150, easing: Easing.linear, useNativeDriver: true }),
//                 // rotate in other direction, to minimum value (= twice the duration of above)
//                 Animated.timing(this.animatedValue, { toValue: -1.0, duration: 300, easing: Easing.linear, useNativeDriver: true }),
//                 // return to begin position
//                 Animated.timing(this.animatedValue, { toValue: 0.0, duration: 150, easing: Easing.linear, useNativeDriver: true })
//             ])
//         )
//     }

//     render() {
//         if (this.props.shaking) {
//             this.handleAnimation().start();
//         } else {
//             this.handleAnimation().stop()
//             Animated.timing(this.animatedValue, { toValue: 0.0, duration: 150, easing: Easing.linear, useNativeDriver: true }).start()

//         }
//         return (
//             <Animated.View
//                 style={[
//                     {
//                         opacity: this.state.opacity,
//                         transform: [
//                             {

//                                 rotate: this.animatedValue.interpolate({
//                                     inputRange: [-1, 1],
//                                     outputRange: ['-0.1rad', '0.1rad']
//                                 })
//                             }]
//                     },
//                     this.props.style,
//                 ]}>
//                 <Animated.Image
//                     onLoad={this.onLoad}
//                     {...this.props}
//                     source={{ uri: this.props.storedCards[this.props.item.id] ? this.props.storedCards[this.props.item.id] : this.props.source }}
//                 />
//                 {this.props.shaking ?
//                     <TouchableOpacity style={{ width: 30, height: 30, position: "absolute", top: 0, right: 0, borderRadius: 15, zIndex: 5, borderColor: "black", borderWidth: 2, backgroundColor: "red", justifyContent: "center", alignItems: "center" }} onPress={() => this.props.deleteCard(this.props.item)}>
//                         <Text>x</Text>
//                     </TouchableOpacity> : <View style={{ width: 30, height: 30, position: "absolute", top: 0, right: 0, borderRadius: 15, zIndex: 5, borderColor: "black", borderWidth: 2, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" }}>
//                         <Text>x{this.props.item && this.props.item.quantity}</Text>
//                     </View>}

//             </Animated.View>
//         );
//     }
// }

import { View, StyleSheet, Animated, Easing, Text, TouchableOpacity } from 'react-native';
import React, { Component } from "react"
import * as FileSystem from "expo-file-system"


export default class ShakingImage extends Component {
    constructor() {
        super()
        this.animatedValue = new Animated.Value(0)

    }
    state = {
        imageOpacity: new Animated.Value(0),
        imageBackground: new Animated.Value(0),
        opacity: new Animated.Value(0),
    }
    componentDidMount() {

    }
    onLoadStart = () => {
        console.log("on load start")
        this.imageFadeAnimation().start()
    }
    onLoadEnd = async () => {
        this.imageFadeAnimation().start(() => {
            Animated.timing(this.state.imageOpacity, {
                toValue: 1,
                duration: 250
            }).start()
        })

        // this.imageFadeAnimation().stop()
    }

    // onLoadStart => we want the user to see the fade in fade out view
    // 	set opacity of Image to 0
    // 	set the animated.view’s background color to grey, activate the animation
    // onLoadEnd => we want the user to see the card
    // 	animate opacity of Image to 1
    // 	stop the animated.view’s animation

    imageFadeAnimation = () => {
        return Animated.loop(
            Animated.sequence([
                Animated.timing(this.state.imageBackground, {
                    toValue: 1,
                    duration: 500,
                }),
                Animated.timing(this.state.imageBackground, {
                    toValue: 0,
                    duration: 500
                })
            ]),
            {
                iterations: 2
            }
        )
    }

    handleAnimation = () => {
        // A loop is needed for continuous animation
        return Animated.loop(
            // Animation consists of a sequence of steps
            Animated.sequence([
                // start rotation in one direction (only half the time is needed)
                Animated.timing(this.animatedValue, { toValue: 1.0, duration: 150, easing: Easing.linear }),
                // rotate in other direction, to minimum value (= twice the duration of above)
                Animated.timing(this.animatedValue, { toValue: -1.0, duration: 300, easing: Easing.linear }),
                // return to begin position
                Animated.timing(this.animatedValue, { toValue: 0.0, duration: 150, easing: Easing.linear })
            ])
        )
    }

    render() {
        const imageBackground = this.state.imageBackground.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgb(249, 249, 249)", "#FFF"]
            // outputRange: ["red", "#FFF"]

        })
        if (this.props.shaking) {
            this.handleAnimation().start();
        } else {
            this.handleAnimation().stop()
            Animated.timing(this.animatedValue, { toValue: 0.0, duration: 150, easing: Easing.linear, }).start()

        }
        return (
            <Animated.View
                style={[
                    {
                        // opacity: this.state.opacity,
                        backgroundColor: imageBackground,
                        borderRadius: 10,
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
                    // onLoadStart={this.onLoadStart}
                    onLoad={this.onLoadEnd}
                    style={{ ...this.props.style, opacity: this.state.imageOpacity }}
                    resizeMode={"contain"}
                    // style={{ opacity:  }}
                    source={{ uri: this.props.storedCards[this.props.item.id] ? this.props.storedCards[this.props.item.id] : this.props.source }}
                />
                {this.props.shaking ?
                    <TouchableOpacity style={{ width: 30, height: 30, position: "absolute", top: 0, right: 0, borderRadius: 15, zIndex: 5, borderColor: "black", borderWidth: 2, backgroundColor: "red", justifyContent: "center", alignItems: "center" }} onPress={() => this.props.deleteCard(this.props.item)}>
                        <Text>x</Text>
                    </TouchableOpacity> : <Animated.View style={{ width: 30, height: 30, position: "absolute", top: 0, right: 0, borderRadius: 15, zIndex: 5, borderColor: "black", borderWidth: 2, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", opacity: this.state.imageOpacity }}>
                        <Text>x{this.props.item && this.props.item.quantity}</Text>
                    </Animated.View>}

            </Animated.View>
        );
    }
}
