import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground, TouchableOpacity } from 'react-native';
import React, { Component } from "react"


const OpponentBoard = ({ boardsRetrieved, opponentBoard }) => {
    return (
        <React.Fragment>
            <View style={{ flex: 1, flexDirection: "row" }}>
            </View>
            <View style={{ flex: 1, flexDirection: "row" }}>
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }} >
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map(cardIndex => (
                    <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} >

                        {boardsRetrieved == true && opponentBoard.m1[cardIndex].exists && (opponentBoard.m1[cardIndex]['card'].set ? <Image source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null, transform: [{ rotate: '90deg' }] }} /> : <Image source={{ uri: opponentBoard.m1[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />)}


                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }} >
                    {boardsRetrieved == true && opponentBoard.graveyard.length > 0 && <Image source={{ uri: opponentBoard.graveyard[opponentBoard.graveyard.length - 1].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, flexDirection: "row" }}>
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }}>
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map(cardIndex => (
                    <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: 'black', borderRadius: 10, borderWidth: 2 }} >
                        {boardsRetrieved == true && opponentBoard.st[cardIndex].exists && (opponentBoard.st[cardIndex]['card'].set ? <Image source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> : <Image source={{ uri: opponentBoard.st[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />)}
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }} >
                    <ImageBackground source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} >
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: "transparent" }}>
                            <Text style={{ color: "#FFF" }} >40</Text>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        </React.Fragment>

    )
}

export default OpponentBoard