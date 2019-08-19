import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground, TouchableOpacity } from 'react-native';
import React, { Component } from "react"
import { FlatList } from 'react-native-gesture-handler';


const RoomHostHand = ({ renderItem, hand, handOpacity, handZIndex }) => {
    return (

        <Animated.View style={{ position: "absolute", bottom: -30, left: 0, right: 0, height: 170, opacity: handOpacity, zIndex: handZIndex, flexDirection: "row", justifyContent: "center", alignItems: "flex-end" }}>
            <FlatList
                data={hand}
                renderItem={(item) => renderItem(item)}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                style={{ flex: 1, height: 200 }}
            />
        </Animated.View>


    )
}

export default RoomHostHand



