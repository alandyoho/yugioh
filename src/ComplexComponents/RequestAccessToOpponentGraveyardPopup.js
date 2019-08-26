import React, { Component } from "react";
import { StyleSheet, PanResponder, Animated, Image, TouchableOpacity, Dimensions, View, Text } from "react-native";
import * as Haptics from 'expo-haptics';
import FadeScaleImage from "./FadeScaleImage"
import { Button } from 'react-native-elements';

export default class RequestAccessToOpponentGraveyard extends Component {
    render() {
        const opp = this.props.user === this.props.host ? this.props.opponent : this.props.host
        return (<View style={{ width: "100%", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "rgb(255, 255, 255)", borderRadius: 15 }}>
            <Text>{opp} would like to see your graveyard.</Text>
            <View style={{
                flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", width: "100%"
            }}>
                <Button
                    title="Approve"
                    titleStyle={{
                        color: 'white',
                        fontWeight: '800',
                        fontSize: 18,
                    }}
                    buttonStyle={{
                        backgroundColor: 'rgb(130, 69, 91)',
                        marginTop: 10,
                        borderRadius: 10,
                        height: 50,
                        width: 100
                    }}
                    onPress={this.props.approveAccessToGraveyard}
                />
                <Button
                    title="Deny"
                    titleStyle={{
                        color: 'white',
                        fontWeight: '800',
                        fontSize: 18,
                    }}
                    buttonStyle={{
                        backgroundColor: 'rgb(130, 69, 91)',
                        marginTop: 10,
                        borderRadius: 10,
                        height: 50,
                        width: 100

                    }}
                    onPress={this.props.dismissRequestAccessToGraveyard}
                />
            </View>
        </View>)
    }
}