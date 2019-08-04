import { View, Image, Text, ImageBackground } from 'react-native';
import React, { Component } from "react"
import FadeScaleImage from "../FadeScaleImage"

class RoomHostBoard extends Component {
    constructor() {
        super()
        this.state = {
            coords: []
        }
    }
    handleLayoutChange = () => {
        for (let i = 1; i < 7; i++) {
            this[`_${i}`].measure((fx, fy, width, height, px, py) => {
                console.log('Component width is: ' + width)
                console.log('Component height is: ' + height)
                console.log('X offset to page: ' + px)
                console.log('Y offset to page: ' + py)
            })
        }
    }
    render() {
        return (
            <React.Fragment>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    {[1, 2, 3, 4, 5, 6].map(cardIndex => (
                        <View key={cardIndex} style={{ flex: 1, width: 50, height: null, borderWidth: 2, borderColor: "transparent" }} onLayout={(event) => { this.handleLayoutChange(event) }} ref={view => { this[`_${cardIndex}`] = view; }}>
                        </View>
                    ))}
                    <View style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} >
                    </View>
                </View>

                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} >
                    </View>
                    {[1, 2, 3, 4, 5].map(cardIndex => (
                        <View key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }} >
                        </View>
                    ))}
                    <View style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} >
                    </View>
                </View>

                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} >

                    </View>
                    {[1, 2, 3, 4, 5].map(cardIndex => (
                        <View key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }} >
                        </View>
                    ))}


                    <View style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center" }}  >

                    </View>
                </View>
            </React.Fragment>
        )
    }

}

export default RoomHostBoard