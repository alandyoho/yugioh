import React, { Component } from "react"
import { Dimensions, Image } from 'react-native';
import Carousel from 'react-native-snap-carousel';

const one = require("../assets/1.gif")
// const two = require("../assets/2.gif")
const three = require("../assets/3.gif")
const four = require("../assets/4.gif")
const five = require("../assets/5.gif")
const six = require("../assets/6.gif")
const seven = require("../assets/7.gif")
const eight = require("../assets/8.gif")



export default class PhotoReel extends Component {

    _renderItem({ item, index }) {
        return (
            <Image source={item.source} style={{ flex: 1, width: null, height: null }} />
        );
    }

    render() {
        return (
            // <Carousel
            //     inactiveSlideScale={1}
            //     scrollEnabled={false}
            //     loop={true}
            //     autoplay={true}
            //     containerCustomStyle={{ zIndex: 0, position: "absolute", left: 0, right: 0, bottom: 0, top: 0, backgroundColor: "black" }}
            //     ref={(c) => { this._carousel = c; }}
            //     data={[{ source: one }, { source: three }, { source: four }, { source: five }, { source: six }, { source: seven }, { source: eight }]}
            //     renderItem={this._renderItem}
            //     sliderHeight={Dimensions.get("window").height}
            //     sliderWidth={Dimensions.get("window").width}
            //     itemWidth={Dimensions.get("window").width}
            //     itemHeight={Dimensions.get("window").height}
            // />
            <Image source={require("../assets/yugioh_gif1.gif")} style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height, zIndex: 0, position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }} />
        );
    }
}