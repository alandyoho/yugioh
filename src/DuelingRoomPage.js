import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground } from 'react-native';
import { FadeScaleImage } from "./ComplexComponents"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import { updateSelectedDeck } from "./actions"
import { retrieveCardsFromDeck, retrieveDeckInfo, leaveDuel, alterBoard, doubleAlterBoard, requestAccessToGraveyard, dismissRequestAccessToGraveyard, approveAccessToGraveyard, updateLifePointsField, alterLinkZone } from "../Firebase/FireMethods"
import { firestore } from "../Firebase/Fire"
import { TouchableOpacity } from 'react-native-gesture-handler';
import { OpponentBoard, OpponentHand, RoomHostBoard, RoomHostHand, DuelingRoomDialogs, GameLogic } from "./DuelingRoomPageComponents"
import SideMenu from "react-native-side-menu"
import CustomSideMenu from "./SideMenu"

class DuelingRoomPage extends Component {
    constructor() {
        super()
        this.state = {
            selectedDeck: "",
            mainDeck: [],
            extraDeck: [],
            guestBoard: {},
            hostBoard: {},
            linkZones: [],
            hostedBy: "",
            host: "",
            waitingForOpponentPopupVisible: false,
            cardInHandPressedPopupVisible: false,
            cardOnFieldPressedPopupVisible: false,
            examinePopupVisible: false,
            graveyardPopupVisible: false,
            banishedZonePopupVisible: false,
            cardInGraveyardPressed: false,
            cardInBanishedZonePressed: false,
            requestingAccessToGraveyardPopupVisible: false,
            calculatorVisible: false,
            mainDeckOptionsVisible: false,
            deckPopupVisible: false,
            extraDeckPopupVisible: false,
            opponent: "",
            hosting: null,
            cardOptionsPresented: false,
            handZIndex: 10,
            handOpacity: new Animated.Value(1),
            boardsRetrieved: false,
            backgroundImageUrl: false,
            requestType: "",
            cardInfo: "",
            cardType: { type: "" },
            requestApproved: false,
            cardInExtraDeckPressed: false,
            hostLifePoints: 8000,
            guestLifePoints: 8000,
            hostLifePointsSelected: false,
            cardInDeckPressed: false,
        }
    }
    async componentDidMount() {
        const backgroundImages = [require("../assets/background-0.png"), require("../assets/background-1.png"), require("../assets/background-2.png"), require("../assets/background-3.png"), require("../assets/background-4.png"), require("../assets/background-5.png"), require("../assets/background-6.png"), require("../assets/background-7.png"), , require("../assets/background-8.png"), require("../assets/background-9.png")]
        const randomNum = this.getRandomInt()
        this.setState({ backgroundImageUrl: backgroundImages[randomNum], waitingForOpponentPopupVisible: true })
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

    alterLifePoints = (type) => {
        this.setState({ hostLifePointsSelected: type == "host" ? true : false, calculatorVisible: true })
    }

    listenForGameChanges = (obj) => {
        if (obj.hostedBy == "") {

            obj.hostedBy = this.props.user.username
        }
        this.setState({ hosting: obj.hosting, hostedBy: obj.hostedBy })
        firestore.collection("rooms").doc(obj.hostedBy)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const { guestBoard, hostBoard, opponent, host, linkZones } = doc.data()
                    this.setState({ guestBoard, hostBoard, opponent, host, boardsRetrieved: true, linkZones: linkZones })

                    if (this.state.opponent != "" && this.state.waitingForOpponentPopupVisible == true) {
                        this.setState({ waitingForOpponentPopupVisible: false })
                        this.initialDraw()
                    }

                    //find opponent's board
                    const board = this.state.hosting ? "hostBoard" : "guestBoard"

                    // const board = obj.hostedBy === this.props.user.username ? "hostBoard" : "guestBoard"
                    //check if opponent is requesting access to Graveyard
                    if (this.state[board].requestingAccessToGraveyard.popupVisible) {
                        //if so, present popup 
                        this.setState({ requestingAccessToGraveyardPopupVisible: true })
                    } else {
                        this.setState({ requestingAccessToGraveyardPopupVisible: false })
                    }

                    if (this.state[board].requestingAccessToGraveyard.approved) {
                        this.toggleOpponentGraveyardPopup("reveal")
                    }
                }
            })
    }
    presentCardOnBoardOptions = (cardInfo) => {
        if (cardInfo[0] == "linkZones") {
            //handle opponent pressing your cards
            if (this.state.linkZones[cardInfo[1]]["card"].user != this.props.user.username) {
                this.examineOpponentCard(this.state.linkZones[cardInfo[1]]["card"])
                return
            }
            this.setState({ cardOnFieldPressedPopupVisible: true, cardType: this.state.linkZones[cardInfo[1]]["card"], cardInfo })
            return
        }
        const cardType = this.state[cardInfo[0]][cardInfo[1]][cardInfo[2]]["card"]
        //handle opponent pressing your cards
        if (cardType.user != this.props.user.username) {
            return
        }
        this.setState({ cardOnFieldPressedPopupVisible: true, cardInfo, cardType })
    }

    toggleCardInGraveyardOptions = (cardType = { type: "" }) => {
        this.setState({ cardInGraveyardPressed: !this.state.cardInGraveyardPressed, cardType })
    }

    toggleCardInExtraDeckOptions = (cardType = { type: "" }) => {
        this.setState({ cardInExtraDeckPressed: !this.state.cardInExtraDeckPressed, cardType })
    }
    toggleCardInDeckOptions = (cardType = { type: "" }) => {
        this.setState({ cardInDeckPressed: !this.state.cardInDeckPressed, cardType })
    }
    toggleCardInBanishedZoneOptions = (cardType = { type: "" }) => {
        this.setState({ cardInBanishedZonePressed: !this.state.cardInBanishedZonePressed, cardType })
    }

    toggleGraveyardPopup = async () => {
        const board1 = this.state.hosting ? "hostBoard" : "guestBoard"
        const board2 = this.state.hosting ? "guestBoard" : "hostBoard"
        const hostUsername = this.state.hostedBy
        const obj = { hostUsername, board1, board2 }
        await dismissRequestAccessToGraveyard(obj)
        this.setState({ requestApproved: false })

        this.setState({ graveyardPopupVisible: !this.state.graveyardPopupVisible })
    }
    toggleBanishedZonePopup = async () => {
        this.setState({ banishedZonePopupVisible: !this.state.banishedZonePopupVisible })
    }

    toggleExtraDeckPopup = () => {
        this.setState({ extraDeckPopupVisible: !this.state.extraDeckPopupVisible })
    }
    toggleDeckPopup = () => {
        this.setState({ deckPopupVisible: !this.state.deckPopupVisible, mainDeckOptionsVisible: false })
    }



    manageCardOnBoard = async (requestType) => {


        const { cardInfo } = this.state

        if (cardInfo[0] === "linkZones") {
            const board = this.state.hosting ? "hostBoard" : "guestBoard"
            let boardCopy = { ...this.state[board] }
            let linkZoneCopy = [...this.state.linkZones]
            let cardDetails = linkZoneCopy[cardInfo[1]]["card"]
            // 
            // if (cardDetails.user != this.props.user.username) {
            //     return
            // }
            if (requestType == "Return-To-Hand") {
                linkZoneCopy[cardInfo[1]] = { card: { exists: false, defensePosition: false, user: "" } }
                if (cardDetails.user != this.props.user.username) {

                    this.setState({ [properZone]: { width: Dimensions.get("window").width / 7, height: 75, borderColor: 'black', borderRadius: 10, borderWidth: 2, transform: [{ rotate: '180deg' }] } })

                }
                const modifiedExtraDeck = [...this.state.extraDeck, cardDetails]
                this.setState({ linkZones: linkZoneCopy, extraDeck: modifiedExtraDeck, cardInfo: "" })
                await alterLinkZone({ location: cardInfo, updates: linkZoneCopy, hostUsername: this.state.hostedBy })
                const properZone = cardInfo[1] === 0 ? "linkZoneOneStyle" : "linkZoneTwoStyle"

            } else if (requestType == "Send-To-Graveyard") {

                const properZone = cardInfo[1] === 0 ? "linkZoneOneStyle" : "linkZoneTwoStyle"

                boardCopy["graveyard"] = [...boardCopy["graveyard"], cardDetails]

                linkZoneCopy[cardInfo[1]] = { card: { exists: false, defensePosition: false, user: "" } }
                if (cardDetails.user != this.props.user.username) {

                    this.setState({ [properZone]: { width: Dimensions.get("window").width / 7, height: 75, borderColor: 'black', borderRadius: 10, borderWidth: 2, transform: [{ rotate: '180deg' }] } })

                }

                //extra deck is stored locally so we're updating in state and setting state
                // const modifiedExtraDeck = [...this.state.extraDeck, cardDetails]
                // this.setState({ linkZones: linkZoneCopy, extraDeck: modifiedExtraDeck, cardInfo: "" })
                this.setState({ linkZones: linkZoneCopy, cardInfo: "", cardOptionsPresented: false })



                //updates graveyard copy with cardDetails
                //update linkZoneCopy to be set to null

                // await alterBoard({ location: cardInfo, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
                await alterBoard({ location: [board, "graveyard"], zone: boardCopy["graveyard"], hostUsername: this.state.hostedBy })
                await alterLinkZone({ location: cardInfo, updates: linkZoneCopy, hostUsername: this.state.hostedBy })
                this.setState({ cardOnFieldPressedPopupVisible: false })


                // await doubleAlterBoard({ location: cardInfo, zoneOne: boardCopy["graveyard"], zoneTwo: boardCopy[cardZone], hostUsername: this.state.hostedBy })
            } else if (requestType == "Examine") {
                this.toggleExaminePopup()

            }

            return this.dismissCardPopup()


        }
        const board = cardInfo[0]
        const cardZone = cardInfo[1]
        const cardZoneIndex = cardInfo[2]

        let boardCopy = { ...this.state[board] }
        let cardDetails = boardCopy[cardZone][cardZoneIndex]["card"]
        // //
        if (requestType == "Return-To-Hand") {
            boardCopy[cardZone][cardZoneIndex] = { card: { exists: false, defensePosition: false } }
            cardDetails.defensePosition = false
            const extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster", "Synchro Tuner Monster"]
            if (extraDeckTypes.includes(cardDetails.type)) {
                const modifiedExtraDeck = [...this.state.extraDeck, cardDetails]
                this.setState({ [board]: boardCopy, extraDeck: modifiedExtraDeck, cardInfo: "" })
                await alterBoard({ location: cardInfo, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
            } else {
                const modifiedHand = [...boardCopy.hand, cardDetails]
                boardCopy.hand = modifiedHand


                this.setState({ [board]: boardCopy, cardInfo: "" })
                await alterBoard({ location: [board, "hand"], hostUsername: this.state.hostedBy, zone: modifiedHand })
                await alterBoard({ location: cardInfo, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
            }
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
            this.toggleExaminePopup()
        }
        this.setState({ cardOnFieldPressedPopupVisible: false })
    }

    manageCardInGraveyard = async (requestType) => {
        this.toggleCardInGraveyardOptions()
        const cardDetails = this.state.cardType
        const board = this.state.hosting ? "hostBoard" : "guestBoard"


        let boardCopy = { ...this.state[board] }
        let graveyard = boardCopy["graveyard"]
        let banishedZone = boardCopy["banishedZone"]

        if (requestType == "Return-To-Hand") {

            const extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster", "Synchro Tuner Monster"]
            if (extraDeckTypes.includes(cardDetails.type)) {
                const modifiedExtraDeck = [...this.state.extraDeck, cardDetails]
                boardCopy["graveyard"] = graveyard.splice(graveyard.findIndex(e => e.id === cardDetails.id), 1);
                this.setState({ [board]: boardCopy, extraDeck: modifiedExtraDeck, cardInfo: "" })
                await alterBoard({ location: [board, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })
            } else {
                boardCopy["graveyard"] = graveyard.splice(graveyard.findIndex(e => e.id === cardDetails.id), 1);


                const modifiedHand = [...boardCopy.hand, cardDetails]
                boardCopy.hand = modifiedHand
                this.setState({ [board]: boardCopy, cardInfo: "" })
                await alterBoard({ location: [board, "hand"], hostUsername: this.state.hostedBy, zone: modifiedHand })
                await alterBoard({ location: [board, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })
            }
            this.toggleGraveyardPopup()

        } else if (requestType == "Special-GY") {
            this.toggleGraveyardPopup()
            this.setState({ requestType: "Special-GY", cardOptionsPresented: cardDetails })

        } else if (requestType == "Examine") {
            this.setState({ cardType: cardDetails })
            this.setState({ examinePopupVisible: true })
        } else if (requestType == "Set-ST-GY") {
            //update state's graveyard to remove card
            this.toggleGraveyardPopup()
            boardCopy["graveyard"] = graveyard.splice(graveyard.findIndex(e => e.id === cardDetails.id), 1);
            //update the card's set property to true
            await alterBoard({ location: [board, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })
            //update the cardOptionsPresented to the card
            this.setState({ requestType: "Set-ST-GY", cardOptionsPresented: cardDetails })
            this.fadeOutHand("Set-ST-GY")

        } else if (requestType == "Activate-GY") {
            //update state's graveyard to remove card
            this.toggleGraveyardPopup()
            boardCopy["graveyard"] = graveyard.splice(graveyard.findIndex(e => e.id === cardDetails.id), 1);
            //update the card's set property to true
            await alterBoard({ location: [board, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })
            //update the cardOptionsPresented to the card
            this.setState({ requestType: "Activate-GY", cardOptionsPresented: cardDetails })
            this.fadeOutHand("Activate-GY")
        } else if (requestType == "Banish-GY") {

            this.toggleGraveyardPopup()
            boardCopy["graveyard"] = graveyard.splice(graveyard.findIndex(e => e.id === cardDetails.id), 1);
            const updatedBanishedZone = [...banishedZone, cardDetails]
            boardCopy["banishedZone"] = updatedBanishedZone

            //update the card's set property to true
            await alterBoard({ location: [board, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })
            await alterBoard({ location: [board, "banishedZone"], zone: updatedBanishedZone, hostUsername: this.state.hostedBy })

        }
    }
    manageCardInBanishedZone = async (requestType) => {
        this.toggleCardInBanishedZoneOptions()
        const cardDetails = this.state.cardType
        const board = this.state.hosting ? "hostBoard" : "guestBoard"


        let boardCopy = { ...this.state[board] }
        let graveyard = boardCopy["graveyard"]
        let banishedZone = boardCopy["banishedZone"]

        if (requestType == "Return-To-Hand-BZ") {

            const extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster", "Synchro Tuner Monster"]
            if (extraDeckTypes.includes(cardDetails.type)) {
                const modifiedExtraDeck = [...this.state.extraDeck, cardDetails]
                boardCopy["banishedZone"] = banishedZone.splice(banishedZone.findIndex(e => e.id === cardDetails.id), 1);
                this.setState({ [board]: boardCopy, extraDeck: modifiedExtraDeck, cardInfo: "" })
                await alterBoard({ location: [board, "banishedZone"], zone: banishedZone, hostUsername: this.state.hostedBy })
            } else {
                boardCopy["banishedZone"] = banishedZone.splice(banishedZone.findIndex(e => e.id === cardDetails.id), 1);


                const modifiedHand = [...boardCopy.hand, cardDetails]
                boardCopy.hand = modifiedHand
                this.setState({ [board]: boardCopy, cardInfo: "" })
                await alterBoard({ location: [board, "hand"], hostUsername: this.state.hostedBy, zone: modifiedHand })
                await alterBoard({ location: [board, "banishedZone"], zone: banishedZone, hostUsername: this.state.hostedBy })
            }
            this.toggleBanishedZonePopup()

        } else if (requestType == "Special-BZ") {
            this.toggleBanishedZonePopup()
            this.setState({ requestType: "Special-BZ", cardOptionsPresented: cardDetails })

        } else if (requestType == "Examine-BZ") {
            this.setState({ cardType: cardDetails })
            this.setState({ examinePopupVisible: true })
        } else if (requestType == "Set-ST-BZ") {
            //update state's graveyard to remove card
            this.toggleBanishedZonePopup()
            boardCopy["banishedZone"] = banishedZone.splice(banishedZone.findIndex(e => e.id === cardDetails.id), 1);
            //update the card's set property to true
            await alterBoard({ location: [board, "banishedZone"], zone: banishedZone, hostUsername: this.state.hostedBy })
            //update the cardOptionsPresented to the card
            this.setState({ requestType: "Set-ST-BZ", cardOptionsPresented: cardDetails })
            this.fadeOutHand("Set-ST-BZ")

        } else if (requestType == "Activate-BZ") {
            //update state's graveyard to remove card
            this.toggleBanishedZonePopup()
            boardCopy["banishedZone"] = banishedZone.splice(banishedZone.findIndex(e => e.id === cardDetails.id), 1);
            //update the card's set property to true
            await alterBoard({ location: [board, "banishedZone"], zone: banishedZone, hostUsername: this.state.hostedBy })
            //update the cardOptionsPresented to the card
            this.setState({ requestType: "Activate-BZ", cardOptionsPresented: cardDetails })
            this.fadeOutHand("Activate-BZ")
        } else if (requestType == "Send-To-Graveyard-BZ") {

            this.toggleBanishedZonePopup()
            boardCopy["banishedZone"] = banishedZone.splice(banishedZone.findIndex(e => e.id === cardDetails.id), 1);
            const updatedGraveyard = [...graveyard, cardDetails]
            boardCopy["graveyard"] = updatedGraveyard

            //update the card's set property to true
            await alterBoard({ location: [board, "graveyard"], zone: updatedGraveyard, hostUsername: this.state.hostedBy })
            await alterBoard({ location: [board, "banishedZone"], zone: banishedZone, hostUsername: this.state.hostedBy })

        }
    }
    manageCardInDeck = async (requestType) => {
        const cardDetails = this.state.cardType
        const board = this.state.hosting ? "hostBoard" : "guestBoard"
        let boardCopy = { ...this.state[board] }
        if (requestType == "Add-To-Hand-D") {
            let filteredDeck = [...this.state.mainDeck]
            // //
            filteredDeck.splice(filteredDeck.findIndex(e => e.id === cardDetails.id), 1);
            this.toggleCardInDeckOptions()
            this.toggleDeckPopup()

            const modifiedHand = [...boardCopy.hand, cardDetails]
            boardCopy.hand = modifiedHand
            this.setState({ [board]: boardCopy, cardType: { type: "" }, mainDeck: filteredDeck })
            await alterBoard({ location: [board, "hand"], hostUsername: this.state.hostedBy, zone: modifiedHand })
        } else if (requestType == "Special-D") {
            let filteredDeck = [...this.state.mainDeck]
            // //
            filteredDeck.splice(filteredDeck.findIndex(e => e.id === cardDetails.id), 1);
            // //
            this.toggleCardInDeckOptions()
            this.toggleDeckPopup()
            this.setState({ requestType: "Special-D", cardOptionsPresented: cardDetails, mainDeck: filteredDeck })
        } else if (requestType == "Examine-D") {
            this.toggleCardInDeckOptions()
            this.setState({ cardType: cardDetails })
            this.setState({ examinePopupVisible: true, cardInHandPressedPopupVisible: false })
        } else if (requestType == "Send-To-Graveyard-D") {
            boardCopy["graveyard"] = [...boardCopy["graveyard"], cardDetails]
            let filteredDeck = [...this.state.mainDeck]
            filteredDeck.splice(filteredDeck.findIndex(e => e.id === cardDetails.id), 1);
            this.setState({ [board]: boardCopy, cardInfo: "", mainDeck: filteredDeck })
            this.toggleCardInDeckOptions()
            this.toggleDeckPopup()
            await alterBoard({ location: [board, "graveyard"], zone: boardCopy["graveyard"], hostUsername: this.state.hostedBy })

        }
    }
    manageCardInExtraDeck = (requestType) => {
        ////
        this.toggleCardInExtraDeckOptions()
        const cardDetails = this.state.cardType
        const board = this.state.hosting ? "hostBoard" : "guestBoard"
        // let boardCopy = { ...this.state[board] }
        if (requestType == "Special-ED") {
            this.toggleExtraDeckPopup()
            this.setState({ requestType: "Special-ED", cardOptionsPresented: cardDetails })
        } else if (requestType == "Examine-ED") {
            this.setState({ cardType: cardDetails })
            this.setState({ examinePopupVisible: true, cardInHandPressedPopupVisible: false })
        }
    }


    initialDraw = async () => {
        const { mainDeck, extraDeck } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        //set the state with shuffled retrieved cards and selected deck

        //after retrieving appropriate deck from firestore, update proper board's hand property 
        GameLogic.shared.addUser(this.props.user.username)

        this.setState({ selectedDeck: this.props.selectedDeck, mainDeck: GameLogic.shared.initialShuffleDeck(mainDeck), extraDeck: GameLogic.shared.alphabetize(extraDeck) })

        //set the state with five cards 
        const { shallowCards, drawnCards } = GameLogic.shared.initialDraw(this.state.mainDeck)



        const board = this.state.hosting ? "hostBoard" : "guestBoard"
        ////
        ////

        const handCopy = [...drawnCards]

        await alterBoard({ hostUsername: this.state.hostedBy, location: [board, "hand"], zone: handCopy })

        // ////
        this.setState({ mainDeck: shallowCards })

        // this.setState({ hand: drawnCards, mainDeck: shallowCards })
    }
    shuffleDeck = async () => {
        const mainDeck = [...this.state.mainDeck]
        this.setState({ mainDeck: GameLogic.shared.shuffleDeck(mainDeck) })
        this.toggleMainDeckOptions()
    }

    drawCard = async () => {
        if (this.state.mainDeck.length) {
            const { drewCard, shallowCards } = GameLogic.shared.drawCard(this.state.mainDeck)
            const board = this.state.hosting ? "hostBoard" : "guestBoard"
            const boardCopy = this.state[board]
            const modifiedHand = [...boardCopy.hand, drewCard]
            boardCopy.hand = modifiedHand
            this.setState({ [board]: boardCopy, cardType: { type: "" }, mainDeck: shallowCards })
            await alterBoard({ location: [board, "hand"], hostUsername: this.state.hostedBy, zone: modifiedHand })
        }
        this.toggleMainDeckOptions()
    }
    leaveDuel = async () => {
        leaveDuel([this.props.user.username, this.state.hostedBy])
        try {
            const enableAudio = this.props.navigation.getParam('enableAudio', 'NO-ID');
            if (this.props.preferences.musicEnabled) {
                await enableAudio()
            }

        } catch (error) {

        }


        this.props.navigation.navigate("HomePage")
    }

    //hand to field (1)
    presentCardOptions = (card) => {
        this.setState({ cardOptionsPresented: card, cardInHandPressedPopupVisible: true })
    }
    //hand to field (1) cancel
    dismissCardPopup = () => {
        this.setState({ cardInHandPressedPopupVisible: false, cardOnFieldPressedPopupVisible: false, cardInGraveyardPressed: false });
    }
    //hand to field (2)
    fadeOutHand = (type) => {
        if (type == "Examine") {
            const cardDetails = { ...this.state.cardOptionsPresented }
            this.setState({ cardType: cardDetails })
            this.setState({ examinePopupVisible: true, cardInHandPressedPopupVisible: false })
        } else {
            Animated.timing(this.state.handOpacity, { toValue: 0, useNativeDriver: true, }).start();
            this.setState({ handZIndex: -1, cardInHandPressedPopupVisible: false, requestType: type })
        }
    }
    //hand to field (3)
    addCardToBoard = async (location, requestType) => {
        this.setState({ cardInHandPressedPopupVisible: false, cardOnFieldPressedPopupVisible: false });
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
        } else if (requestType === "Send-To-Graveyard" || requestType === "Send-To-Graveyard-BZ") {
            cardDetails = { ...cardOptionsPresented }
        } else if (requestType === "Examine" || requestType === "Examine-BZ") {
            cardDetails = { ...cardOptionsPresented }
        } else if (requestType === "Special-GY" || requestType === "Special-BZ") {
            cardDetails = { ...cardOptionsPresented, set: false }
        } else if (requestType === "Set-ST-GY" || requestType === "Set-ST-BZ") {
            cardDetails = { ...cardOptionsPresented, set: true }
        } else if (requestType === "Activate-GY" || requestType === "Activate-BZ") {
            cardDetails = { ...cardOptionsPresented, set: false }
        } else if (requestType === "Special-ED" || requestType === "Special-D") {
            cardDetails = { ...cardOptionsPresented, set: false, user: this.props.user.username }
        }
        const board = location[0]
        const cardZone = location[1]
        let cardZoneIndex;
        if (location[0] != "linkZones") {
            cardZoneIndex = location[2]
        }
        if ((cardZone == "st" && cardDetails.type.includes("Monster")) || (cardZone == "m1" && cardDetails.type.includes("Spell"))) {
            this.setState({ cardOptionsPresented: false, requestType: "" })
            //logic that restricts card placement
            // return this.fadeInHand()
        }

        let boardCopy = { ...this.state[board] }
        if (cardZone == "graveyard") {
            boardCopy[cardZone].push(cardDetails)
        } else {
            boardCopy[cardZone][cardZoneIndex] = { card: { ...cardDetails, exists: true, defensePosition: false } }
        }

        if (requestType === "Special-GY") {
            if (board === "linkZones") {
                let propBoard = this.state.hosting ? "hostBoard" : "guestBoard"
                let boardCopy = { ...this.state[propBoard] }
                let graveyard = boardCopy["graveyard"]



                boardCopy["graveyard"] = graveyard.splice(graveyard.findIndex(e => e.id === cardDetails.id), 1);
                await alterBoard({ location: [propBoard, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })



                const cardToAdd = { card: { ...cardDetails, exists: true, defensePosition: false, user: this.props.user.username } }
                let linkZoneCopy = [...this.state.linkZones]
                linkZoneCopy[cardZone] = cardToAdd
                await alterLinkZone({ location: ["linkZones"], updates: linkZoneCopy, hostUsername: this.state.hostedBy })
                this.setState({ cardInfo: "", cardType: { type: "" }, requestType: "" })
                return


                return
            } else {
                let graveyard = boardCopy["graveyard"]
                boardCopy["graveyard"] = graveyard.splice(graveyard.findIndex(e => e.id === cardDetails.id), 1);
                await alterBoard({ location: [board, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })
            }
        }
        if (requestType === "Special-BZ") {
            let banishedZone = boardCopy["banishedZone"]
            boardCopy["banishedZone"] = banishedZone.splice(banishedZone.findIndex(e => e.id === cardDetails.id), 1);
            await alterBoard({ location: [board, "banishedZone"], zone: banishedZone, hostUsername: this.state.hostedBy })
        }


        if (requestType === "Special-ED") {
            let filteredExtraDeck = [...this.state.extraDeck]
            //
            filteredExtraDeck.splice(filteredExtraDeck.findIndex(e => e.id === cardDetails.id), 1);
            //
            this.setState({ extraDeck: filteredExtraDeck })
        }
        if (board === "linkZones" && requestType === "Special-ED") {
            const cardToAdd = { card: { ...cardDetails, exists: true, defensePosition: false, user: this.props.user.username } }
            let linkZoneCopy = [...this.state.linkZones]
            linkZoneCopy[cardZone] = cardToAdd
            await alterLinkZone({ location, updates: linkZoneCopy, hostUsername: this.state.hostedBy })
            this.setState({ cardInfo: "", cardType: { type: "" }, requestType: "" })
            return
        }

        if (!requestType.includes("-GY") && !requestType.includes("-ED") && !requestType.includes("-D") && !requestType.includes("-BZ")) {
            const filteredHand = [...boardCopy.hand]
            filteredHand.splice(filteredHand.findIndex(e => e.id === cardDetails.id), 1);
            boardCopy.hand = filteredHand
            await alterBoard({ location: [board, "hand"], hostUsername: this.state.hostedBy, zone: filteredHand })
            this.setState({ [board]: boardCopy, cardOptionsPresented: false })
        } else {
            this.setState({ [board]: boardCopy, cardOptionsPresented: false })
        }

        this.fadeInHand()
        await alterBoard({ location, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
    }

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.presentCardOptions(item)} style={{ flex: 1 }}>
                {item["card_images"] && <FadeScaleImage source={{ uri: item["card_images"][0]["image_url"] }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} style={{
                    width: 100, height: 200
                }} />}
            </TouchableOpacity>
        )
    }
    renderGraveyardCards = ({ item }) => {
        return (
            <TouchableOpacity style={{ width: 200, height: 400, flexDirection: "row", justifyContent: "center", alignItems: "center" }} onPress={() => this.presentCardOptions(item)}>
                {item["card_images"] && <FadeScaleImage source={{ uri: item["card_images"][0]["image_url"] }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} style={{
                    width: 200, height: 400
                }} />}
            </TouchableOpacity>
        )
    }
    renderOpponentHand = () => {
        return (
            <FadeScaleImage source={require("../assets/default_card.png")} resizeMode={"contain"} style={{
                width: 100, height: 200
            }} />
        )
    }
    toggleLifePointsCalculator = () => {
        this.setState({ calculatorVisible: !this.state.calculatorVisible })
    }
    returnNewLifePointVal = (val) => {
        this.setState({ [val.proper]: val.calculation })
    }
    getRandomInt = () => {
        return Math.floor(Math.random() * Math.floor(7));
    }
    // requestAccessToGraveyard = async () => {
    //     //
    //     const board = this.state.hosting ? "guestBoard" : "hostBoard"
    //     const hostUsername = this.state.hostedBy
    //     const obj = { hostUsername, board }
    //     await requestAccessToGraveyard(obj)
    // }
    toggleOpponentGraveyardPopup = async (typeOfRequest) => {
        if (typeOfRequest == "request") {
            const board = this.state.hosting ? "guestBoard" : "hostBoard"
            const hostUsername = this.state.hostedBy
            const obj = { hostUsername, board }
            await requestAccessToGraveyard(obj)
        } else if (typeOfRequest == "dismiss") {
            const board1 = this.state.hosting ? "hostBoard" : "guestBoard"
            const board2 = this.state.hosting ? "guestBoard" : "hostBoard"
            const hostUsername = this.state.hostedBy
            const obj = { hostUsername, board1, board2 }
            // this.setState({ requestingAccessToGraveyardPopupVisible: false })
            await dismissRequestAccessToGraveyard(obj)
            this.setState({ requestApproved: false, graveyardPopupVisible: false })
        } else if (typeOfRequest == "approve") {
            const board1 = this.state.hosting ? "hostBoard" : "guestBoard"
            const board2 = this.state.hosting ? "guestBoard" : "hostBoard"
            const hostUsername = this.state.hostedBy
            const obj = { hostUsername, board1, board2 }
            await approveAccessToGraveyard(obj)
        } else if (typeOfRequest == "reveal") {
            this.setState({ requestApproved: true, graveyardPopupVisible: true })
        }
    }
    toggleMainDeckOptions = () => {
        this.setState({ mainDeckOptionsVisible: !this.state.mainDeckOptionsVisible })
    }
    examineOpponentCard = (card) => {
        this.setState({ cardType: card })
        this.toggleExaminePopup()
    }

    render() {
        const { backgroundImageUrl, boardsRetrieved, handOpacity, handZIndex, waitingForOpponentPopupVisible, cardInHandPressedPopupVisible, cardOptionsPresented, examinePopupVisible, graveyardPopupVisible, cardInGraveyardPressed, mainDeck, extraDeck, extraDeckPopupVisible } = this.state
        const properBoard = this.state.hosting ? "hostBoard" : "guestBoard"
        const opponentBoard = this.state.hosting ? "guestBoard" : "hostBoard"
        const deck = this.state.mainDeck

        const hand = this.state[properBoard].hand
        const opponentHand = this.state[opponentBoard].hand
        return (
            <SideMenu openMenuOffset={Dimensions.get("window").width / 2} menu={<CustomSideMenu screen={"DuelingRoomPage"} navigation={this.props.navigation} leaveDuel={this.leaveDuel} />}>
                <View style={styles.container}>
                    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0, zIndex: -10 }}>
                        {backgroundImageUrl && <FadeScaleImage source={backgroundImageUrl} style={{ flex: 1, width: null, height: null }} resizeMode={"contain"} />}
                    </View>
                    <OpponentHand renderOpponentHand={this.renderOpponentHand} opponentHand={opponentHand} />
                    <View style={{ flex: 2 / 20 }}>
                    </View>
                    <View style={{ flex: 6 / 20, flexDirection: "column", alignItems: "center", justifyContent: "flex-start", transform: [{ rotate: '180deg' }] }}>
                        <OpponentBoard boardsRetrieved={boardsRetrieved} opponentBoard={this.state[opponentBoard]} toggleOpponentGraveyardPopup={this.toggleOpponentGraveyardPopup} examineOpponentCard={this.examineOpponentCard} />
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", position: "absolute", top: 0, left: 10, transform: [{ rotate: '180deg' }], backgroundColor: "#FFF", borderRadius: 10, padding: 10 }}>
                            <Text>{this.props.user.username === this.state.opponent ? this.state.hostedBy : this.state.opponent}</Text>
                            <TouchableOpacity onPress={() => this.alterLifePoints("host")}>
                                {/* <Text>{this.state.guestLifePoints}</Text> */}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ flex: 2 / 20, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", transform: this.props.user.username === this.state.host ? [{ rotate: '180deg' }] : [{ rotate: "0deg" }] }}>
                        <TouchableOpacity style={{ width: Dimensions.get("window").width / 7, height: 75, borderColor: 'black', borderRadius: 10, borderWidth: 2, transform: this.state.boardsRetrieved == true && this.state.linkZones[0]['card'].user && this.props.user.username === this.state.linkZones[0]['card'].user ? [{ rotate: "0deg" }] : [{ rotate: '180deg' }] }} onPress={boardsRetrieved == true && !this.state.linkZones[0]['card'].exists ? () => this.addCardToBoard(["linkZones", 0, null]) : () => this.presentCardOnBoardOptions(["linkZones", 0])}>

                            {this.state.boardsRetrieved == true && this.state.linkZones[0]['card'].exists && (<FadeScaleImage source={{ uri: this.state.linkZones[0]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null, transform: this.props.user.username === this.state.host ? [{ rotate: '180deg' }] : [{ rotate: "0deg" }] }} />)}
                        </TouchableOpacity>

                        <TouchableOpacity style={{ width: Dimensions.get("window").width / 7, height: 75, borderColor: 'black', borderRadius: 10, borderWidth: 2, transform: this.state.boardsRetrieved == true && this.state.linkZones[1]['card'].user && this.props.user.username === this.state.linkZones[1]['card'].user ? [{ rotate: "0deg" }] : [{ rotate: '180deg' }] }} onPress={boardsRetrieved == true && !this.state.linkZones[1]['card'].exists ? () => this.addCardToBoard(["linkZones", 1, null]) : () => this.presentCardOnBoardOptions(["linkZones", 1])}>
                            {this.state.boardsRetrieved == true && this.state.linkZones[1]['card'].exists && (<FadeScaleImage source={{ uri: this.state.linkZones[1]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null, transform: this.props.user.username === this.state.host ? [{ rotate: '180deg' }] : [{ rotate: "0deg" }] }} />)}

                        </TouchableOpacity>

                    </View>
                    <View style={{ flex: 6 / 20, flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", position: "absolute", top: 0, left: 10, backgroundColor: "#FFF", borderRadius: 10, borderRadius: 10, padding: 10 }}>
                            <Text>{this.props.user.username}</Text>
                            <TouchableOpacity onPress={() => this.alterLifePoints("host")}>
                                {/* <Text>{this.state.hostLifePoints}</Text> */}
                            </TouchableOpacity>
                        </View>
                        <RoomHostBoard extraDeck={extraDeck} boardsRetrieved={boardsRetrieved} properBoard={this.state[properBoard]} mainDeck={mainDeck} drawCard={this.drawCard} addCardToBoard={this.addCardToBoard} board={properBoard} presentCardOnBoardOptions={this.presentCardOnBoardOptions} toggleGraveyardPopup={this.toggleGraveyardPopup} toggleExtraDeckPopup={this.toggleExtraDeckPopup} toggleMainDeckOptions={this.toggleMainDeckOptions} toggleBanishedZonePopup={this.toggleBanishedZonePopup} />
                    </View>
                    <View style={{ flex: 4 / 20 }}>
                    </View>




                    <RoomHostHand hand={hand} renderItem={this.renderItem} handOpacity={handOpacity} handZIndex={handZIndex} />
                    <DuelingRoomDialogs waitingForOpponentPopupVisible={waitingForOpponentPopupVisible} cardInHandPressedPopupVisible={cardInHandPressedPopupVisible} dismissCardPopup={this.dismissCardPopup} cardOptionsPresented={cardOptionsPresented} fadeOutHand={this.fadeOutHand} board={properBoard} addCardToBoard={this.addCardToBoard} cardOnFieldPressedPopupVisible={this.state.cardOnFieldPressedPopupVisible} manageCardOnBoard={this.manageCardOnBoard} cardType={this.state.cardType} examinePopupVisible={examinePopupVisible} toggleExaminePopup={this.toggleExaminePopup} graveyardPopupVisible={graveyardPopupVisible} toggleGraveyardPopup={this.toggleGraveyardPopup} graveyard={this.state[properBoard]['graveyard']} opponentGraveyard={this.state.requestApproved ? this.state[opponentBoard]['graveyard'] : []} cardInGraveyardPressed={cardInGraveyardPressed} toggleCardInGraveyardOptions={this.toggleCardInGraveyardOptions} manageCardInGraveyard={this.manageCardInGraveyard} requestingAccessToGraveyardPopupVisible={this.state.requestingAccessToGraveyardPopupVisible} toggleOpponentGraveyardPopup={this.toggleOpponentGraveyardPopup} extraDeckPopupVisible={extraDeckPopupVisible} toggleExtraDeckPopup={this.toggleExtraDeckPopup} extraDeck={extraDeck} toggleCardInExtraDeckOptions={this.toggleCardInExtraDeckOptions} cardInExtraDeckPressed={this.state.cardInExtraDeckPressed} manageCardInExtraDeck={this.manageCardInExtraDeck} hostLifePoints={this.state.hostLifePoints} guestLifePoints={this.state.guestLifePoints} hostLifePointsSelected={this.state.hostLifePointsSelected} calculatorVisible={this.state.calculatorVisible} toggleLifePointsCalculator={this.toggleLifePointsCalculator} returnNewLifePointVal={this.returnNewLifePointVal} toggleMainDeckOptions={this.toggleMainDeckOptions} mainDeckOptionsVisible={this.state.mainDeckOptionsVisible} drawCard={this.drawCard} deck={deck} deckPopupVisible={this.state.deckPopupVisible} toggleDeckPopup={this.toggleDeckPopup} toggleCardInDeckOptions={this.toggleCardInDeckOptions} manageCardInDeck={this.manageCardInDeck} cardInDeckPressed={this.state.cardInDeckPressed} shuffleDeck={this.shuffleDeck} banishedZonePopupVisible={this.state.banishedZonePopupVisible} toggleBanishedZonePopup={this.toggleBanishedZonePopup} banishedZone={this.state[properBoard]['banishedZone']} toggleCardInBanishedZoneOptions={this.toggleCardInBanishedZoneOptions} cardInBanishedZonePressed={this.state.cardInBanishedZonePressed} manageCardInBanishedZone={this.manageCardInBanishedZone} />
                </View>
            </SideMenu >
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
    const { user, cards, selectedDeck, preferences } = state
    return { user, cards, selectedDeck, preferences }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        createUser,
        updateSelectedDeck
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DuelingRoomPage);