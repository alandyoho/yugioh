import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground, TouchableOpacity } from 'react-native';
import React, { Component } from "react"
import { FlatList } from 'react-native-gesture-handler';


const RoomHostHand = ({ renderItem, hand, handOpacity, handZIndex }) => {
    return (

        <Animated.View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, opacity: handOpacity, zIndex: handZIndex }}>
            <FlatList
                data={hand}
                renderItem={(item) => renderItem(item)}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200 }}
            />
        </Animated.View>


    )
}

export default RoomHostHand



