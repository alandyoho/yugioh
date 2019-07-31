import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground, TouchableOpacity } from 'react-native';
import React, { Component } from "react"
import { FlatList } from 'react-native-gesture-handler';


const OpponentHand = ({ renderOpponentHand, opponentHand }) => {
    var opponentHandLength = opponentHand && Array(opponentHand.length).fill("")
    //
    return (
        <FlatList
            data={opponentHandLength}
            renderItem={renderOpponentHand}
            keyExtractor={(item, index) => index.toString()}
            horizontal={true}
            scrollEnabled={true}
            style={{
                position: "absolute", top: -80, left: 0, right: 0, zIndex: 5, transform: [{ rotate: '180deg' }]
            }}
        />

    )
}

export default OpponentHand


