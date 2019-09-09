import React, { Component } from 'react';
import { View, Image } from 'react-native';
import CircleSlider from './react-native-circle-slider';

export default class CircleSliderContainer extends Component {
    render() {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: "transparent" }, { ...this.props.styles }}>
                <CircleSlider
                    btnColor={"black"}
                    backgroundColor={"#FFF"}
                    btnRadius={12}
                    sliderWidth={5}
                    sliderRadius={30}
                    startGradient={"#25D366"}
                    endGradient={"red"}
                    meterColor={"black"}
                    onValueChange={this.props.updateLifePoints}
                    component={<Image source={{ uri: this.props.imageUrl }} style={{ width: "80%", height: "80%", borderRadius: 32.5 * 0.80 }} />}
                />
            </View>
        )
    }
}