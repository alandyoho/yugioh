import React, { Component } from 'react';
import { View, Image, Dimensions, Text, TextInput, } from 'react-native';
import CircleSlider from './react-native-circle-slider';
import FadeImage from "./ComplexComponents/FadeImage"
import * as Haptics from 'expo-haptics';

export default class CircleSliderContainer extends Component {
    constructor() {
        super()
        this.state = {
            btnRadius: 3,
            sliderWidth: 5,
            sliderRadius: 30,
            textInputWidth: 50,
            textInputHeight: 20,
            value: null
        }
    }
    toggleLifePoints = () => {
        if (this.props.user) return
        const { width } = Dimensions.get("window")
        this.props.toggleLifePoints(this.state.value)
        this.setState((state) => {
            let updatedState = {}
            state.btnRadius === 3 ? updatedState.btnRadius = width / 2 / 10 : updatedState.btnRadius = 3
            state.sliderWidth === 5 ? updatedState.sliderWidth = width / 2 / 6 : updatedState.sliderWidth = 5
            state.sliderRadius === 30 ? updatedState.sliderRadius = width / 2 : updatedState.sliderRadius = 30
            state.textInputWidth === 50 ? updatedState.textInputWidth = 200 : updatedState.textInputWidth = 50
            state.textInputHeight === 20 ? updatedState.textInputHeight = 80 : updatedState.textInputHeight = 20

            updatedState.value = state.value
            return updatedState
        })

    }
    onValueChange = (value) => {
        if (value !== 0) {
            const updatedValue = Math.ceil(((value / 360) * 8000) / 10) * 10
            if (updatedValue % 20 === 0) {
                Haptics.impactAsync("light")
            }
            this.setState(() => {
                return { value: updatedValue }
            })
        }
    }
    render() {

        const { btnRadius, sliderWidth, sliderRadius, textInputWidth, textInputHeight, value } = this.state
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: "red", width: sliderRadius * 2 + sliderWidth, height: sliderRadius * 2 + sliderWidth }, { ...this.props.styles }}>
                <CircleSlider
                    user={this.props.user}
                    btnColor={"black"}
                    value={this.props.value || 359}
                    backgroundColor={"transparent"}
                    btnRadius={btnRadius}
                    sliderWidth={sliderWidth}
                    sliderRadius={sliderRadius}
                    startGradient={"#25D366"}
                    endGradient={"red"}
                    meterColor={"black"}
                    expandLifePoints={this.toggleLifePoints}
                    onValueChange={this.onValueChange}
                    // component={<Image source={{ uri: this.props.imageUrl }} style={{ width: "80%", height: "80%", borderRadius: 32.5 * 0.80 }} />}
                    component={<View style={{ width: "80%", height: "80%", justifyContent: "center", alignItems: "center" }}>
                        <View style={{ borderRadius: textInputWidth / 2, width: textInputWidth, height: textInputHeight, position: "absolute", zIndex: 1, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" }}>
                            <TextInput style={{ fontSize: textInputHeight * 0.80 }} keyboardType={"numeric"} value={String((this.props.lifePoints || value) || 8000)} />
                        </View>
                        {this.state.btnRadius === 3 && <FadeImage source={{ uri: this.props.imageUrl }} style={{ width: "100%", height: "100%", borderRadius: (sliderRadius * 2 + sliderWidth) / 2 * 0.80 }} />}
                    </View>}
                />
            </View>
        )
    }
}