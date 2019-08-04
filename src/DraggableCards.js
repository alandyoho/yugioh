import React, { Component } from "react";
import { StyleSheet, View, Text, PanResponder, Animated, Image } from "react-native";

export default class DraggableCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDraggable: true,
            dropAreaValues: null,
            pan: new Animated.ValueXY(),
            opacity: new Animated.Value(1)
        }
    }

    componentWillMount() {
        this._val = { x: 0, y: 0 }
        this.state.pan.addListener((value) => {
            this._val = value
            //
        });

        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (e, gesture) => true,
            onPanResponderGrant: (e, gesture) => {

                this.state.pan.setOffset({
                    x: this._val.x,
                    y: this._val.y
                })
                this.state.pan.setValue({ x: 0, y: 0 })
            },
            onPanResponderMove: Animated.event([
                null, { dx: this.state.pan.x, dy: this.state.pan.y }
            ]),
            onPanResponderRelease: (e, gesture) => {

                Animated.spring(this.state.pan, {
                    toValue: { x: 0, y: 0 },
                    friction: 5
                }).start();
            }
        });
    }
    closestSpot = (location) => {
        const monsterZones = [{
            "x": 30.66667175292969,
            "y": -132,
        }, {
            "x": -12,
            "y": -132,
        }, {
            "x": -65,
            "y": -132,
        },


        ]
    }

    isDropArea(gesture) {
        return gesture.moveY < 200;
    }

    render() {
        return (
            <React.Fragment>
                {this.renderDraggable()}
            </React.Fragment>
        );
    }

    renderDraggable() {
        const panStyle = {
            transform: this.state.pan.getTranslateTransform()
        }
        if (this.state.showDraggable) {
            return (
                <Animated.View
                    {...this.panResponder.panHandlers}
                    style={[panStyle, { opacity: this.state.opacity, backgroundColor: "transparent" }]}
                >
                    <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{
                        width: 100, height: 200
                    }} />
                </Animated.View>
            );
        }
    }
}



let CIRCLE_RADIUS = 30;
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1
    },
    ballContainer: {
        height: 200
    },
    row: {
        flexDirection: "row"
    },
    dropZone: {
        height: 200,
        backgroundColor: "#00334d"
    },
    text: {
        marginTop: 25,
        marginLeft: 5,
        marginRight: 5,
        textAlign: "center",
        color: "#fff",
        fontSize: 25,
        fontWeight: "bold"
    }
});