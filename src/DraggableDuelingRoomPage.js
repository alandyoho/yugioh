import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated, ImageBackground } from 'react-native';
import FadeScaleImage from "./FadeScaleImage"
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import { updateSelectedDeck } from "./actions"
import { retrieveCardsFromDeck, retrieveDeckInfo, leaveDuel, alterBoard, doubleAlterBoard, requestAccessToGraveyard, dismissRequestAccessToGraveyard, approveAccessToGraveyard, updateLifePointsField, alterLinkZone } from "../Firebase/FireMethods"
import { firestore } from "../Firebase/Fire"
import { TouchableOpacity } from 'react-native-gesture-handler';
import GameLogic from "./GameLogic"
import CARDS from "./cards"

import DraggableCards from "./DraggableCards";
import { OpponentBoard, OpponentHand, RoomHostBoard, RoomHostHand, DuelingRoomDialogs } from "./DuelingRoomPageComponents"
import SwipeUpDown from 'react-native-swipe-up-down';
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
    renderItem = ({ item }) => {
        return (


            <DraggableCards item={item} />

        )
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0, zIndex: -10 }}>
                </View>
                <View style={{ flex: 2 / 20 }}>
                </View>
                <View style={{ flex: 6 / 20, flexDirection: "column", alignItems: "center", justifyContent: "flex-start", transform: [{ rotate: '180deg' }] }}>

                </View>

                <View style={{ flex: 2 / 20, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", transform: this.props.user.username === this.state.host ? [{ rotate: '180deg' }] : [{ rotate: "0deg" }] }}>
                    <TouchableOpacity style={{ width: Dimensions.get("window").width / 7, height: 75, borderColor: 'black', borderRadius: 10, borderWidth: 2 }} >

                    </TouchableOpacity>

                    <TouchableOpacity style={{ width: Dimensions.get("window").width / 7, height: 75, borderColor: 'black', borderRadius: 10, borderWidth: 2 }} >

                    </TouchableOpacity>

                </View>
                <View style={{ flex: 6 / 20, flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
                    <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", position: "absolute", top: 0, left: 10, backgroundColor: "#FFF", borderRadius: 10, borderRadius: 10, padding: 10 }}>

                    </View>
                    <RoomHostBoard />
                </View>
                <View style={{ flex: 4 / 20 }}>
                </View>
                <RoomHostHand hand={Object.keys(CARDS)} renderItem={this.renderItem} />

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