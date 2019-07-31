import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground, TouchableOpacity } from 'react-native';
import React, { Component } from "react"
import CustomImage from "../ImageLoader"


const OpponentBoard = ({ boardsRetrieved, opponentBoard, toggleOpponentGraveyardPopup, examineOpponentCard }) => {
    // //
    return (
        <React.Fragment>
            <View style={{ flex: 1, flexDirection: "row" }}>
                {[1, 2, 3, 4, 5, 6].map(cardIndex => (
                    <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderWidth: 2, borderColor: "transparent" }} >
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: "rgb(130, 69, 91)", borderRadius: 10, borderWidth: 2 }}>
                    {boardsRetrieved == true && opponentBoard.banishedZone.length > 0 && <CustomImage source={{ uri: opponentBoard.banishedZone[opponentBoard.banishedZone.length - 1].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, flexDirection: "row" }}>
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }} >
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map(cardIndex => (
                    <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} onPress={(boardsRetrieved == true && opponentBoard.m1[cardIndex]['card'].exists) ? () => examineOpponentCard(opponentBoard.m1[cardIndex]['card']) : () => console.log("no card in slot")}>
                        {boardsRetrieved == true && opponentBoard.m1[cardIndex]['card'].exists && (opponentBoard.m1[cardIndex]['card'].set ? <CustomImage source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null, transform: [{ rotate: '90deg' }] }} /> : (opponentBoard.m1[cardIndex]['card'].defensePosition ? <CustomImage source={{ uri: opponentBoard.m1[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null, transform: [{ rotate: '90deg' }] }} /> : <CustomImage source={{ uri: opponentBoard.m1[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />))}
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }} onPress={() => toggleOpponentGraveyardPopup("request")}>
                    {boardsRetrieved == true && opponentBoard.graveyard.length > 0 && <CustomImage source={{ uri: opponentBoard.graveyard[opponentBoard.graveyard.length - 1].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, flexDirection: "row" }}>
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }}>
                    <ImageBackground source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} >
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: "transparent" }}>
                            <Text style={{ color: "#FFF" }} >Extra Deck</Text>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map(cardIndex => (
                    <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: 'black', borderRadius: 10, borderWidth: 2 }} onPress={(boardsRetrieved == true && opponentBoard.st[cardIndex]['card'].exists) ? () => examineOpponentCard(opponentBoard.st[cardIndex]['card']) : () => console.log("no card in slot")}>
                        {boardsRetrieved == true && opponentBoard.st[cardIndex]["card"].exists && (opponentBoard.st[cardIndex]['card'].set ? <CustomImage source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> : <CustomImage source={{ uri: opponentBoard.st[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />)}
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