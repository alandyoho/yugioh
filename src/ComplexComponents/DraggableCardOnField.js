import React, { Component } from "react";
import { StyleSheet, PanResponder, Animated, Image, TouchableOpacity } from "react-native";
import * as Haptics from 'expo-haptics';
import FadeScaleImage from "./FadeScaleImage"
import CardFlip from 'react-native-card-flip';

export default class DraggableCardOnField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pan: new Animated.ValueXY(),
            overReturnToHand: false
        };
        this.panResponder = PanResponder.create({    //Step 2
            // onStartShouldSetPanResponder: () => this.props.user ? (this.props.user === this.props.item.user) : true,
            onStartShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: (evt, gestureState) => {
                this.props.raiseSelectedZone(this.props.zoneLocation)
                this.props.toggleHandZone()
            },
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return this.props.user ? (this.props.user === this.props.item.user && (Math.abs(gestureState.dy) > 20 || Math.abs(gestureState.dx) > 20)) : (Math.abs(gestureState.dy) > 20 || Math.abs(gestureState.dx) > 20)
            },
            onPanResponderMove: (evt, gestureState) => {
                // do whatever you need here
                // be sure to return the Animated.event as it returns a function
                const closestSpot = this.closestSpot(gestureState)
                if (closestSpot) {
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

                return Animated.event([null, {
                    dx: this.state.pan.x,
                    dy: this.state.pan.y,
                }])(evt, gestureState)
            },
            onPanResponderRelease: (evt, gestureState) => {
                this.props.toggleHandZone()
                this.props.clearZoneBackgrounds()
                this.props.lowerSelectedZone(this.props.zoneLocation)

                const closestSpot = this.closestSpot(gestureState)
                if (closestSpot) {
                    this.props.manageCardOnField(this.props.zoneLocation, closestSpot.location, this.props.item)
                    // this.props.presentCardOptions(closestSpot.location, this.props.item)
                }

                Animated.spring(            //Step 1
                    this.state.pan,         //Step 2
                    { toValue: { x: 0, y: 0 } }     //Step 3
                ).start();
            },
            onPanResponderTerminate: (evt, gestureState) => {
                this.props.toggleHandZone()
                this.props.clearZoneBackgrounds()

                Animated.spring(            //Step 1
                    this.state.pan,         //Step 2
                    { toValue: { x: 0, y: 0 } }     //Step 3
                ).start();
            }
        });
    }
    examineCard = () => {
        Haptics.impactAsync("heavy")
        this.props.examineCard(this.props.item)
    }
    closestSpot = (gesture) => {
        const monsterZones = this.props.coords
        if (monsterZones.length) {
            const closestSpot = monsterZones.sort((zone1, zone2) => Math.hypot(zone1.coords.x - gesture.moveX, zone1.coords.y - gesture.moveY) - Math.hypot(zone2.coords.x - gesture.moveX, zone2.coords.y - gesture.moveY))
            return closestSpot[0]
        }
        return null
    }
    lastTap = null;
    handleDoubleTap = () => {
        if (this.props.user) {
            if (this.props.item.type === "Link Monster") return
        }

        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;
        if (this.lastTap && (now - this.lastTap) < DOUBLE_PRESS_DELAY) {
            Haptics.impactAsync("heavy")
            this.props.flipCardPosition(this.props.zoneLocation)
        } else {
            this.lastTap = now;
        }
    }
    componentDidMount() {
        console.log("in draggableCardOnField...this.props.storedCards", this.props.storedCards)
    }
    render() {
        return (
            <Animated.View
                {...this.panResponder.panHandlers}
                style={[this.state.pan.getLayout(), { flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 10, transform: this.props.user ? (this.props.user === this.props.host ? [{ rotate: '180deg' }] : [{ rotate: "0deg" }]) : [{ rotate: "0deg" }] }]}>
                <TouchableOpacity onLongPress={this.examineCard} onPress={this.handleDoubleTap} style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", transform: this.props.user ? (this.props.item.user && this.props.user === this.props.item.user ? [{ rotate: "0deg" }] : [{ rotate: '180deg' }]) : [{ rotate: '180deg' }] }}>

                    <FadeScaleImage
                        source={this.props.item.set ? require("../../assets/default_card.png") : { uri: this.props.storedCards[this.props.item.id] ? this.props.storedCards[this.props.item.id] : this.props.item.card_images[0].image_url_small }} resizeMode={"contain"}
                        style={[{ transform: (this.props.user && !this.props.item.defensePosition) ? (this.props.user === this.props.host ? [{ rotate: '180deg' }] : [{ rotate: "0deg" }]) : (this.props.item.defensePosition ? [{ rotate: '270deg' }] : [{ rotate: '180deg' }]) }, this.state.overReturnToHand ? { width: 150 * 0.65, height: 300 * 0.65 } : { flex: 1, width: 50, height: 100 }]} />


                </TouchableOpacity>
            </Animated.View>
        );
    }
}