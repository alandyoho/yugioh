import React, { Component } from 'react';
import { TouchableOpacity, Alert, View, Image, Dimensions, StyleSheet, Text, Animated, TextInput, TouchableWithoutFeedback, Keyboard, LayoutAnimation, DeviceEventEmitter, ActivityIndicator, SectionList, Button, PanResponder } from "react-native"
import { FlatList } from 'react-native-gesture-handler';
import { FadeScaleImage, SwipeableRow, ShakingImage } from './ComplexComponents';


class ExaminePopupContent extends Component {
    constructor() {
        super()
        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: (evt, gestureState) => {
                // The gesture has started. Show visual feedback so the user knows
                // what is happening!
                // gestureState.d{x,y} will be set to zero now
            },
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.dy > 10) this.props.dismissExaminePopup()
                // The most recent move distance is gestureState.move{X,Y}
                // The accumulated gesture distance since becoming responder is
                // gestureState.d{x,y}
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                // The user has released all touches while this view is the
                // responder. This typically means a gesture has succeeded
            },
            onPanResponderTerminate: (evt, gestureState) => {
                // Another component has become the responder, so this gesture
                // should be cancelled
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                // Returns whether this component should block native components from becoming the JS
                // responder. Returns true by default. Is currently only supported on android.
                return true;
            },
        });
    }
    render() {
        return (
            <React.Fragment>
                <View {...this._panResponder.panHandlers} style={{ flex: 8 / 10 }}>
                    {this.props.selectedCard && <FadeScaleImage resizeMode={"contain"} source={{ uri: this.props.selectedCard.card_images[0].image_url }} style={{ width: "100%", height: "100%", marginTop: 20 }} />}
                </View>
                <View style={{ flex: 2 / 10, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{
                        fontWeight: "800",
                        fontSize: 25,
                        backgroundColor: "transparent",
                        paddingHorizontal: 20,
                        paddingVertical: 20,
                    }}>Quantity</Text>
                    <FlatList
                        data={[1, 2, 3]}
                        horizontal={true}
                        contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                        style={{ flex: 1, width: "100%" }}
                        keyExtractor={(item) => `${item}`}
                        renderItem={({ item, index }) => {
                            let selectedCard = this.props.selectedCard
                            let maxQuant = 3
                            if ('banlist_info' in selectedCard) {
                                if (selectedCard["banlist_info"]["ban_tcg"] == "Limited") {
                                    maxQuant = 1
                                } else if (selectedCard["banlist_info"]["ban_tcg"] == "Semi-Limited") {
                                    maxQuant = 2
                                }
                            }
                            return index + 1 <= maxQuant && (<TouchableOpacity style={{ width: 80, height: "100%", borderRadius: 10, borderColor: "black", borderWidth: 2, justifyContent: "center", alignItems: "center", margin: 10, backgroundColor: index + 1 == selectedCard.quantity ? "black" : "white" }} onPress={() => {
                                this.updateCardQuantity({ value: item, card: selectedCard, username: this.props.user.username, deck: this.props.selectedDeck })
                                selectedCard.quantity = item
                            }}>
                                <Text style={{ fontSize: 25, color: index + 1 == selectedCard.quantity ? "white" : "black" }}>{item}</Text>
                            </TouchableOpacity>)
                        }}
                    />
                </View>
            </React.Fragment>
        )
    }
}

export default ExaminePopupContent