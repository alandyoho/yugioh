import { View, Image, Text, ImageBackground, TouchableOpacity } from 'react-native';
import React from "react"
import { FadeScaleImage } from "../ComplexComponents"

const RoomHostBoard = ({ boardsRetrieved, properBoard, drawCard, addCardToBoard, board, presentCardOnBoardOptions, toggleGraveyardPopup, toggleExtraDeckPopup, mainDeck, extraDeck, toggleMainDeckOptions, toggleBanishedZonePopup }) => {
    return (
        <React.Fragment>
            <View style={{ flex: 1, flexDirection: "row" }}>
                {[1, 2, 3, 4, 5, 6].map(cardIndex => (
                    <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderWidth: 2, borderColor: "transparent" }} >
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} onPress={toggleBanishedZonePopup}>
                    {boardsRetrieved == true && properBoard.banishedZone.length > 0 && <FadeScaleImage source={{ uri: properBoard.banishedZone[properBoard.banishedZone.length - 1].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, flexDirection: "row" }}>
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} >
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map(cardIndex => (
                    <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }} onPress={boardsRetrieved == true && !properBoard.m1[cardIndex]['card'].exists ? () => addCardToBoard([board, "m1", cardIndex]) : () => presentCardOnBoardOptions([board, "m1", cardIndex])}>
                        {boardsRetrieved == true && properBoard.m1[cardIndex]['card'].exists && (properBoard.m1[cardIndex]['card'].set ? <FadeScaleImage source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null, transform: [{ rotate: '90deg' }] }} /> : (properBoard.m1[cardIndex]['card'].defensePosition ? <FadeScaleImage source={{ uri: properBoard.m1[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null, transform: [{ rotate: '90deg' }] }} /> : <FadeScaleImage source={{ uri: properBoard.m1[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />))}
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} onPress={toggleGraveyardPopup}>
                    {boardsRetrieved == true && properBoard.graveyard.length > 0 && <FadeScaleImage source={{ uri: properBoard.graveyard[properBoard.graveyard.length - 1].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, flexDirection: "row" }}>
                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2 }} onPress={toggleExtraDeckPopup}>
                    {extraDeck && extraDeck.length > 0 && <ImageBackground source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} >
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: "transparent" }}>
                            <Text style={{ color: "#FFF" }} >Extra Deck</Text>
                        </View>
                    </ImageBackground>}
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map(cardIndex => (
                    <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 2 }} onPress={boardsRetrieved == true && !properBoard.st[cardIndex]['card'].exists ? () => addCardToBoard([board, "st", cardIndex]) : () => presentCardOnBoardOptions([board, "st", cardIndex])}>
                        {boardsRetrieved == true && properBoard.st[cardIndex]['card'].exists && (properBoard.st[cardIndex]['card'].set ? <FadeScaleImage source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> : <FadeScaleImage source={{ uri: properBoard.st[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />)}
                    </TouchableOpacity>
                ))}


                <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: "black", borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center" }} onPress={toggleMainDeckOptions} >
                    {mainDeck.length > 0 && <ImageBackground source={require("../../assets/default_card.png")} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} >
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: "transparent" }}>

                            <Text style={{ color: "#FFF" }} >{mainDeck.length}</Text>
                        </View>
                    </ImageBackground>}
                </TouchableOpacity>
            </View>
        </React.Fragment>
    )
}

export default RoomHostBoard