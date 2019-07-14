import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground, TouchableOpacity } from 'react-native';
import React, { Component } from "react"
import { FlatList } from 'react-native-gesture-handler';


const OpponentHand = ({ renderOpponentHand }) => {
    return (

        <FlatList
            data={[1, 2, 3, 4, 5, 6]}
            renderItem={renderOpponentHand}
            keyExtractor={(item, index) => index.toString()}
            horizontal={true}
            scrollEnabled={false}
            style={{
                position: "absolute", top: -80, left: 0, right: 0, zIndex: 5, transform: [{ rotate: '180deg' }]
            }}
        />

    )
}

export default OpponentHand


