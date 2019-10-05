import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text, Animated, ImageBackground, LayoutAnimation, ActionSheetIOS, ActivityIndicator } from 'react-native';
import { FadeScaleImage, FadeScaleText, DraggableCardInHand, DraggableCardInPopup, DraggableCardOnField, RequestAccessToOpponentGraveyardPopup } from "./ComplexComponents"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser, updateSelectedDeck } from "./actions"
import { retrieveCardsFromDeck, retrieveDeckInfo, leaveDuel, alterBoard, alterLinkZone, requestAccessToGraveyard, dismissRequestAccessToGraveyard, approveAccessToGraveyard, updateLifePoints, highlightCard, requestAccessToHand, dismissRequestAccessToHand, approveAccessToHand } from "../Firebase/FireMethods"
import { firestore } from "../Firebase/Fire"
import { TouchableOpacity, FlatList } from 'react-native-gesture-handler';
import { GameLogic } from "./DuelingRoomPageComponents"
import SideMenu from "react-native-side-menu"
import CustomSideMenu from "./SideMenu"
import Dialog, { DialogContent, ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';
import DraggableOpponentBoard from "./DraggableOpponentBoard"
import * as Haptics from 'expo-haptics';
import LifePointsCircle from "./LifePointsCircle"
import CardFlip from './react-native-card-flip';


class DraggableDuelingRoomPage extends Component {
    constructor() {
        super()
        this.state = {
            selectedDeck: "",
            thisBoard: "",
            thatBoard: "",
            mainDeck: [],
            extraDeck: [],
            guestBoard: {},
            hostBoard: {},
            linkZones: [],
            hostedBy: "",
            host: "",
            opponent: "",
            opponentData: null,
            hosting: null,
            boardsRetrieved: false,
            initializeNewGame: true,
            handZoneHeight: 200,
            coords: [],
            popupZoneCoords: [],
            dragBegin: false,
            examinedCard: null,
            popupOverlayOpacity: 0.5,
            popupOpacity: 1,
            popupBackgroundColor: "#FFF",
            overlayBackgroundColor: "#000",
            popupFontColor: "black",
            inDreamState: false,
            examinePopupVisible: false,
            mainDeckPopupVisible: false,
            graveyardPopupVisible: false,
            extraDeckPopupVisible: false,
            banishedZonePopupVisible: false,
            requestAccessToOpponentGraveyardPopupVisible: true,
            backgroundImageUrl: null,
            lifePointsCircleExpanded: false,
            requestingAccessToHand: false,
            hasBeenFlippedBefore: false
        }
        this.popupBackgroundColor = new Animated.Value(0)
        this.waitingForOpponentViewOpacity = new Animated.Value(0.50)
        this.popupBackgroundColorOpacity = "#FFF"
        this.popupOpacity = 1
    }
    extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster", "Synchro Tuner Monster"]
    async componentDidMount() {
        const backgroundImages = [require("../assets/background-0.png"), require("../assets/background-1.png"), require("../assets/background-2.png"), require("../assets/background-3.png"), require("../assets/background-4.png"), require("../assets/background-5.png"), require("../assets/background-6.png"), require("../assets/background-7.png"), , require("../assets/background-8.png"), require("../assets/background-9.png")]
        const randomNum = this.getRandomInt()
        this.setState({ backgroundImageUrl: backgroundImages[randomNum], waitingForOpponentPopupVisible: true })
        const { hostedBy, hosting } = await retrieveDeckInfo(this.props.user.username)
        this.listenForGameChanges({ hostedBy: hostedBy, hosting: hosting, initializeNewGame: true })
    }
    getRandomInt = () => {
        return Math.floor(Math.random() * Math.floor(7));
    }
    respondToOpponentRequest = (response) => {
        if (response === "Approve") {
            approveAccessToHand({ hostUsername: this.state.hostedBy, board1: this.state.thisBoard, board2: this.state.thatBoard })
            setTimeout(() => {
                dismissRequestAccessToHand({ hostUsername: this.state.hostedBy, board1: this.state.thisBoard, board2: this.state.thatBoard })
            }, 3000)

        } else {
            dismissRequestAccessToHand({ hostUsername: this.state.hostedBy, board1: this.state.thisBoard, board2: this.state.thatBoard })
        }
        this.setState({ requestingAccessToHand: false })

    }
    flipOpponentHand = () => {
        const opponentHandLength = this.state[this.state.thatBoard].hand.length
        if (!this.state.hasBeenFlippedBefore) {
            for (let i = 0; i < opponentHandLength; i++) {
                this[`opponentHand${i}`].flip()
            }
            this.setState({ hasBeenFlippedBefore: true })
        }
        for (let i = 0; i < opponentHandLength; i++) {
            this[`opponentHand${i}`].flip()
        }
        setTimeout(() => {
            for (let i = 0; i < opponentHandLength; i++) {
                this[`opponentHand${i}`].flip()
            }
        }, 8000)

    }
    listenForGameChanges = ({ hostedBy, hosting }) => {
        if (hostedBy === "") {
            hostedBy = this.props.user.username
        }
        const thisBoard = hosting ? "hostBoard" : "guestBoard"
        const thatBoard = hosting ? "guestBoard" : "hostBoard"
        this.setState({ hosting, hostedBy, thisBoard, thatBoard })
        firestore.collection("rooms").doc(hostedBy)
            .onSnapshot(async doc => {
                if (doc.exists) {
                    const { guestBoard, hostBoard, opponent, host, linkZones } = doc.data()
                    this.setState({ guestBoard, hostBoard, opponent, host, linkZones, boardsRetrieved: true })

                    if (this.state.initializeNewGame && opponent) {
                        this.onOpponentJoin()
                        const opponentData = await retrieveDeckInfo(host === this.props.user.username ? opponent : host)
                        this.setState({ initializeNewGame: false, opponentData })
                        this.initialDraw()
                    }
                    if (this.state[thisBoard].requestingAccessToHand.popupVisible) {
                        if (!this.state.requestingAccessToHand) {
                            this.setState({ requestingAccessToHand: true })
                            const options = ["Deny", "Approve"]
                            ActionSheetIOS.showActionSheetWithOptions(
                                {
                                    title: `${this.state.opponent} would like to see your hand`,
                                    options: options,
                                    // cancelButtonIndex: 0,
                                    tintColor: "black"
                                },
                                index => this.respondToOpponentRequest(options[index])
                            );
                        }

                    } else if (this.state[thisBoard].requestingAccessToHand.approved) {
                        this.flipOpponentHand()

                        // setTimeout(() => {
                        //     for (let i = 0; i < opponentHandLength; i++) {
                        //         this[`opponentHand${i}`].flip()
                        //     }
                        // }, 2000)
                    }


                } else {
                    firestore.collection("users").doc(this.props.user.username).update({ hostedBy: "", hosting: false })
                    this.props.navigation.navigate("HomePage")

                }
            })
    }
    initialDraw = async () => {
        const { mainDeck, extraDeck } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        GameLogic.shared.addUser(this.props.user.username)
        this.setState({ selectedDeck: this.props.selectedDeck, mainDeck: GameLogic.shared.initialShuffleDeck(mainDeck), extraDeck: GameLogic.shared.alphabetize(extraDeck) })
        const { shallowCards, drawnCards } = GameLogic.shared.initialDraw(this.state.mainDeck)
        await alterBoard({ hostUsername: this.state.hostedBy, location: [this.state.thisBoard, "hand"], zone: [...drawnCards] })

        this.setState({ mainDeck: shallowCards })
    }
    storePopupZoneLocations = () => {
        let zones = []
        if (!this.state.extraDeckPopupVisible) {
            this[`_SendToBanishedZone0`].measure((x, y, width, height, pageX, pageY) => {
                zones.push({ location: ["SendToBanishedZone", 0], coords: { x: pageX + width / 2, y: pageY + height / 2 } })
            })
            this[`_SendToGraveyard0`].measure((x, y, width, height, pageX, pageY) => {
                zones.push({ location: ["SendToGraveyard", 0], coords: { x: pageX + width / 2, y: pageY + height / 2 } })
            })
        }
        this[`_MainDeckView0`].measure((x, y, width, height, pageX, pageY) => {
            zones.push({ location: ["MainDeckView", 0], coords: { x: pageX + width / 2, y: pageY + height / 2 } })
        })
        this.setState({ popupZoneCoords: zones })
    }
    clearPopupZoneBackgrounds = () => {
        this[`_SendToBanishedZone0`].setNativeProps({
            backgroundColor: "transparent"
        });
        this[`_SendToGraveyard0`].setNativeProps({
            backgroundColor: "transparent"
        });
        this[`_MainDeckView0`].setNativeProps({
            backgroundColor: "transparent"
        });
    }
    storeZoneLocations = () => {
        let zones = []
        for (let i = 1; i < 6; i++) {
            this[`_m1${i}`].measure((x, y, width, height, pageX, pageY) => {
                zones.push({ location: ["m1", i], coords: { x: pageX, y: pageY + height } })
            })
            this[`_st${i}`].measure((x, y, width, height, pageX, pageY) => {
                zones.push({ location: ["st", i], coords: { x: pageX, y: pageY + height } })
            })
        }
        this[`_cancel0`].measure((x, y, width, height, pageX, pageY) => {
            zones.push({ location: ["cancel", 0], coords: { x: pageX + width / 2, y: pageY + height / 2 } })
        })
        this[`_banishedZone0`].measure((x, y, width, height, pageX, pageY) => {
            zones.push({ location: ["banishedZone", 0], coords: { x: pageX, y: pageY + height } })
        })
        this[`_graveyard0`].measure((x, y, width, height, pageX, pageY) => {
            zones.push({ location: ["graveyard", 0], coords: { x: pageX, y: pageY + height } })
        })
        this[`_st6`].measure((x, y, width, height, pageX, pageY) => {
            zones.push({ location: ["st", 6], coords: { x: pageX + width / 2, y: pageY + height / 2 } })
        })
        this[`_mainDeck0`].measure((x, y, width, height, pageX, pageY) => {
            zones.push({ location: ["mainDeck", 0], coords: { x: pageX + width / 2, y: pageY + height / 2 } })
        })
        this[`_extraDeck0`].measure((x, y, width, height, pageX, pageY) => {
            zones.push({ location: ["extraDeck", 0], coords: { x: pageX + width / 2, y: pageY + height / 2 } })
        })
        this[`_linkZone0`].measure((x, y, width, height, pageX, pageY) => {
            zones.push({ location: ["linkZone", 0], coords: { x: pageX + width / 2, y: pageY + height / 2 } })
        })
        this[`_linkZone1`].measure((x, y, width, height, pageX, pageY) => {
            zones.push({ location: ["linkZone", 1], coords: { x: pageX + width / 2, y: pageY + height / 2 } })
        })
        this.setState({ coords: zones })
    }
    toggleHandZone = () => {
        this.setState({ dragBegin: !this.state.dragBegin })
        LayoutAnimation.configureNext({
            duration: 375,
            create: {
                type: LayoutAnimation.Types.spring,
                property: LayoutAnimation.Properties.scaleXY,
                springDamping: 0.7,
            },
            update: {
                type: LayoutAnimation.Types.spring,
                springDamping: 0.7,
            },
        });
        if (this.state.handZoneHeight === 200) {
            this.setState({
                handZoneHeight: "100%"
            })
        } else {
            this.setState({
                handZoneHeight: 200
            })
        }
    }
    raiseSelectedZone = ([zone, idx]) => {
        this[`_${zone}${idx}`].setNativeProps({
            zIndex: 100,
        });
    }
    lowerSelectedZone = ([zone, idx]) => {
        this[`_${zone}${idx}`].setNativeProps({
            zIndex: 0,
        });
    }
    highlightClosestZone = ([zone, idx]) => {
        if ((this.state.mainDeckPopupVisible && this.state.inDreamState) || (this.state.graveyardPopupVisible && this.state.inDreamState) || (this.state.banishedZonePopupVisible && this.state.inDreamState) || (this.state.extraDeckPopupVisible && this.state.inDreamState) || (this.state[this.state.thisBoard].requestingAccessToGraveyard.approved && this.state.inDreamState)) {
            this.clearZoneBackgrounds()
        } else if (this.state.mainDeckPopupVisible || this.state.graveyardPopupVisible || this.state.banishedZonePopupVisible || this.state.extraDeckPopupVisible || this.state[this.state.thisBoard].requestingAccessToGraveyard.approved) {
            this.clearPopupZoneBackgrounds()
        } else {
            this.clearZoneBackgrounds()
        }
        if (zone !== "cancel") {
            this[`_${zone}${idx}`].setNativeProps({
                backgroundColor: "#ADD8E6",
            });
        }
    }
    clearZoneBackgrounds = () => {
        for (let i = 1; i < 6; i++) {
            this[`_m1${i}`].setNativeProps({
                backgroundColor: "transparent",
            });
            this[`_st${i}`].setNativeProps({
                backgroundColor: "transparent"
            });
        }
        this[`_st6`].setNativeProps({
            backgroundColor: "transparent"
        });
        this[`_cancel0`].setNativeProps({
            backgroundColor: "transparent"
        });
        this[`_banishedZone0`].setNativeProps({
            backgroundColor: "transparent"
        });
        this[`_graveyard0`].setNativeProps({
            backgroundColor: "transparent"
        });
        this[`_mainDeck0`].setNativeProps({
            backgroundColor: "transparent"
        });
        this["_extraDeck0"].setNativeProps({
            backgroundColor: "transparent"
        })
        this["_linkZone0"].setNativeProps({
            backgroundColor: "transparent"
        })
        this["_linkZone1"].setNativeProps({
            backgroundColor: "transparent"
        })
    }
    manageCardInPopup = async (startLocation, endLocation, card) => {
        let { thisBoard, thatBoard } = this.state
        let boardCopy = { ...this.state[thisBoard] }

        let startBoardCopy;
        let endBoardCopy;
        let startBoard;
        let endBoard;
        if (this.state[thisBoard].requestingAccessToGraveyard.approved) {
            startBoardCopy = { ...this.state[thatBoard] }
            endBoardCopy = { ...this.state[thisBoard] }
            startBoard = thatBoard
            endBoard = thisBoard
        } else {
            startBoardCopy = { ...this.state[thisBoard] }
            endBoardCopy = startBoardCopy
            startBoard = thisBoard
            endBoard = startBoard
        }



        let types = { "SendToBanishedZone": "banishedZone", "SendToGraveyard": "graveyard", "MainDeckView": "mainDeck", "ExtraDeckView": "extraDeck" }
        let [startCardZone, startCardIndex] = startLocation
        let [endCardZone, endCardIndex] = endLocation
        console.log(startLocation, "=>>>>", endLocation)
        if (startCardZone === "ExtraDeckView" && endCardZone === "MainDeckView") return
        if (startCardZone === "ExtraDeckView" && endCardZone === "cancel") {
            return this.toggleExtraDeckPopup()
        }
        if (startCardZone === endCardZone) return
        if (this.props.user.username !== card.user && (endCardZone === "graveyard" || endCardZone === "mainDeck" || endCardZone === "extraDeck" || endCardZone === "banishedZone")) {
            return this.toggleAppropriateZone(startCardZone)
        }
        if (startCardZone in types) {
            if (types[startCardZone] === endCardZone) {
                return this.toggleAppropriateZone(startCardZone)
            }
        }
        if (endCardZone in types) {
            if (endCardZone === types[endCardZone]) {
                return this.toggleAppropriateZone(startCardZone)
            }
        }
        //attempt to escape fuction if end card zone is invalid 
        if (endCardZone === "extraDeck" && !(this.extraDeckTypes.includes(card.type)) || endCardZone === "mainDeck" && (this.extraDeckTypes.includes(card.type))) {
            this.toggleAppropriateZone(startCardZone)
            return console.log("bad request!")
        }

        if (startCardZone === "MainDeckView") {
            let filteredDeck = [...this.state.mainDeck]
            filteredDeck.splice(filteredDeck.findIndex(e => e.id === card.id), 1)
            this.setState({ mainDeck: filteredDeck })
        } else if (startCardZone === "SendToGraveyard") {
            let graveyard = startBoardCopy["graveyard"]
            graveyard.splice(graveyard.findIndex(e => e.id === card.id), 1);
            await alterBoard({ location: [startBoard, "graveyard"], zone: graveyard, hostUsername: this.state.hostedBy })
        } else if (startCardZone === "SendToBanishedZone") {
            let banishedZone = startBoardCopy["banishedZone"]
            banishedZone.splice(banishedZone.findIndex(e => e.id === card.id), 1);
            await alterBoard({ location: [startBoard, "banishedZone"], zone: banishedZone, hostUsername: this.state.hostedBy })
        } else if (startCardZone === "ExtraDeckView") {
            let filteredDeck = [...this.state.extraDeck]
            filteredDeck.splice(filteredDeck.findIndex(e => e.id === card.id), 1)
            this.setState({ extraDeck: filteredDeck })
        }
        if (endCardZone === "SendToBanishedZone" || endCardZone === "SendToGraveyard") {
            startBoardCopy[types[endCardZone]] = [...startBoardCopy[types[endCardZone]], card] //update Locally
            await alterBoard({ location: [startBoard, types[endCardZone]], zone: startBoardCopy[types[endCardZone]], hostUsername: this.state.hostedBy })
        } else if (endCardZone === "m1" || endCardZone === "st") {
            console.log("end card zone === m1 or st")
            card.exists = true
            if (endBoardCopy[endCardZone][endCardIndex].exists) {
                let existingCard = endBoardCopy[endCardZone][endCardIndex]
                existingCard.exists = false
                existingCard.set = false
                existingCard.defensePosition = false
                endBoardCopy["graveyard"] = [...endBoardCopy["graveyard"], existingCard]
                await alterBoard({ location: [endBoard, "graveyard"], hostUsername: this.state.hostedBy, zone: endBoardCopy["graveyard"] })
            }
            endBoardCopy[endCardZone][endCardIndex] = card
            await alterBoard({ location: [endBoard, endCardZone], hostUsername: this.state.hostedBy, zone: endBoardCopy[endCardZone] })
            this.toggleAppropriateZone(startCardZone)
        } else if (endCardZone === "graveyard" || endCardZone === "banishedZone" || endCardZone === "cancel") {
            card.exists = false
            card.set = false
            card.defensePosition = false
            if (endCardZone === "cancel") endCardZone = "hand"
            if (endCardZone === "hand" && this.extraDeckTypes.includes(card.type)) {
                this.setState({ extraDeck: [...this.state.extraDeck, card] })
            } else {
                endBoardCopy[endCardZone] = [...endBoardCopy[endCardZone], card] //update Locally
                await alterBoard({ location: [endBoard, endCardZone], zone: endBoardCopy[endCardZone], hostUsername: this.state.hostedBy })
            }
            this.toggleAppropriateZone(startCardZone)
        } else if (endCardZone === "MainDeckView" || endCardZone === "mainDeck") {

            if (this.extraDeckTypes.includes(card.type)) {
                this.setState({ extraDeck: [...this.state.extraDeck, card] })
            } else {
                this.setState({ mainDeck: [...this.state.mainDeck, card] })
            }
            if (endCardZone === "mainDeck") {
                this.toggleAppropriateZone(startCardZone)
            }
        } else if (endCardZone === "extraDeck") {
            if (this.extraDeckTypes.includes(card.type)) {
                let extraDeck = [...this.state.extraDeck]
                extraDeck.push(card)
                this.setState({ extraDeck })
            }
        } else if (endCardZone === "linkZone") {
            if (this.state.linkZones[endCardIndex].exists) {
                let existingCard = this.state.linkZones[endCardIndex]
                existingCard.exists = false
                existingCard.set = false
                existingCard.defensePosition = false
                endBoardCopy["graveyard"] = [...endBoardCopy["graveyard"], existingCard]
                await alterBoard({ location: [endBoard, "graveyard"], hostUsername: this.state.hostedBy, zone: endBoardCopy["graveyard"] })
            }
            let linkZoneCopy = [...this.state.linkZones]
            card.exists = true
            linkZoneCopy[endCardIndex] = card
            await alterLinkZone({ location: ["linkZones"], updates: linkZoneCopy, hostUsername: this.state.hostedBy })
            this.toggleAppropriateZone(startCardZone)
        }
        this.setState({ [endBoard]: boardCopy })
        if (startCardZone === "MainDeckView") {
            if (!this.state.mainDeck.length) this.toggleMainDeckPopup()
        } else if (startCardZone === "SendToGraveyard") {
            if (!this.state[thisBoard].graveyard.length) this.toggleGraveyardPopup()
        } else if (startCardZone === "SendToBanishedZone") {
            if (!this.state[thisBoard].banishedZone.length) this.toggleBanishedZonePopup()
        }
    }
    toggleAppropriateZone = (startCardZone) => {
        if (startCardZone === "MainDeckView") {
            this.toggleMainDeckPopup()
        } else if (startCardZone === "SendToGraveyard") {
            this.toggleGraveyardPopup()
        } else if (startCardZone === "SendToBanishedZone") {
            this.toggleBanishedZonePopup()
        } else if (startCardZone === "ExtraDeckView") {
            this.toggleExtraDeckPopup()
        }
    }
    manageCardOnField = async (startLocation, endLocation, card) => {
        let { thisBoard } = this.state
        let [startCardZone, startCardIndex] = startLocation
        let [endCardZone, endCardIndex] = endLocation

        let boardCopy = { ...this.state[thisBoard] }
        console.log(startCardZone, "=>", endCardZone)
        if (endCardZone === "extraDeck" && !(this.extraDeckTypes.includes(card.type)) || endCardZone === "mainDeck" && (this.extraDeckTypes.includes(card.type))) {
            this.toggleAppropriateZone(startCardZone)
            return console.log("bad request!")
        }
        if ((endCardZone === "mainDeck" || endCardZone === "extraDeck") && startCardZone !== "linkZone") {
            if (card.user !== this.props.user.username) {
                //prevent user from putting opponent's cards in his own deck
                return
            }
            card.exists = false
            card.set = false
            card.defensePosition = false
            this.setState({ [endCardZone]: [...this.state[endCardZone], card] })
            boardCopy[startCardZone][startCardIndex] = { card: { defenseMode: false, exists: false } }
            return await alterBoard({ location: [thisBoard, startCardZone], hostUsername: this.state.hostedBy, zone: boardCopy[startCardZone] })
        } else if ((endCardZone === "mainDeck" || endCardZone === "extraDeck") && startCardZone === "linkZone") {
            if (card.user !== this.props.user.username) {
                //prevent user from putting opponent's cards in his own deck
                return
            }


            let linkZones = [...this.state.linkZones]
            card.exists = false
            card.set = false
            card.defensePosition = false
            this.setState({ [endCardZone]: [...this.state[endCardZone], card] })

            linkZones[startCardIndex] = { card: { defenseMode: false, exists: false } }
            card.exists = true
            return await alterLinkZone({ location: ["linkZones"], updates: linkZones, hostUsername: this.state.hostedBy })
        } else if ((endCardZone === "graveyard" || endCardZone === "banishedZone" || endCardZone === "cancel") && startCardZone !== "linkZone") {
            if (card.user !== this.props.user.username) {
                //prevent user from putting opponent's cards in his own deck
                return
            }
            card.exists = false
            card.set = false
            card.defensePosition = false
            if (endCardZone === "cancel") endCardZone = "hand"
            if (endCardZone === "hand" && this.extraDeckTypes.includes(card.type)) {
                this.setState({ extraDeck: [...this.state.extraDeck, card] })
            } else {
                boardCopy[startCardZone][startCardIndex] = { card: { defenseMode: false, exists: false } }
                boardCopy[endCardZone].push(card)
            }
        } else if ((endCardZone === "graveyard" || endCardZone === "banishedZone" || endCardZone === "cancel") && startCardZone === "linkZone") {
            if (card.user !== this.props.user.username) {
                //prevent user from putting opponent's cards in his own deck
                return
            }
            card.exists = false
            card.set = false
            card.defensePosition = false
            let linkZones = [...this.state.linkZones]
            if (endCardZone === "cancel") endCardZone = "hand"
            if (endCardZone === "hand" && this.extraDeckTypes.includes(card.type)) {
                this.setState({ extraDeck: [...this.state.extraDeck, card] })
            } else {
                linkZones[startCardIndex] = { card: { defenseMode: false, exists: false } }
                boardCopy[endCardZone].push(card)
            }
            // beans
            await alterBoard({ location: [thisBoard, endCardZone], hostUsername: this.state.hostedBy, zone: boardCopy[endCardZone] })
            return await alterLinkZone({ location: ["linkZones"], updates: linkZones, hostUsername: this.state.hostedBy })

        } else {
            if ((startCardZone == endCardZone && startCardIndex == endCardIndex)) {
                return console.log("bad request!")
            }
            if (endCardZone === "st" && startCardZone === "m1") {
                if (card.set) {
                    card.defensePosition = false
                }


            } else if (endCardZone === "m1" && startCardZone === "st") {
                if (card.set) {
                    card.defensePosition = true
                }

            }
            if (endCardZone === "linkZone") {
                let linkZones = [...this.state.linkZones]

                if (linkZones[endCardIndex].exists) {
                    let existingCard = linkZones[endCardIndex]
                    existingCard.exists = false
                    existingCard.set = false
                    existingCard.defensePosition = false
                    boardCopy["graveyard"] = [...boardCopy["graveyard"], existingCard]
                    await alterBoard({ location: [thisBoard, "graveyard"], hostUsername: this.state.hostedBy, zone: boardCopy["graveyard"] })
                }
                if (startCardZone === "linkZone") {
                    linkZones[startCardIndex] = { card: { defenseMode: false, exists: false } }
                    card.exists = true
                    linkZones[endCardIndex] = card
                    return await alterLinkZone({ location: ["linkZones"], updates: linkZones, hostUsername: this.state.hostedBy })

                } else {
                    let linkZoneCopy = [...this.state.linkZones]
                    card.exists = true
                    linkZoneCopy[endCardIndex] = card
                    await alterLinkZone({ location: ["linkZones"], updates: linkZoneCopy, hostUsername: this.state.hostedBy })
                    boardCopy[startCardZone][startCardIndex] = { card: { defenseMode: false, exists: false } }
                    await alterBoard({ location: [thisBoard, startCardZone], hostUsername: this.state.hostedBy, zone: boardCopy[startCardZone] })
                    return
                }



                //finish implementing link zone logic here

            } else {
                if (boardCopy[endCardZone][endCardIndex].exists) {
                    let existingCard = boardCopy[endCardZone][endCardIndex]
                    existingCard.exists = false
                    existingCard.set = false
                    existingCard.defensePosition = false
                    boardCopy["graveyard"] = [...boardCopy["graveyard"], existingCard]
                    await alterBoard({ location: [thisBoard, "graveyard"], hostUsername: this.state.hostedBy, zone: boardCopy["graveyard"] })
                }
                if (startCardZone === "linkZone") {
                    let linkZones = this.state.linkZones
                    linkZones[startCardIndex] = { card: { defenseMode: false, exists: false } }
                    await alterLinkZone({ location: ["linkZones"], updates: linkZones, hostUsername: this.state.hostedBy })
                    boardCopy[endCardZone][endCardIndex] = card
                    await alterBoard({ location: [thisBoard, endCardZone], hostUsername: this.state.hostedBy, zone: boardCopy[endCardZone] })
                    return
                } else {
                    boardCopy[startCardZone][startCardIndex] = { card: { defenseMode: false, exists: false } }
                    boardCopy[endCardZone][endCardIndex] = card
                }
            }
        }
        await alterBoard({ location: [thisBoard, startCardZone], hostUsername: this.state.hostedBy, zone: boardCopy[startCardZone] })
        await alterBoard({ location: [thisBoard, endCardZone], hostUsername: this.state.hostedBy, zone: boardCopy[endCardZone] })
    }
    manageCardInHand = async (type, location, card) => {
        let { thisBoard } = this.state
        let [cardZone, cardZoneIndex] = location
        let requestType = type.split(" ").join("")
        let boardCopy = { ...this.state[thisBoard] }
        const filteredHand = [...boardCopy.hand]
        if (requestType === "SendToGraveyard" || requestType === "SendToBanishedZone" || requestType === "SendToMainDeck") {
            if (requestType === "SendToMainDeck") {
                this.setState({ mainDeck: [...this.state.mainDeck, card] })
                filteredHand.splice(filteredHand.findIndex(e => e.id === card.id), 1);
                boardCopy.hand = filteredHand
                await alterBoard({ location: [thisBoard, "hand"], hostUsername: this.state.hostedBy, zone: filteredHand })
            } else {
                boardCopy[cardZone].push(card)
                filteredHand.splice(filteredHand.findIndex(e => e.id === card.id), 1);
                boardCopy.hand = filteredHand
                // this.setState({ [thisBoard]: boardCopy })
                await alterBoard({ location: [thisBoard, cardZone], hostUsername: this.state.hostedBy, zone: boardCopy[cardZone] })
                await alterBoard({ location: [thisBoard, "hand"], hostUsername: this.state.hostedBy, zone: filteredHand })
            }
        } else {
            card.exists = true
            //add to field
            //retrieve stuff I'm going to need
            if (requestType === "Set") {
                if (card.type.includes("Monster") && cardZone !== "st") {
                    card.defensePosition = true
                }
                card.set = true
            }
            //update locally
            if (boardCopy[cardZone][cardZoneIndex].exists) {
                let existingCard = boardCopy[cardZone][cardZoneIndex]
                existingCard.exists = false
                existingCard.set = false
                existingCard.defensePosition = false

                boardCopy["graveyard"] = [...boardCopy["graveyard"], existingCard]
                await alterBoard({ location: [thisBoard, "graveyard"], hostUsername: this.state.hostedBy, zone: boardCopy["graveyard"] })
            }
            boardCopy[cardZone][cardZoneIndex] = card
            filteredHand.splice(filteredHand.findIndex(e => e.id === card.id), 1);
            boardCopy.hand = filteredHand
            await alterBoard({ location: [thisBoard, cardZone], hostUsername: this.state.hostedBy, zone: boardCopy[cardZone] })
            await alterBoard({ location: [thisBoard, "hand"], hostUsername: this.state.hostedBy, zone: filteredHand })
        }

    }
    presentHandOptions = async (location, card) => {
        let options = {
            m1: ["Cancel", "Special Summon", "Normal Summon", "Set"],
            st: ["Cancel", "Activate", "Set"],
        }
        if (location[0] === "graveyard" || location[0] === "banishedZone" || location[0] === "mainDeck") {
            const type = `Send To ${location[0].charAt(0).toUpperCase() + location[0].slice(1)}`
            this.manageCardInHand(type, location, card)
        } else if (location[0] === "extraDeck") {

        } else if (location[0] === "linkZone") {

        } else {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: options[location[0]],
                    cancelButtonIndex: 0,
                    tintColor: "black"
                },
                index => index !== 0 && this.manageCardInHand(options[location[0]][index], location, card)
            );
        }
    }
    toggleExaminePopup = () => {
        this.setState({ examinePopupVisible: !this.state.examinePopupVisible })
    }
    examineCard = (examinedCard) => {
        this.setState({ examinedCard })
        this.toggleExaminePopup()
    }
    presentDeckOptions = () => {
        if (this.state.mainDeck.length > 0) {
            let options = ["Cancel", "Draw", "Shuffle", "Mill", "View"]
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: options,
                    cancelButtonIndex: 0,
                    tintColor: "black"
                },
                index => index !== 0 && this.manageCardInDeck(options[index])
            );
        }
    }
    toggleExtraDeckPopup = () => {
        this.setState({ extraDeckPopupVisible: !this.state.extraDeckPopupVisible })
    }
    manageCardInDeck = async (type) => {
        if (type === "Draw") {
            await this.drawCard()
        } else if (type === "Shuffle") {
            this.shuffleDeck()
        } else if (type === "Mill") {
            await this.millCard()
        } else if (type === "View") {
            await this.toggleMainDeckPopup()
        }
    }
    toggleMainDeckPopup = async () => {
        this.setState({ mainDeckPopupVisible: !this.state.mainDeckPopupVisible })
    }
    dismissMainDeckPopup = () => {
        this.setState({ mainDeckPopupVisible: false })
    }
    toggleGraveyardPopup = async () => {
        if (this.state[this.state.thisBoard].requestingAccessToGraveyard.approved) {
            await this.dismissRequestAccessToGraveyard()
            this.setState({ graveyardPopupVisible: false })
        } else {
            this.setState({ graveyardPopupVisible: !this.state.graveyardPopupVisible })
        }
    }
    millCard = async () => {
        let deck = this.state.mainDeck
        let { thisBoard } = this.state
        if (deck.length) {
            let boardCopy = { ...this.state[thisBoard] }
            let milledCard = deck.pop()
            boardCopy["graveyard"].push(milledCard)
            await alterBoard({ location: [thisBoard, "graveyard"], hostUsername: this.state.hostedBy, zone: boardCopy["graveyard"] })
            this.setState({ mainDeck: deck })
        }
    }
    shuffleDeck = async () => {
        const mainDeck = [...this.state.mainDeck]
        if (mainDeck.length) {
            this.setState({ mainDeck: GameLogic.shared.shuffleDeck(mainDeck) })
        }
    }
    drawCard = async () => {
        const mainDeck = [...this.state.mainDeck]
        if (mainDeck.length) {
            const { drewCard, shallowCards } = GameLogic.shared.drawCard(mainDeck)
            const board = this.state.thisBoard
            const boardCopy = this.state[board]
            const modifiedHand = [...boardCopy.hand, drewCard]
            boardCopy.hand = modifiedHand
            this.setState({ [board]: boardCopy, mainDeck: shallowCards })
            await alterBoard({ location: [board, "hand"], hostUsername: this.state.hostedBy, zone: modifiedHand })
        }
    }
    flipCardPosition = async (location) => {


        let [cardZone, cardZoneIndex] = location
        let board = this.state.thisBoard
        let boardCopy = { ...this.state[board] }
        let linkZoneCopy = [...this.state.linkZones]

        let pertinentCard;
        if (cardZone === "linkZone") {
            pertinentCard = linkZoneCopy[cardZoneIndex]
        } else {
            pertinentCard = boardCopy[cardZone][cardZoneIndex]
        }
        if (pertinentCard.user !== this.props.user.username) {
            return
        }


        if (cardZone !== "st") {
            if (pertinentCard.set) {
                pertinentCard.set = !pertinentCard.set
            } else if (pertinentCard.defensePosition) {
                pertinentCard.defensePosition = !pertinentCard.defensePosition
            } else {
                pertinentCard.set = !pertinentCard.set
                pertinentCard.defensePosition = !pertinentCard.defensePosition
            }
        } else {
            pertinentCard.set = !pertinentCard.set
        }
        if (cardZone === "linkZone") {
            linkZoneCopy[cardZoneIndex] = pertinentCard
            await alterLinkZone({ location: ["linkZones"], updates: linkZoneCopy, hostUsername: this.state.hostedBy })
        } else {
            boardCopy[cardZone][cardZoneIndex] = pertinentCard
            await alterBoard({ location: [board, cardZone], zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
        }





    }
    createInfiniteTsukuyomi = () => {
        if (!this.state.inDreamState) {
            this.clearPopupZoneBackgrounds()
            this.togglePopupFade()
            this.setState({ inDreamState: true, popupOverlayOpacity: 0, popupBackgroundColor: "transparent", overlayBackgroundColor: "transparent", popupFontColor: "transparent" })
        }
    }
    dispelInfiniteTsukuyomi = () => {
        if (this.state.inDreamState) {
            this.togglePopupFade()
            this.setState({ inDreamState: false, popupOverlayOpacity: 0.5, popupBackgroundColor: "#FFF", overlayBackgroundColor: "black", popupFontColor: "black" })
        }
    }
    togglePopupFade = () => {
        Animated.timing(this.popupBackgroundColor, {
            toValue: this.state.inDreamState ? 0 : 150,
            duration: 1000
        }).start();
        console.log(this.popupBackgroundColor)
    }
    onOpponentJoin = () => {
        Animated.timing(this.waitingForOpponentViewOpacity, {
            toValue: 0,
            duration: 1000
        }).start();
        this.waitingForOpponentView.setNativeProps({
            zIndex: -100
        })
    }
    handleDeckLongPress = () => {
        if (this.state.mainDeck.length > 0) {
            Haptics.impactAsync("heavy")
            this.toggleMainDeckPopup()
        }
    }
    handleGraveyardLongPress = () => {
        if (this.state[this.state.thisBoard].graveyard.length > 0) {
            Haptics.impactAsync("heavy")
            this.toggleGraveyardPopup()
        }
    }
    handleBanishedZoneLongPress = () => {
        if (this.state[this.state.thisBoard].banishedZone.length > 0) {
            Haptics.impactAsync("heavy")
            this.toggleBanishedZonePopup()
        }
    }
    handleExtraDeckLongPress = () => {
        if (this.state.extraDeck.length > 0) {
            Haptics.impactAsync("heavy")
            this.toggleExtraDeckPopup()
        }
    }
    toggleBanishedZonePopup = () => {
        this.setState({ banishedZonePopupVisible: !this.state.banishedZonePopupVisible })
    }
    leaveDuel = async () => {
        leaveDuel([this.props.user.username, this.state.hostedBy])
        try {
            const enableAudio = this.props.navigation.getParam('enableAudio', 'NO-ID');
            if (this.props.preferences.musicEnabled) {
                await enableAudio()
            }
        } catch (error) {
            console.log(error)
        }
        this.props.navigation.navigate("HomePage")
    }
    requestAccessToOpponentGraveyard = async () => {
        Haptics.impactAsync("heavy")
        this.setState({ requestAccessToOpponentGraveyardPopupVisible: !this.state.requestAccessToOpponentGraveyardPopupVisible })
        await requestAccessToGraveyard({ hostUsername: this.state.hostedBy, board: this.state.thatBoard })
    }
    dismissRequestAccessToGraveyard = async () => {
        await dismissRequestAccessToGraveyard({ hostUsername: this.state.hostedBy, board1: this.state.thisBoard, board2: this.state.thatBoard })
    }
    approveAccessToGraveyard = async () => {
        await approveAccessToGraveyard({ hostUsername: this.state.hostedBy, board1: this.state.thisBoard, board2: this.state.thatBoard })
    }

    toggleLifePoints = (lifePoints) => {
        console.log("user has ", lifePoints, " life points")
        let { thisBoard } = this.state

        updateLifePoints({ hostUsername: this.state.hostedBy, location: [thisBoard, "lifePoints"], lifePoints })
        if (this.state.lifePointsCircleExpanded) {
            this.userInfoView.setNativeProps({ right: null })
            this.setState({ lifePointsCircleExpanded: false })
        } else {
            this.userInfoView.setNativeProps({ right: 0 })
            this.setState({ lifePointsCircleExpanded: true })

        }
    }
    highlightCard = async (location) => {
        //make copy of pertinent zone
        //update particular index's highlighted property to true
        //update rest of index's highlighted properties to false
        let zoneCopy = [...this.state[this.state.thatBoard][location[1]]]
        for (let zone of zoneCopy) {
            zone.highlighted = false
        }
        zoneCopy[location[2]].highlighted = true
        console.log(zoneCopy)
        await alterBoard({ hostUsername: this.state.hostedBy, location: [this.state.thatBoard, location[1]], zone: zoneCopy })
        setTimeout(async () => {
            zoneCopy[location[2]].highlighted = false
            await alterBoard({ hostUsername: this.state.hostedBy, location: [this.state.thatBoard, location[1]], zone: zoneCopy })
        }, 3000)
    }
    handleCardFlip = (requestType) => {
        Haptics.impactAsync("heavy")
        if (requestType === "revert") {
            // return dismissRequestAccessToHand()
        }
        requestAccessToHand({ hostUsername: this.state.hostedBy, board: this.state.thatBoard })
        // this[card].flip()
    }

    render() {
        this.popupBackgroundColorOpacity = this.popupBackgroundColor.interpolate({
            inputRange: [0, 150],
            outputRange: this.state.inDreamState ? ['#FFF', 'transparent'] : ['#FFF', '#FFF']
        })
        this.popupOpacity = this.popupBackgroundColor.interpolate({
            inputRange: [0, 150],
            outputRange: this.state.inDreamState ? [1, 0] : [1, 1]
        })
        const { thisBoard, thatBoard, boardsRetrieved, mainDeck, extraDeck, mainDeckPopupVisible, extraDeckPopupVisible, coords, graveyardPopupVisible, dragBegin, banishedZonePopupVisible, overlayBackgroundColor, popupOverlayOpacity, backgroundImageUrl, requestAccessToOpponentGraveyardPopupVisible } = this.state
        const { hand: thisHand, graveyard: thisGraveyard, banishedZone: thisBanishedZone } = boardsRetrieved && this.state[thisBoard]
        const { hand: thatHand, graveyard: thatGraveyard, banishedZone: thatBanishedZone } = boardsRetrieved && this.state[thatBoard]
        const thatHandLength = boardsRetrieved && Array(thatHand.length).fill("")
        const draggableCardOnFieldProps = { storedCards: this.props.storedCards, manageCardOnField: this.manageCardOnField, raiseSelectedZone: this.raiseSelectedZone, lowerSelectedZone: this.lowerSelectedZone, clearZoneBackgrounds: this.clearZoneBackgrounds, highlightClosestZone: this.highlightClosestZone, coords: coords, toggleHandZone: this.toggleHandZone, examineCard: this.examineCard, dismissExaminePopup: () => this.setState({ examinePopupVisible: false }), flipCardPosition: this.flipCardPosition }
        const HALFWIDTH = Dimensions.get("window").width / 2
        return (
            <SideMenu openMenuOffset={HALFWIDTH} menu={<CustomSideMenu screen={"DuelingRoomPage"} navigation={this.props.navigation} leaveDuel={this.leaveDuel} />}>
                <View style={{ flex: 1, backgroundColor: "#FFF" }}>
                    <Animated.View ref={v => this.waitingForOpponentView = v} style={{ backgroundColor: 'black', opacity: this.waitingForOpponentViewOpacity, position: 'absolute', left: 0, top: 0, right: 0, height: Dimensions.get("window").height * 12 / 32, zIndex: 20, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator color={"#FFF"} size={"large"} />
                        <Text style={{ color: "#FFF", fontSize: 30 }}>Waiting for opponent...</Text>
                    </Animated.View>
                    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0, zIndex: -3 }}>
                        {backgroundImageUrl && <FadeScaleImage source={backgroundImageUrl} style={{ flex: 1, width: null, height: null, zIndex: -3 }} resizeMode={"contain"} />}
                    </View>
                    <FlatList
                        data={thatHand}
                        renderItem={({ index, item }) => {
                            return (
                                <CardFlip style={{ width: 100, height: 200 }} ref={(card) => this[`opponentHand${index}`] = card} onFlip={(idx) => console.log("what we have to work with", idx)} >
                                    <TouchableOpacity style={{ width: 100, height: 200 }} onLongPress={() => this.handleCardFlip(`request`)}><FadeScaleImage source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ width: 100, height: 200 }} /></TouchableOpacity>
                                    <TouchableOpacity style={{ width: 100, height: 200 }} onLongPress={() => this.handleCardFlip(`request`)}><FadeScaleImage source={{ uri: item.card_images[0].image_url_small }} resizeMode={"contain"} style={{ width: 100, height: 200 }} /></TouchableOpacity>
                                </CardFlip>)
                        }}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal={true}
                        scrollEnabled={true}
                        style={{ position: "absolute", top: -90, left: 0, right: 0, zIndex: 5, transform: [{ rotate: '180deg' }] }} />
                    <View style={{ flex: 12 / 32, flexDirection: 'row', flexWrap: 'wrap', justifyContent: "center", alignItems: "flex-start", transform: [{ rotate: '180deg' }] }}>
                        <DraggableOpponentBoard highlightCard={this.highlightCard} examineCard={this.examineCard} boardsRetrieved={boardsRetrieved} thatBanishedZone={thatBanishedZone} thatBoard={this.state[thatBoard]} thatGraveyard={thatGraveyard} requestAccessToOpponentGraveyard={this.requestAccessToOpponentGraveyard} />
                    </View>
                    <View style={{ flex: 20 / 32, flexDirection: 'row', flexWrap: 'wrap', justifyContent: "center", alignItems: "flex-end" }}>
                        {[1, 2].map(cardIndex => (
                            <View key={cardIndex} style={{ ...styles.viewStyles, borderColor: "transparent" }}>
                            </View>
                        ))}
                        {this.state.hosting && <View key={0} style={{ ...styles.viewStyles }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_linkZone0`] = view }}>
                            {boardsRetrieved === true && this.state.linkZones[0].exists && <DraggableCardOnField {...draggableCardOnFieldProps} zoneLocation={["linkZone", 0]} item={this.state.linkZones[0]} user={this.props.user.username} host={this.state.host} />}
                        </View>}
                        {!this.state.hosting && <View key={0} style={{ ...styles.viewStyles }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_linkZone1`] = view }}>
                            {boardsRetrieved === true && this.state.linkZones[1].exists && <DraggableCardOnField {...draggableCardOnFieldProps} zoneLocation={["linkZone", 1]} item={this.state.linkZones[1]} user={this.props.user.username} host={this.state.host} />}
                        </View>}

                        <View style={{ ...styles.viewStyles, borderColor: "transparent" }}>
                        </View>
                        {this.state.hosting && <View key={1} style={{ ...styles.viewStyles }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_linkZone1`] = view }}>
                            {boardsRetrieved === true && this.state.linkZones[1].exists && <DraggableCardOnField {...draggableCardOnFieldProps} zoneLocation={["linkZone", 1]} item={this.state.linkZones[1]} user={this.props.user.username} host={this.state.host} />}
                        </View>}
                        {!this.state.hosting && <View key={1} style={{ ...styles.viewStyles }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_linkZone0`] = view }}>
                            {boardsRetrieved === true && this.state.linkZones[0].exists && <DraggableCardOnField {...draggableCardOnFieldProps} zoneLocation={["linkZone", 0]} item={this.state.linkZones[0]} user={this.props.user.username} host={this.state.host} />}
                        </View>}
                        {[1, 2].map(cardIndex => (
                            <View key={cardIndex} style={{ ...styles.viewStyles, borderColor: "transparent" }}>
                            </View>
                        ))}
                        {[1, 2, 3, 4, 5, 6].map(cardIndex => (
                            <View key={cardIndex} style={{ ...styles.viewStyles, borderColor: "transparent" }}>
                            </View>
                        ))}
                        <View ref={view => this.userInfoView = view} style={{ position: "absolute", bottom: Dimensions.get("window").height * 0.46, left: 0, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "transparent", right: null, zIndex: 50 }}>
                            <LifePointsCircle
                                toggleLifePoints={this.toggleLifePoints}
                                imageUrl={this.props.user.imageURL}
                                styles={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderColor: "#000000",
                                }} />
                            <FadeScaleText style={{
                                fontWeight: 'bold',
                                backgroundColor: 'transparent',
                                fontSize: 18,
                                marginLeft: 10,
                                alignSelf: "center"
                            }} title={this.props.user.username} />
                        </View>

                        <View style={{ position: "absolute", bottom: Dimensions.get("window").height * 0.55, right: 0, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            {this.state.opponentData &&
                                <React.Fragment>
                                    <LifePointsCircle
                                        value={boardsRetrieved && ((this.state[thatBoard].lifePoints) / 8000) * 359}
                                        user={this.state.opponentData}
                                        lifePoints={boardsRetrieved && this.state[thatBoard].lifePoints}
                                        imageUrl={this.state.opponentData.imageURL} styles={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 40,
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderColor: "#000000",
                                        }} />
                                    <FadeScaleText style={{
                                        fontWeight: 'bold',
                                        backgroundColor: 'transparent',
                                        fontSize: 18,
                                        marginLeft: 10,
                                        alignSelf: "center"
                                    }} title={this.state.opponentData.username} />
                                </React.Fragment>
                            }
                        </View>
                        <TouchableOpacity style={{ ...styles.viewStyles, borderWidth: 0 }} onPress={this.toggleBanishedZonePopup} onLongPress={this.handleBanishedZoneLongPress} disabled={boardsRetrieved && this.state[this.state.thisBoard].banishedZone.length === 0}>
                            {boardsRetrieved === true && thisBanishedZone.length > 0 && <FadeScaleImage storedCards={this.props.storedCards} source={{ uri: thisBanishedZone[thisBanishedZone.length - 1].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, borderWidth: 1 }} onLayout={this.storeZoneLocations} ref={view => { this[`_banishedZone0`] = view; }}>
                            </View>
                        </TouchableOpacity>
                        <View style={{ ...styles.viewStyles, borderColor: boardsRetrieved === true && this.state[thisBoard].st[6].highlighted ? "red" : "black" }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_st6`] = view; }}>
                            {boardsRetrieved === true && this.state[thisBoard].st[6].exists && <DraggableCardOnField  {...draggableCardOnFieldProps} zoneLocation={["st", 6]} item={this.state[thisBoard].st[6]} />}
                        </View>
                        {[1, 2, 3, 4, 5].map(cardIndex => (
                            <View key={cardIndex} style={{ ...styles.viewStyles, borderColor: boardsRetrieved === true && this.state[thisBoard].m1[cardIndex].highlighted ? "red" : "black" }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_m1${cardIndex}`] = view }}>
                                {boardsRetrieved === true && this.state[thisBoard].m1[cardIndex].exists && <DraggableCardOnField  {...draggableCardOnFieldProps} zoneLocation={["m1", cardIndex]} item={this.state[thisBoard].m1[cardIndex]} />}
                            </View>))}
                        <TouchableOpacity style={{ ...styles.viewStyles, borderWidth: 0 }} onPress={this.toggleGraveyardPopup} onLongPress={this.handleGraveyardLongPress} disabled={boardsRetrieved && this.state[this.state.thisBoard].graveyard.length === 0}>
                            {boardsRetrieved === true && thisGraveyard.length > 0 && <FadeScaleImage storedCards={this.props.storedCards} source={{ uri: thisGraveyard[thisGraveyard.length - 1].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, borderWidth: 1 }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_graveyard0`] = view; }}>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ ...styles.viewStyles, borderWidth: 0 }} onPress={this.toggleExtraDeckPopup} onLongPress={this.handleExtraDeckLongPress} disabled={boardsRetrieved && this.state.extraDeck.length === 0}>
                            {boardsRetrieved && extraDeck.length > 0 &&
                                <FadeScaleImage source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, borderWidth: 1 }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_extraDeck0`] = view; }}>
                            </View>
                        </TouchableOpacity>
                        {[1, 2, 3, 4, 5].map(cardIndex => (<View key={cardIndex} style={{ ...styles.viewStyles, borderColor: boardsRetrieved === true && this.state[thisBoard].st[cardIndex].highlighted ? "red" : "black" }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_st${cardIndex}`] = view; }}>
                            {boardsRetrieved && this.state[thisBoard].st[cardIndex].exists && <DraggableCardOnField {...draggableCardOnFieldProps} storedCards={this.props.storedCards} zoneLocation={["st", cardIndex]} item={this.state[thisBoard].st[cardIndex]} />}
                        </View>))}
                        <TouchableOpacity style={{ ...styles.viewStyles, borderWidth: 0 }} onPress={this.presentDeckOptions} onLongPress={this.handleDeckLongPress} disabled={boardsRetrieved && this.state.mainDeck.length === 0}>
                            {boardsRetrieved && mainDeck.length > 0 &&
                                <FadeScaleImage source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 10, borderWidth: 1 }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_mainDeck0`] = view; }}>
                                <Text style={{ color: boardsRetrieved && mainDeck.length > 0 ? "#FFF" : "black" }} >{this.state.mainDeck.length}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: 150, width: "100%", justifyContent: "center", alignItems: "center", zIndex: -10, backgroundColor: "transparent" }}>
                            {dragBegin && <View style={{ backgroundColor: "transparent", bottom: -100 }}>
                                <Text style={{ position: "absolute", bottom: 80, left: Dimensions.get("window").width / 2 - 50, right: 0, zIndex: -5, width: 100 }}>Return to Hand</Text>
                                <FadeScaleImage source={require("../assets/returnToHand.gif")} resizeMode={"contain"} style={{ width: 400, height: 400, zIndex: -10 }} />
                            </View>}
                        </View>
                    </View>
                    <Animated.View style={{ position: "absolute", bottom: -30, left: 0, right: 0, height: this.state.handZoneHeight, zIndex: 0, opacity: this.state.opacity }}>
                        <FlatList
                            data={thisHand}
                            ref={list => { this["hand"] = list; }}
                            renderItem={({ item }) => <DraggableCardInHand storedCards={this.props.storedCards} item={item} toggleHandZone={this.toggleHandZone} coords={this.state.coords} dragBegin={dragBegin} presentHandOptions={this.presentHandOptions} examineCard={this.examineCard} dismissExaminePopup={() => this.setState({ examinePopupVisible: false })} highlightClosestZone={this.highlightClosestZone} clearZoneBackgrounds={this.clearZoneBackgrounds} />}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal={true}
                            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: this.state.handZoneHeight, zIndex: 2 }}
                        />
                        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 150, zIndex: 1, width: "100%" }} onLayout={this.storeZoneLocations} collapsable={false} ref={view => { this[`_cancel0`] = view; }}>
                        </View>
                    </Animated.View>
                    <Dialog
                        visible={extraDeckPopupVisible}
                        children={[]}
                        onTouchOutside={this.toggleExtraDeckPopup}
                        dialogAnimation={new SlideAnimation({
                            slideFrom: 'top',
                            useNativeDriver: true
                        })}
                        rounded={false}
                        overlayBackgroundColor={this.state.overlayBackgroundColor}
                        overlayOpacity={this.state.popupOverlayOpacity}
                        top={0}
                        bottom={Dimensions.get("window").height * 0.10}
                        width={1.0}
                        height={0.9}
                        dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width, height: this.state.inDreamState ? Dimensions.get("window").height : Dimensions.get("window").height * 0.50, position: "absolute", top: 0 }}
                    >
                        <DialogContent style={{ width: Dimensions.get("window").width, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "transparent", height: Dimensions.get("window").height * 0.50, zIndex: 31 }}>
                            <View style={{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 32, backgroundColor: "transparent", height: Dimensions.get("window").height, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center" }} >
                                <FlatList
                                    data={extraDeck}
                                    renderItem={({ item }) => <DraggableCardInPopup storedCards={this.props.storedCards} location={"ExtraDeckView"} inDreamState={this.state.inDreamState} toggleExtraDeckPopup={this.toggleExtraDeckPopup} dispelInfiniteTsukuyomi={this.dispelInfiniteTsukuyomi} createInfiniteTsukuyomi={this.createInfiniteTsukuyomi} manageCardInPopup={this.manageCardInPopup} clearPopupZoneBackgrounds={this.clearPopupZoneBackgrounds} popupZoneCoords={this.state.popupZoneCoords} item={item} toggleHandZone={this.toggleHandZone} coords={this.state.coords} dragBegin={dragBegin} presentHandOptions={this.presentHandOptions} examineCard={this.examineCard} dismissExaminePopup={() => this.setState({ examinePopupVisible: false })} highlightClosestZone={this.highlightClosestZone} clearZoneBackgrounds={this.clearZoneBackgrounds} />}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={{ height: Dimensions.get("window").height * 0.15, width: Dimensions.get("window").width }}
                                    contentContainerStyle={{ top: Dimensions.get("window").height * 0.25 }}
                                    horizontal={true}
                                />
                            </View>
                            <View style={{ height: 0, width: 0 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToBanishedZone0`] = view; }}>
                            </View>
                            <View style={{ height: 0, width: 0 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToGraveyard0`] = view; }}>
                            </View>
                            <Animated.View style={{ height: Dimensions.get("window").height * 0.50, width: Dimensions.get("window").width, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: this.popupBackgroundColorOpacity, borderBottomRightRadius: 20, borderBottomLeftRadius: 20, opacity: this.popupOpacity, borderColor: "black", borderWidth: 2 }}>
                                <View style={{ height: Dimensions.get("window").height * 0.50, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "transparent", borderWidth: 1, borderBottomRightRadius: 20, borderBottomLeftRadius: 20 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_MainDeckView0`] = view; }}>
                                </View>
                            </Animated.View>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        containerStyle={{ backgroundColor: "transparent" }}
                        dialogStyle={{ backgroundColor: 'rgba(52, 52, 52, alpha)' }}
                        visible={this.state.examinePopupVisible}
                        children={[]}
                        onTouchOutside={this.toggleExaminePopup}
                        dialogAnimation={new ScaleAnimation({
                            initialValue: 0,
                            useNativeDriver: true,
                        })}
                        width={Dimensions.get("window").width * 0.90}
                        height={Dimensions.get("window").height * 0.90}
                    >
                        <DialogContent>
                            <View style={{ justifyContent: "center", alignItems: "center" }}>
                                <TouchableOpacity onPress={this.toggleExaminePopup}>
                                    {this.state.examinedCard && <FadeScaleImage
                                        source={{ uri: this.state.examinedCard["card_images"][0]["image_url"] }}
                                        resizeMode="contain"
                                        style={{
                                            height: Dimensions.get("window").height * 0.70,
                                            width: Dimensions.get("window").width * 0.70
                                        }}
                                    />}
                                </TouchableOpacity>
                            </View>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        visible={graveyardPopupVisible}
                        rounded={false}
                        children={[]}
                        onTouchOutside={this.toggleGraveyardPopup}
                        dialogAnimation={new SlideAnimation({
                            slideFrom: 'top',
                            useNativeDriver: true
                        })}
                        overlayBackgroundColor={this.state.overlayBackgroundColor}
                        overlayOpacity={this.state.popupOverlayOpacity}

                        top={0}
                        bottom={Dimensions.get("window").height * 0.10}
                        width={1.0}
                        height={0.9}
                        dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width, height: this.state.inDreamState ? Dimensions.get("window").height : Dimensions.get("window").height * 0.50, position: "absolute", top: 0 }}
                    >
                        <DialogContent style={{ width: Dimensions.get("window").width, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "transparent", height: Dimensions.get("window").height * 0.50, zIndex: 31 }}>
                            <View style={{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 32, backgroundColor: "transparent", height: Dimensions.get("window").height, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center" }} >
                                <FlatList
                                    data={(boardsRetrieved && this.state[thisBoard].requestingAccessToGraveyard.approved) ? thatGraveyard : thisGraveyard}
                                    renderItem={({ item }) => <DraggableCardInPopup storedCards={this.props.storedCards} location={"SendToGraveyard"} inDreamState={this.state.inDreamState} toggleGraveyardPopup={this.toggleGraveyardPopup} dispelInfiniteTsukuyomi={this.dispelInfiniteTsukuyomi} createInfiniteTsukuyomi={this.createInfiniteTsukuyomi} manageCardInPopup={this.manageCardInPopup} clearPopupZoneBackgrounds={this.clearPopupZoneBackgrounds} popupZoneCoords={this.state.popupZoneCoords} item={item} toggleHandZone={this.toggleHandZone} coords={this.state.coords} dragBegin={dragBegin} presentHandOptions={this.presentHandOptions} examineCard={this.examineCard} dismissExaminePopup={() => this.setState({ examinePopupVisible: false })} highlightClosestZone={this.highlightClosestZone} clearZoneBackgrounds={this.clearZoneBackgrounds} />}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={{ height: Dimensions.get("window").height * 0.15, width: Dimensions.get("window").width }}
                                    contentContainerStyle={{ top: Dimensions.get("window").height * 0.25 }}
                                    horizontal={true}
                                />
                            </View>
                            <View style={{ height: Dimensions.get("window").height * 0.50, width: Dimensions.get("window").width, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: this.state.popupBackgroundColor, borderBottomRightRadius: 20, borderBottomLeftRadius: 20, opacity: this.state.popupOpacity }}>
                                <View style={{ height: Dimensions.get("window").height * 0.10, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderColor: this.state.popupFontColor, borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: this.state.popupFontColor, borderWidth: 1 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToBanishedZone0`] = view; }}>
                                    <Text style={{ color: this.state.popupFontColor }}>Send to Banished Zone</Text>
                                </View>
                                <View style={{ height: Dimensions.get("window").height * 0.10, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: this.state.popupFontColor, borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: this.state.popupFontColor, borderWidth: 1 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_MainDeckView0`] = view; }}>
                                    <Text style={{ color: this.state.popupFontColor }}>Send to Deck</Text>
                                </View>
                                <View style={{ height: Dimensions.get("window").height * 0.30, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "transparent", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToGraveyard0`] = view; }}>

                                </View>


                            </View>
                        </DialogContent>
                    </Dialog>



                    <Dialog
                        visible={(boardsRetrieved && this.state[thisBoard].requestingAccessToGraveyard.approved)}
                        rounded={false}
                        children={[]}
                        onTouchOutside={this.toggleGraveyardPopup}
                        dialogAnimation={new SlideAnimation({
                            slideFrom: 'top',
                            useNativeDriver: true
                        })}
                        overlayBackgroundColor={this.state.overlayBackgroundColor}
                        overlayOpacity={this.state.popupOverlayOpacity}

                        top={0}
                        bottom={Dimensions.get("window").height * 0.10}
                        width={1.0}
                        height={0.9}
                        dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width, height: this.state.inDreamState ? Dimensions.get("window").height : Dimensions.get("window").height * 0.50, position: "absolute", top: 0 }}
                    >
                        <DialogContent style={{ width: Dimensions.get("window").width, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "transparent", height: Dimensions.get("window").height * 0.50, zIndex: 31 }}>
                            <View style={{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 32, backgroundColor: "transparent", height: Dimensions.get("window").height, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center" }} >
                                <FlatList
                                    data={(boardsRetrieved && this.state[thisBoard].requestingAccessToGraveyard.approved) && thatGraveyard}
                                    renderItem={({ item }) => <DraggableCardInPopup storedCards={this.props.storedCards} location={"SendToGraveyard"} inDreamState={this.state.inDreamState} toggleGraveyardPopup={this.toggleGraveyardPopup} dispelInfiniteTsukuyomi={this.dispelInfiniteTsukuyomi} createInfiniteTsukuyomi={this.createInfiniteTsukuyomi} manageCardInPopup={this.manageCardInPopup} clearPopupZoneBackgrounds={this.clearPopupZoneBackgrounds} popupZoneCoords={this.state.popupZoneCoords} item={item} toggleHandZone={this.toggleHandZone} coords={this.state.coords} dragBegin={dragBegin} presentHandOptions={this.presentHandOptions} examineCard={this.examineCard} dismissExaminePopup={() => this.setState({ examinePopupVisible: false })} highlightClosestZone={this.highlightClosestZone} clearZoneBackgrounds={this.clearZoneBackgrounds} />}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={{ height: Dimensions.get("window").height * 0.15, width: Dimensions.get("window").width }}
                                    contentContainerStyle={{ top: Dimensions.get("window").height * 0.25 }}
                                    horizontal={true}
                                />
                            </View>
                            <View style={{ height: Dimensions.get("window").height * 0.50, width: Dimensions.get("window").width, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: this.state.popupBackgroundColor, borderBottomRightRadius: 20, borderBottomLeftRadius: 20, opacity: this.state.popupOpacity }}>
                                <View style={{ height: Dimensions.get("window").height * 0.10, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderColor: this.state.popupFontColor, borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: this.state.popupFontColor, borderWidth: 1 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToBanishedZone0`] = view; }}>
                                    <Text style={{ color: this.state.popupFontColor }}>Send to Banished Zone</Text>
                                </View>
                                <View style={{ height: 0, width: 0 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_MainDeckView0`] = view; }}>
                                </View>
                                <View style={{ height: Dimensions.get("window").height * 0.40, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "transparent", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToGraveyard0`] = view; }}>

                                </View>


                            </View>
                        </DialogContent>
                    </Dialog>




                    <Dialog
                        visible={banishedZonePopupVisible}
                        children={[]}
                        onTouchOutside={this.toggleBanishedZonePopup}
                        dialogAnimation={new SlideAnimation({
                            slideFrom: 'top',
                            useNativeDriver: true
                        })}
                        rounded={false}
                        overlayBackgroundColor={overlayBackgroundColor}
                        overlayOpacity={popupOverlayOpacity}

                        top={0}
                        bottom={Dimensions.get("window").height * 0.10}
                        width={1.0}
                        height={0.9}
                        dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width, height: this.state.inDreamState ? Dimensions.get("window").height : Dimensions.get("window").height * 0.50, position: "absolute", top: 0 }}
                    >
                        <DialogContent style={{ width: Dimensions.get("window").width, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "transparent", height: Dimensions.get("window").height * 0.50, zIndex: 31 }}>
                            <View style={{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 32, backgroundColor: "transparent", height: Dimensions.get("window").height, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center" }} >
                                <FlatList
                                    data={thisBanishedZone}
                                    renderItem={({ item }) => <DraggableCardInPopup storedCards={this.props.storedCards} location={"SendToBanishedZone"} inDreamState={this.state.inDreamState} toggleBanishedZonePopup={this.toggleBanishedZonePopup} dispelInfiniteTsukuyomi={this.dispelInfiniteTsukuyomi} createInfiniteTsukuyomi={this.createInfiniteTsukuyomi} manageCardInPopup={this.manageCardInPopup} clearPopupZoneBackgrounds={this.clearPopupZoneBackgrounds} popupZoneCoords={this.state.popupZoneCoords} item={item} toggleHandZone={this.toggleHandZone} coords={this.state.coords} dragBegin={dragBegin} presentHandOptions={this.presentHandOptions} examineCard={this.examineCard} dismissExaminePopup={() => this.setState({ examinePopupVisible: false })} highlightClosestZone={this.highlightClosestZone} clearZoneBackgrounds={this.clearZoneBackgrounds} />}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={{ height: Dimensions.get("window").height * 0.15, width: Dimensions.get("window").width }}
                                    contentContainerStyle={{ top: Dimensions.get("window").height * 0.25 }}
                                    horizontal={true}
                                />
                            </View>
                            <View style={{ height: Dimensions.get("window").height * 0.50, width: Dimensions.get("window").width, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: this.state.popupBackgroundColor, borderBottomRightRadius: 20, borderBottomLeftRadius: 20, opacity: this.state.popupOpacity }}>
                                <View style={{ height: Dimensions.get("window").height * 0.10, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderColor: this.state.popupFontColor, borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: this.state.popupFontColor, borderWidth: 1 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_MainDeckView0`] = view; }}>
                                    <Text style={{ color: this.state.popupFontColor }}>Send to Deck</Text>
                                </View>
                                <View style={{ height: Dimensions.get("window").height * 0.10, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: this.state.popupFontColor, borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: this.state.popupFontColor, borderWidth: 1 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToGraveyard0`] = view; }}>
                                    <Text style={{ color: this.state.popupFontColor }}>Send to Graveyard</Text>
                                </View>
                                <View style={{ height: Dimensions.get("window").height * 0.30, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "transparent", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToBanishedZone0`] = view; }}>
                                </View>
                            </View>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        visible={mainDeckPopupVisible}
                        children={[]}
                        onTouchOutside={this.toggleMainDeckPopup}
                        dialogAnimation={new SlideAnimation({
                            slideFrom: 'top',
                            useNativeDriver: true
                        })}
                        rounded={false}
                        overlayBackgroundColor={this.state.overlayBackgroundColor}
                        overlayOpacity={this.state.popupOverlayOpacity}

                        top={0}
                        bottom={Dimensions.get("window").height * 0.10}
                        width={1.0}
                        height={0.9}
                        dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width, height: this.state.inDreamState ? Dimensions.get("window").height : Dimensions.get("window").height * 0.50, position: "absolute", top: 0 }}
                    >
                        <DialogContent style={{ width: Dimensions.get("window").width, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "transparent", height: Dimensions.get("window").height * 0.50, zIndex: 31 }}>
                            <View style={{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 32, backgroundColor: "transparent", height: Dimensions.get("window").height, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center" }} >
                                <FlatList
                                    data={mainDeck}
                                    renderItem={({ item }) => <DraggableCardInPopup storedCards={this.props.storedCards} location={"MainDeckView"} inDreamState={this.state.inDreamState} toggleMainDeckPopup={this.toggleMainDeckPopup} dispelInfiniteTsukuyomi={this.dispelInfiniteTsukuyomi} createInfiniteTsukuyomi={this.createInfiniteTsukuyomi} manageCardInPopup={this.manageCardInPopup} clearPopupZoneBackgrounds={this.clearPopupZoneBackgrounds} popupZoneCoords={this.state.popupZoneCoords} item={item} toggleHandZone={this.toggleHandZone} coords={this.state.coords} dragBegin={dragBegin} presentHandOptions={this.presentHandOptions} examineCard={this.examineCard} dismissExaminePopup={() => this.setState({ examinePopupVisible: false })} highlightClosestZone={this.highlightClosestZone} clearZoneBackgrounds={this.clearZoneBackgrounds} />}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={{ height: Dimensions.get("window").height * 0.15, width: Dimensions.get("window").width }}
                                    contentContainerStyle={{ top: Dimensions.get("window").height * 0.25 }}
                                    horizontal={true}
                                />

                            </View>
                            <View style={{ height: Dimensions.get("window").height * 0.50, width: Dimensions.get("window").width, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: this.state.popupBackgroundColor, borderBottomRightRadius: 20, borderBottomLeftRadius: 20, opacity: this.state.popupOpacity }}>
                                <View style={{ height: Dimensions.get("window").height * 0.10, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderColor: this.state.popupFontColor, borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: this.state.popupFontColor, borderWidth: 1 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToBanishedZone0`] = view; }}>
                                    <Text style={{ color: this.state.popupFontColor }}>Send to Banished Zone</Text>
                                </View>
                                <View style={{ height: Dimensions.get("window").height * 0.10, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: this.state.popupFontColor, borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: this.state.popupFontColor, borderWidth: 1 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_SendToGraveyard0`] = view; }}>
                                    <Text style={{ color: this.state.popupFontColor }}>Send to Graveyard</Text>
                                </View>
                                <View style={{ height: Dimensions.get("window").height * 0.30, width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "transparent", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} onLayout={(event) => { this.storePopupZoneLocations(event) }} collapsable={false} ref={view => { this[`_MainDeckView0`] = view; }}>

                                </View>

                            </View>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        visible={boardsRetrieved ? this.state[this.state.thisBoard].requestingAccessToGraveyard.popupVisible : false}
                        children={[]}
                        onTouchOutside={this.dismissRequestAccessToGraveyard}
                        dialogAnimation={new SlideAnimation({
                            slideFrom: 'top',
                            useNativeDriver: true
                        })}
                        // overlayOpacity={0}
                        dialogStyle={{ position: "absolute", width: "100%", height: "20%", top: Dimensions.get("window").width * 0.02, backgroundColor: "transparent" }}>
                        <DialogContent style={{ width: "100%", height: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "rgb(255, 255, 255)", top: 0, backgroundColor: "transparent" }}>
                            <RequestAccessToOpponentGraveyardPopup dismissRequestAccessToGraveyard={this.dismissRequestAccessToGraveyard} approveAccessToGraveyard={this.approveAccessToGraveyard} opponent={this.state.opponent} host={this.state.host} user={this.props.user.username} />
                        </DialogContent>
                    </Dialog>
                </View>
            </SideMenu >
        )
    }
}

const styles = StyleSheet.create({
    viewStyles: {
        height: Dimensions.get("window").height / 12, //10.5
        width: Dimensions.get("window").width / 7.1,
        borderColor: "black",
        borderRadius: 10,
        borderWidth: 1
    },
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
    const { user, cards, selectedDeck, preferences, storedCards } = state
    return { user, cards, selectedDeck, preferences, storedCards }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        createUser,
        updateSelectedDeck
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DraggableDuelingRoomPage);