import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import { updateSelectedDeck } from "./actions"
import { retrieveCardsFromDeck, retrieveDeckInfo, leaveDuel, addCardToBoard } from "../Firebase/FireMethods"
import { firestore } from "../Firebase/Fire"
import { TouchableOpacity } from 'react-native-gesture-handler';
import GameLogic from "./GameLogic"
import CARDS from "./cards"
import DraggableCards from "./DraggableCards";
import { OpponentBoard, OpponentHand, RoomHostBoard, RoomHostHand, DuelingRoomDialogs } from "./DuelingRoomPageComponents"

class DuelingRoomPage extends Component {
    constructor() {
        super()
        this.state = {
            selectedDeck: "",
            cards: [],
            hand: [],
            guestBoard: {},
            hostBoard: {},
            hostedBy: "",
            waitingForOpponentPopupVisible: false,
            opponent: "",
            hosting: null,
            cardPopupVisible: false,
            cardOptionsPresented: false,
            handZIndex: 10,
            handOpacity: new Animated.Value(1),
            boardsRetrieved: false,
            backgroundImageUrl: false,
            requestType: "",
        }
    }
    async componentDidMount() {
        const backgroundImages = [require("../assets/background-0.png"), require("../assets/background-1.png"), require("../assets/background-2.png"), require("../assets/background-3.png"), require("../assets/background-4.png"), require("../assets/background-5.png"), require("../assets/background-6.png")]
        const randomNum = this.getRandomInt()
        this.setState({ backgroundImageUrl: backgroundImages[randomNum] })


        this.setState({ waitingForOpponentPopupVisible: true })
        const { hostedBy, hosting } = await retrieveDeckInfo(this.props.user.username)
        this.listenForGameChanges({ hostedBy: hostedBy, hosting: hosting })
    }
    fadeOutHand = (type) => {
        Animated.timing(this.state.handOpacity, { toValue: 0, useNativeDriver: true, }).start();
        this.setState({ handZIndex: -1, cardPopupVisible: false, requestType: type })
    }
    fadeInHand = () => {
        Animated.timing(this.state.handOpacity, { toValue: 1, useNativeDriver: true, }).start();
        this.setState({ handZIndex: 1 })
    }
    dismissCardPopup = (type) => {
        this.setState({ requestType: type, cardPopupVisible: false, cardOptionsPresented: false });
        return true
    }


