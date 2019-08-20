import React, { Component } from "react";
import { StyleSheet, PanResponder, Animated, Image, TouchableOpacity } from "react-native";
import * as Haptics from 'expo-haptics';
import FadeScaleImage from "./FadeScaleImage"

export default class DraggableCardInHand extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pan: new Animated.ValueXY(),
            selectedCard: false,
            overReturnToHand: false  //Step 1
        };
        this.panResponder = PanResponder.create({    //Step 2
            onStartShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: (evt, gestureState) => {

                this.props.toggleHandZone()
                this.setState({ selectedCard: true })
            },
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return !(gestureState.dx < 2 && gestureState.dy < 2 && Math.abs(gestureState.vx) < 5)
            },
            onPanResponderMove: (evt, gestureState) => {
                // do whatever you need here
                // be sure to return the Animated.event as it returns a function
                const closestSpot = this.closestSpot(gestureState)
                if (closestSpot) {
                    if (closestSpot.location[0] === "cancel") {
                        if (!this.state.overReturnToHand) {
                            this.setState({ overReturnToHand: true })
                        }
                    } else {
                        if (this.state.overReturnToHand) {
                            this.setState({ overReturnToHand: false })
                        }
                    }
                    this.props.highlightClosestZone(closestSpot.location)
                }
                return Animated.event([null, {
                    dx: this.state.pan.x,
                    dy: this.state.pan.y,
                }])(evt, gestureState)
            }
            ,
            onPanResponderRelease: (evt, gestureState) => {
                this.props.toggleHandZone()
                this.props.clearZoneBackgrounds()
                Animated.spring(            //Step 1
                    this.state.pan,         //Step 2
                    { toValue: { x: 0, y: 0 } }     //Step 3
                ).start();
                this.setState({ selectedCard: false })
                if (Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1) {
                    const closestSpot = this.closestSpot(gestureState)
                    if (closestSpot && closestSpot.location[0] !== "cancel") {
                        this.props.presentHandOptions(closestSpot.location, this.props.item)
                    }
                } else {

                }
            },
            onPanResponderTerminate: (evt, gestureState) => {
                this.props.toggleHandZone()
                this.props.clearZoneBackgrounds()
                Animated.spring(            //Step 1
                    this.state.pan,         //Step 2
                    { toValue: { x: 0, y: 0 } }     //Step 3
                ).start();
                this.setState({ selectedCard: false })
                if (Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1) {
                    const closestSpot = this.closestSpot(gestureState)
                    if (closestSpot && closestSpot.location[0] !== "cancel") {
                        this.props.presentHandOptions(closestSpot.location, this.props.item)
                    }
                } else {

                }
            }
        });
    }
    closestSpot = (gesture) => {
        const monsterZones = this.props.coords
        if (monsterZones.length) {
            const closestSpot = monsterZones.sort((zone1, zone2) => Math.hypot(zone1.coords.x - gesture.moveX, zone1.coords.y - gesture.moveY) - Math.hypot(zone2.coords.x - gesture.moveX, zone2.coords.y - gesture.moveY))
            return closestSpot[0]
        }
        return null
    }
    examineCard = () => {
        Haptics.impactAsync("heavy")
        this.props.examineCard(this.props.item)
    }
    render() {
        return (
            <Animated.View
                {...this.panResponder.panHandlers}
                style={[this.state.pan.getLayout(), { flex: 1, flexDirection: "column", justifyContent: "flex-end", alignItems: "center", opacity: (this.props.dragBegin) ? (this.state.selectedCard ? 1 : 0) : 1 }]}>
                <TouchableOpacity onLongPress={this.examineCard} onPressOut={this.props.dismissExaminePopup} activeOpacity={1} style={{ flexDirection: "column", justifyContent: "flex-start", alignItems: "center", width: 100, height: 200 }}>
                    <FadeScaleImage source={{ uri: this.props.item.card_images[0].image_url_small }} resizeMode={"contain"} style={(this.props.dragBegin && !this.state.overReturnToHand) ? { width: 50, height: 100, alignSelf: "center" } : { width: 100, height: 200, alignSelf: "center" }} />
                </TouchableOpacity>
            </Animated.View>
        );
    }
}