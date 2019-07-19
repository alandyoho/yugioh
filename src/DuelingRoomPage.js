import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import { updateSelectedDeck } from "./actions"
import { retrieveCardsFromDeck, retrieveDeckInfo, leaveDuel, alterBoard, doubleAlterBoard } from "../Firebase/FireMethods"
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
            cardOnFieldPressedPopupVisible: false,
            cardInfo: "",
            cardType: { type: "" },
            examinePopupVisible: false,
            graveyardPopupVisible: false,
            cardInGraveyardPressed: false
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
    fadeInHand = () => {
        Animated.timing(this.state.handOpacity, { toValue: 1, useNativeDriver: true, }).start();
        this.setState({ handZIndex: 1 })
    }

    toggleExaminePopup = () => {
        this.setState({ examinePopupVisible: !this.state.examinePopupVisible })
    }


    listenForGameChanges = (obj) => {
        if (obj.hostedBy == "") {
            console.log("hostedBy", obj.hostedBy)
            console.log("hosting username", this.props.user.username)
            obj.hostedBy = this.props.user.username
        } else {
            console.log("hostedBy", obj.hostedBy)
        }
        this.setState({ hosting: obj.hosting, hostedBy: obj.hostedBy })
        firestore.collection("rooms").doc(obj.hostedBy)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const { guestBoard, hostBoard, opponent } = doc.data()

                    this.setState({ guestBoard, hostBoard, opponent })
                    // console.log("guest board", guestBoard)
                    this.setState({ boardsRetrieved: true })

                    if (this.state.opponent != "" && this.state.waitingForOpponentPopupVisible == true) {
                        this.setState({ waitingForOpponentPopupVisible: false })
                        this.initialDraw()
                    }
                }
            })
    }
    presentCardOnBoardOptions = (cardInfo) => {
        const cardType = this.state[cardInfo[0]][cardInfo[1]][cardInfo[2]]["card"]


        this.setState({ cardOnFieldPressedPopupVisible: true, cardInfo, cardType })
    }
    toggleCardInGraveyardOptions = (cardType) => {
        if (!cardType) {
            this.setState({ cardInGraveyardPressed: !this.state.cardInGraveyardPressed })
        } else {
            this.setState({ cardInGraveyardPressed: !this.state.cardInGraveyardPressed, cardType })
        }
    }

    toggleGraveyardPopup = () => {
        this.setState({ graveyardPopupVisible: !this.state.graveyardPopupVisible })
    }



    manageCardOnBoard = async (requestType) => {
        const { cardInfo } = this.state
        const board = cardInfo[0]
        const cardZone = cardInfo[1]
        const cardZoneIndex = cardInfo[2]

        let boardCopy = { ...this.state[board] }
        let cardDetails = boardCopy[cardZone][cardZoneIndex]["card"]
        // console.log("card being pressed on", cardDetails)
        if (requestType == "Return-To-Hand") {
            boardCopy[cardZone][cardZoneIndex] = { card: { exists: false, defensePosition: false } }
            cardDetails.defensePosition = false
            const modifiedHand = [...this.state.hand, cardDetails]
            this.setState({ [board]: boardCopy, hand: modifiedHand, cardInfo: "" })
            await alterBoard({ location: cardInfo, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
        } else if (requestType == "Change-Position") {
            const curPosition = !boardCopy[cardZone][cardZoneIndex]["card"].defensePosition
            boardCopy[cardZone][cardZoneIndex] = { card: { ...cardDetails, exists: true, defensePosition: curPosition } }
            this.setState({ [board]: boardCopy, cardInfo: "" })
            await alterBoard({ location: cardInfo, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
        } else if (requestType == "Send-To-Graveyard") {
            boardCopy["graveyard"] = [...boardCopy["graveyard"], cardDetails]
            boardCopy[cardZone][cardZoneIndex] = { card: { exists: false, defensePosition: false } }
            this.setState({ [board]: boardCopy, cardInfo: "" })
            // await alterBoard({ location: cardInfo, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
            await doubleAlterBoard({ location: cardInfo, zoneOne: boardCopy["graveyard"], zoneTwo: boardCopy[cardZone], hostUsername: this.state.hostedBy })
        } else if (requestType == "Flip-Summon" || requestType == "Activate-Facedown") {
            boardCopy[cardZone][cardZoneIndex] = { card: { ...cardDetails, exists: true, set: false } }
            this.setState({ [board]: boardCopy, cardInfo: "" })
            await alterBoard({ location: cardInfo, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
        } else if (requestType == "Examine") {
            console.log("examine triggered")
            this.toggleExaminePopup()
        }
        this.setState({ cardOnFieldPressedPopupVisible: false })
        //request types
        //send to graveyard
        //change position
        //return to hand
        //change ownership
    }
    manageCardInGraveyard = async (requestType) => {

        // console.log("request type", requestType)
        console.log("corresponding card", this.state.cardType)

        this.toggleCardInGraveyardOptions()
        const cardDetails = this.state.cardType
        const board = this.state.hosting ? "hostBoard" : "guestBoard"


        let boardCopy = { ...this.state[board] }
        let graveyard = boardCopy["graveyard"]

        if (requestType == "Return-To-Hand") {
            this.toggleGraveyardPopup()
            boardCopy["graveyard"] = graveyard.splice(graveyard.findIndex(e => e.id === cardDetails.id), 1);
            const modifiedHand = [...this.state.hand, cardDetails]
            this.setState({ [board]: boardCopy, hand: modifiedHand, cardInfo: "" })
            await alterBoard({ location: [board, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })
        } else if (requestType == "Special-GY") {
            this.toggleGraveyardPopup()
            boardCopy["graveyard"] = graveyard.splice(graveyard.findIndex(e => e.id === cardDetails.id), 1);
            await alterBoard({ location: [board, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })
            this.setState({ requestType: "Special-GY", cardOptionsPresented: cardDetails })

        } else if (requestType == "Examine") {
            this.setState({ cardType: cardDetails })
            this.setState({ examinePopupVisible: true })
        }
        //add card info to hand in state    
        //remove from graveyard array in state
        //else if special summon
        //

        // else if (requestType == "Examine") {
        //     console.log("examine triggered")
        //     this.toggleExaminePopup()
        // } else if (requestType == "Special") {
        //     console.log("examine triggered")
        //     this.toggleExaminePopup()
        // }
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

    //hand to field (1)
    presentCardOptions = (card) => {
        this.setState({ cardOptionsPresented: card, cardPopupVisible: true })
    }
    //hand to field (1) cancel
    dismissCardPopup = () => {
        this.setState({ cardPopupVisible: false, cardOnFieldPressedPopupVisible: false });
    }
    //hand to field (2)
    fadeOutHand = (type) => {
        if (type == "Examine") {
            const cardDetails = { ...this.state.cardOptionsPresented }
            this.setState({ cardType: cardDetails })
            this.setState({ examinePopupVisible: true, cardPopupVisible: false })
        } else {
            Animated.timing(this.state.handOpacity, { toValue: 0, useNativeDriver: true, }).start();
            this.setState({ handZIndex: -1, cardPopupVisible: false, requestType: type })
        }
    }
    //hand to field (3)
    addCardToBoard = async (location, requestType) => {
        console.log("request Typ", this.state.requestType)



        this.setState({ cardPopupVisible: false, cardOnFieldPressedPopupVisible: false });
        if (!requestType) {
            requestType = this.state.requestType
        }
        const { cardOptionsPresented } = this.state
        if (cardOptionsPresented == false || requestType == "") {
            return this.fadeInHand()
        }
        let cardDetails;
        if (requestType === "Set-ST" || requestType === "Set-Monster") {
            cardDetails = { ...cardOptionsPresented, set: true }
        } else if (requestType === "Normal" || requestType === "Special" || requestType === "Activate") {
            cardDetails = { ...cardOptionsPresented }
        } else if (requestType === "Send-To-Graveyard") {
            cardDetails = { ...cardOptionsPresented }
        } else if (requestType === "Examine") {
            cardDetails = { ...cardOptionsPresented }
        } else if (requestType === "Special-GY") {
            cardDetails = { ...cardOptionsPresented }
        }
        const board = location[0]
        const cardZone = location[1]
        const cardZoneIndex = location[2]

        if ((cardZone == "st" && cardDetails.type.includes("Monster")) || (cardZone == "m1" && cardDetails.type.includes("Spell"))) {
            return this.fadeInHand()
        }
        let boardCopy = { ...this.state[board] }
        if (cardZone == "graveyard") {
            boardCopy[cardZone].push(cardDetails)
        } else {
            boardCopy[cardZone][cardZoneIndex] = { card: { ...cardDetails, exists: true, defensePosition: false } }
        }
        if (requestType !== "Special-GY") {
            const filteredHand = [...this.state.hand]
            filteredHand.splice(filteredHand.findIndex(e => e.id === cardDetails.id), 1);
            this.setState({ [board]: boardCopy, hand: filteredHand, cardOptionsPresented: false })
        } else {
            this.setState({ [board]: boardCopy, cardOptionsPresented: false })
        }

        this.fadeInHand()
        await alterBoard({ location, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
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
    renderGraveyardCards = ({ item }) => {
        return (
            <TouchableOpacity style={{ width: 200, height: 400, flexDirection: "row", justifyContent: "center", alignItems: "center" }} onPress={() => this.presentCardOptions(item)}>
                {item["card_images"] && <Image source={{ uri: item["card_images"][0]["image_url"] }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} style={{
                    width: 200, height: 400
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
        const { backgroundImageUrl, boardsRetrieved, cards, hand, handOpacity, handZIndex, waitingForOpponentPopupVisible, cardPopupVisible, cardOptionsPresented, examinePopupVisible, graveyardPopupVisible, cardInGraveyardPressed } = this.state
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
                    <RoomHostBoard boardsRetrieved={boardsRetrieved} properBoard={this.state[properBoard]} cards={cards} drawCard={this.drawCard} addCardToBoard={this.addCardToBoard} board={properBoard} presentCardOnBoardOptions={this.presentCardOnBoardOptions} toggleGraveyardPopup={this.toggleGraveyardPopup} />
                </View>
                <View style={{ flex: 4 / 20 }}>
                </View>
                <RoomHostHand hand={hand} renderItem={this.renderItem} handOpacity={handOpacity} handZIndex={handZIndex} />
                <DuelingRoomDialogs waitingForOpponentPopupVisible={waitingForOpponentPopupVisible} cardPopupVisible={cardPopupVisible} dismissCardPopup={this.dismissCardPopup} cardOptionsPresented={cardOptionsPresented} fadeOutHand={this.fadeOutHand} board={properBoard} addCardToBoard={this.addCardToBoard} cardOnFieldPressedPopupVisible={this.state.cardOnFieldPressedPopupVisible} manageCardOnBoard={this.manageCardOnBoard} cardType={this.state.cardType} examinePopupVisible={examinePopupVisible} toggleExaminePopup={this.toggleExaminePopup} graveyardPopupVisible={graveyardPopupVisible} toggleGraveyardPopup={this.toggleGraveyardPopup} graveyard={this.state[properBoard]['graveyard']} cardInGraveyardPressed={cardInGraveyardPressed} toggleCardInGraveyardOptions={this.toggleCardInGraveyardOptions} manageCardInGraveyard={this.manageCardInGraveyard} />
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