    listenForGameChanges = (obj) => {
        if (obj.hostedBy == "") {
            obj.hostedBy = this.props.user.username
        }
        this.setState({ hosting: obj.hosting, hostedBy: obj.hostedBy })
        firestore.collection("rooms").doc(obj.hostedBy)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const { guestBoard, hostBoard, opponent } = doc.data()

                    this.setState({ guestBoard, hostBoard, opponent })
                    this.setState({ boardsRetrieved: true })

                    if (this.state.opponent != "" && this.state.waitingForOpponentPopupVisible == true) {
                        this.setState({ waitingForOpponentPopupVisible: false })
                        this.initialDraw()
                    }
                }
            })
    }

    addCardToBoard = async (location) => {

        const { cardOptionsPresented, requestType } = this.state
        if (cardOptionsPresented == false) {
            return
        }
        let cardDetails;
        if (requestType === "Set-ST") {
            cardDetails = { ...cardOptionsPresented, set: true }
        } else if (requestType === "Normal" || requestType === "Special") {
            cardDetails = { ...cardOptionsPresented }
        } else if (requestType === "Set-Monster") {
            cardDetails = { ...cardOptionsPresented }
        } else if (requestType === "Send-To-Graveyard") {
            cardDetails = { ...cardOptionsPresented }
        } else {
            cardDetails = { ...cardOptionsPresented }
        }
        const board = location[0]
        const cardZone = location[1]
        const cardZoneIndex = location[2]

        if ((cardZone == "st" && cardDetails.type.includes("Monster")) || (cardZone == "m1" && cardDetails.type.includes("Spell"))) {
            this.fadeInHand()
            return
        }
        let boardCopy = { ...this.state[board] }
        if (cardZone == "graveyard") {
            boardCopy[cardZone].push(cardDetails)
        } else {
            boardCopy[cardZone][cardZoneIndex] = { card: cardDetails, exists: true }
        }
        const filteredHand = [...this.state.hand]
        filteredHand.splice(filteredHand.findIndex(e => e.id === cardDetails.id), 1);

        this.setState({ [board]: boardCopy, hand: filteredHand, cardOptionsPresented: false })
        this.fadeInHand()
        await addCardToBoard({ location, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
    }

    initialDraw = async () => {
        const { cards } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        //set the state with shuffled retrieved cards and selected deck
        this.setState({ selectedDeck: this.props.selectedDeck, cards: GameLogic.shared.shuffleDeck(cards) })

        //set the state with five cards 
        const { shallowCards, drawnCards } = GameLogic.shared.initialDraw(this.state.cards)
        this.setState({ hand: drawnCards, cards: shallowCards })
    }
    drawCard = () => {
        if (this.state.cards.length) {
            const { drewCard, shallowCards } = GameLogic.shared.drawCard(this.state.cards)
            this.setState({ hand: [...this.state.hand, drewCard], cards: shallowCards })
        }
    }
    leaveDuel = () => {
        leaveDuel(this.props.user.username)
        this.props.navigation.navigate("HomePage")
    }
    presentCardOptions = (card) => {
        this.setState({ cardOptionsPresented: card, cardPopupVisible: true })
    }
    summonMonster = () => {
        this.fadeInHand()
    }

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={{ width: 100, height: 200, flexDirection: "row", justifyContent: "center", alignItems: "flex-end" }} onPress={() => this.presentCardOptions(item)}>
                {item["card_images"] && <Image source={{ uri: item["card_images"][0]["image_url"] }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} style={{
                    width: 100, height: 200
                }} />}
            </TouchableOpacity>
            // <DraggableCards item={item} />
        )
    }
    renderOpponentHand = () => {
        return (
            <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{
                width: 100, height: 200
            }} />
        )
    }
    getRandomInt = () => {
        return Math.floor(Math.random() * Math.floor(7));
    }
    render() {
        const { backgroundImageUrl, boardsRetrieved, cards, hand, handOpacity, handZIndex, waitingForOpponentPopupVisible, cardPopupVisible, cardOptionsPresented } = this.state
        const properBoard = this.state.hosting ? "hostBoard" : "guestBoard"
        const opponentBoard = this.state.hosting ? "guestBoard" : "hostBoard"
        return (
            <View style={styles.container}>
                <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0, zIndex: -10 }}>
                    {backgroundImageUrl && <Image source={backgroundImageUrl} style={{ flex: 1, width: null, height: null }} />}
                </View>
                <OpponentHand renderOpponentHand={this.renderOpponentHand} />
                <View style={{ flex: 2 / 20 }}>
                </View>
                <View style={{ flex: 6 / 20, flexDirection: "column", alignItems: "center", justifyContent: "flex-start", transform: [{ rotate: '180deg' }] }}>
                    <OpponentBoard boardsRetrieved={boardsRetrieved} opponentBoard={this.state[opponentBoard]} />
                </View>
                <View style={{ flex: 2 / 20, justifyContent: "center", alignItems: "center" }}>
                    <Button
                        title="Leave Duel"
                        titleStyle={{
                            color: 'white',
                            fontWeight: '800',
                            fontSize: 18,
                            zIndex: 100
                        }}
                        buttonStyle={{
                            backgroundColor: 'rgb(130, 69, 91)',
                            borderRadius: 10,
                            width: 310,
                            height: 50,
                        }}
                        loading={false}
                        onPress={this.leaveDuel}
                    />
                </View>
                <View style={{ flex: 6 / 20, flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
                    <RoomHostBoard boardsRetrieved={boardsRetrieved} properBoard={this.state[properBoard]} cards={cards} drawCard={this.drawCard} addCardToBoard={this.addCardToBoard} board={properBoard} />
                </View>
                <View style={{ flex: 4 / 20 }}>
                </View>
                <RoomHostHand hand={hand} renderItem={this.renderItem} handOpacity={handOpacity} handZIndex={handZIndex} />
                <DuelingRoomDialogs waitingForOpponentPopupVisible={waitingForOpponentPopupVisible} cardPopupVisible={cardPopupVisible} dismissCardPopup={this.dismissCardPopup} cardOptionsPresented={cardOptionsPresented} fadeOutHand={this.fadeOutHand} board={properBoard} addCardToBoard={this.addCardToBoard} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    panelStyles: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: 'center',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20
    },
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        flexDirection: "column",
        justifyContent: "center",
    },
});

const mapStateToProps = (state) => {
    const { user, cards, selectedDeck } = state
    return { user, cards, selectedDeck }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        createUser,
        updateSelectedDeck
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DuelingRoomPage);