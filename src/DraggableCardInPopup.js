import React, { Component } from "react";
import { StyleSheet, PanResponder, Animated, Image, TouchableOpacity, Dimensions } from "react-native";
import * as Haptics from 'expo-haptics';
import FadeScaleImage from "./FadeScaleImage"

export default class DraggableCardInPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pan: new Animated.ValueXY(),
            selectedCard: false,
            opacity: new Animated.Value(1),
            popupZoneHeight: Dimensions.get("window").height,
            overReturnToHand: false
            //Step 1
        }


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
                const closestSpot = this.closestSpot(gestureState)
                if (closestSpot) {
                    console.log("closest spot!", closestSpot)
                    if (closestSpot.coords.y < this.state.popupZoneHeight * 0.40) {
                        this.props.dispelInfiniteTsukuyomi()
                        this.props.highlightClosestZone(closestSpot.location)
                    } else {
                        this.props.createInfiniteTsukuyomi()
                        this.props.highlightClosestZone(closestSpot.location)
                        if (closestSpot.location[0] === "cancel") {
                            if (!this.state.overReturnToHand) {
                                this.setState({ overReturnToHand: true })
                            }
                        } else {
                            if (this.state.overReturnToHand) {
                                this.setState({ overReturnToHand: false })
                            }
                        }

                    }
                }
                return Animated.event([null, {
                    dx: this.state.pan.x,
                    dy: this.state.pan.y,
                }])(evt, gestureState)
            },
            onPanResponderRelease: (evt, gestureState) => {
                this.setState({ selectedCard: false })
                if (Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1) {
                    const closestSpot = this.closestSpot(gestureState)
                    if (closestSpot) {
                        Animated.timing(this.state.opacity, {
                            toValue: 0,
                            duration: 500,
                        }).start();
                        let closestZone = closestSpot["location"]

                        this.props.manageCardInPopup([this.props.location, 0], closestZone, this.props.item)
                        this.props.toggleHandZone()
                        this.props.clearPopupZoneBackgrounds()
                        this.props.clearZoneBackgrounds()


                    }
                }
                Animated.spring(            //Step 1
                    this.state.pan,         //Step 2
                    { toValue: { x: 0, y: 0 } }     //Step 3
                ).start();
            },
            onPanResponderTerminate: (evt, gestureState) => {
                this.setState({ selectedCard: false })
                if (Math.abs(gestureState.dx) > 1 || Math.abs(gestureState.dy) > 1) {
                    const closestSpot = this.closestSpot(gestureState)
                    if (closestSpot) {
                        Animated.timing(this.state.opacity, {
                            toValue: 0,
                            duration: 500,
                        }).start();
                        let closestZone = closestSpot["location"]

                        this.props.manageCardInPopup([this.props.location, 0], closestZone, this.props.item)
                        this.props.toggleHandZone()
                        this.props.clearPopupZoneBackgrounds()
                        this.props.clearZoneBackgrounds()
                    }
                }
                Animated.spring(            //Step 1
                    this.state.pan,         //Step 2
                    { toValue: { x: 0, y: 0 } }     //Step 3
                ).start();
            }
        })
    }
    closestSpot = (gesture) => {
        const monsterZones = [...this.props.coords, ...this.props.popupZoneCoords]
        if (monsterZones.length) {
            const closestSpot = monsterZones.sort((zone1, zone2) => Math.hypot(zone1.coords.x - gesture.moveX, zone1.coords.y - gesture.moveY) - Math.hypot(zone2.coords.x - gesture.moveX, zone2.coords.y - gesture.moveY))[0]
            return closestSpot
        }
        return null
    }
    examineCard = () => {
        Haptics.impactAsync("heavy")
        this.props.examineCard(this.props.item)
    }
    componentDidMount() {
        this.props.dispelInfiniteTsukuyomi()
    }
    render() {
        return (
            <Animated.View
                {...this.panResponder.panHandlers}
                style={[this.state.pan.getLayout(), { height: Dimensions.get("window").height * 0.20, flexDirection: "column", justifyContent: "flex-end", alignItems: "center", opacity: (this.props.dragBegin) ? (this.state.selectedCard ? this.state.opacity : 0) : (this.props.inDreamState ? 0 : this.state.opacity) }]}>
                <TouchableOpacity onLongPress={this.examineCard} onPressOut={this.props.dismissExaminePopup} activeOpacity={1} style={{ flexDirection: "column", justifyContent: "flex-end", alignItems: "center", width: 150 * 0.65, height: 300 * 0.65 }}>
                    <FadeScaleImage source={{ uri: this.props.item.card_images[0].image_url_small }} resizeMode={"contain"} style={((this.props.dragBegin && this.state.selectedCard && this.props.inDreamState && !this.state.overReturnToHand) ? { width: 75 * 0.65, height: 150 * 0.65, alignSelf: "center", bottom: -10, zIndex: 500 } : { width: 150 * 0.65, height: 300 * 0.65, alignSelf: "center", bottom: -20 })} />
                </TouchableOpacity>
            </Animated.View>
        );
    }
}