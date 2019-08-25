import React, { Component } from "react"
import { Dimensions, Image } from 'react-native';
import FadeScaleImage from "./ComplexComponents/FadeScaleImage"

export default class PhotoReel extends Component {
    render() {
        return (
            <FadeScaleImage source={require("../assets/loadingScreen-1.gif")} style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height, zIndex: 0, position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }} />
        );
    }
}