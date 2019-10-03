import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import React, { PureComponent } from "react"
import { FadeScaleImage } from "./ComplexComponents"
import * as Haptics from 'expo-haptics';

class DraggableOpponentBoard extends PureComponent {
    examineCard = (item) => {
        if (item && item["card_images"]) {
            Haptics.impactAsync("heavy")
            if (!item.set) {
                this.props.examineCard(item)
            }
        }
    }
    highlightCard = (location) => {
        this.props.highlightCard(location)
    }
    render() {
        const { boardsRetrieved, thatBanishedZone, thatBoard, thatGraveyard, examineCard, requestAccessToOpponentGraveyard } = this.props
        return (
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: "center", alignItems: "flex-end" }}>
                {[1, 2, 3, 4, 5, 6].map(cardIndex => (
                    <View key={cardIndex} style={{ ...styles.viewStyles, borderColor: "transparent" }}>
                    </View>
                ))}
                <TouchableOpacity style={{ ...styles.viewStyles, borderWidth: 0 }} >
                    {boardsRetrieved === true && thatBanishedZone.length > 0 && <FadeScaleImage source={{ uri: thatBanishedZone[thatBanishedZone.length - 1].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, borderWidth: 1 }} >
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...styles.viewStyles, borderColor: boardsRetrieved === true && thatBoard.st[6].highlighted ? "red" : "black" }} onLongPress={() => this.examineCard(thatBoard.st[6])} onPress={() => this.highlightCard(["thatBoard", "st", 6])}>
                    {boardsRetrieved === true && thatBoard.st[6].exists && <FadeScaleImage item={thatBoard.st[6]} source={{ uri: thatBoard.st[6].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map(cardIndex => (
                    <TouchableOpacity key={cardIndex} style={{ ...styles.viewStyles, borderColor: boardsRetrieved === true && thatBoard.m1[cardIndex].highlighted ? "red" : "black" }} onLongPress={() => this.examineCard(thatBoard.m1[cardIndex])} onPress={() => this.highlightCard(["thatBoard", "m1", cardIndex])}>
                        {boardsRetrieved === true && thatBoard.m1[cardIndex].exists && <FadeScaleImage item={thatBoard.m1[cardIndex]} source={{ uri: thatBoard.m1[cardIndex].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                    </TouchableOpacity>))}
                <TouchableOpacity style={{ ...styles.viewStyles, borderWidth: 0 }} onLongPress={requestAccessToOpponentGraveyard} >
                    {boardsRetrieved === true && thatGraveyard.length > 0 && <FadeScaleImage source={{ uri: thatGraveyard[thatGraveyard.length - 1].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, borderWidth: 1 }} >
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ ...styles.viewStyles, borderWidth: 0 }}  >
                    <FadeScaleImage source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, borderWidth: 1 }} >
                    </View>
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map(cardIndex => (<TouchableOpacity key={cardIndex} style={{ ...styles.viewStyles, borderColor: boardsRetrieved === true && thatBoard.st[cardIndex].highlighted ? "red" : "black" }} onLongPress={() => this.examineCard(thatBoard.st[cardIndex])} onPress={() => this.highlightCard(["thatBoard", "st", cardIndex])}>
                    {boardsRetrieved && thatBoard.st[cardIndex].exists && <FadeScaleImage item={thatBoard.st[cardIndex]} source={{ uri: thatBoard.st[cardIndex].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                </TouchableOpacity>))}
                <TouchableOpacity style={{ ...styles.viewStyles, borderWidth: 0 }} >
                    <FadeScaleImage source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, borderWidth: 1 }} >
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}
export default DraggableOpponentBoard

const styles = StyleSheet.create({
    viewStyles: {
        height: Dimensions.get("window").height / 12, //10.5
        width: Dimensions.get("window").width / 7.1,
        borderColor: "black",
        borderRadius: 10,
        borderWidth: 1
    }
})