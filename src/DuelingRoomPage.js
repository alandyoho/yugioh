import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import { updateSelectedDeck } from "./actions"
import { retrieveCardsFromDeck, retrieveDeckInfo, leaveDuel, addCardToBoard } from "../Firebase/FireMethods"
import { firestore } from "../Firebase/Fire"
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import GameLogic from "./GameLogic"
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';
import CARDS from "./cards"
import DraggableCards from "./DraggableCards";

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
            cardOptionsPresented: {},
            handZIndex: 0,
            handOpacity: new Animated.Value(1),
            boardsRetrieved: false
        }
    }
    async componentDidMount() {
        this.setState({ waitingForOpponentPopupVisible: true })
        const { hostedBy, hosting } = await retrieveDeckInfo(this.props.user.username)
        this.listenForGameChanges({ hostedBy: hostedBy, hosting: hosting })
    }
    fadeOutHand = () => {
        Animated.timing(this.state.handOpacity, { toValue: 0, useNativeDriver: true, }).start();
        this.setState({ handZIndex: -1, cardPopupVisible: false })
    }
    fadeInHand = () => {
        Animated.timing(this.state.handOpacity, { toValue: 1, useNativeDriver: true, }).start();
        this.setState({ handZIndex: 1 })
    }


    listenForGameChanges = (obj) => {
        console.log("hosted username", obj.hostedBy)
        if (obj.hostedBy == "") {
            obj.hostedBy = this.props.user.username
        }
        this.setState({ hosting: obj.hosting, hostedBy: obj.hostedBy })
        firestore.collection("rooms").doc(obj.hostedBy)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const { guestBoard, hostBoard, opponent } = doc.data()

                    this.setState({ guestBoard, hostBoard, opponent, boardsRetrieved: true })

                    if (this.state.opponent != "" && this.state.waitingForOpponentPopupVisible == true) {
                        this.setState({ waitingForOpponentPopupVisible: false })
                        this.initialDraw()
                    }
                }
            })
    }
    addCardToBoard = async (location) => {
        const { cardOptionsPresented } = this.state
        const board = location[0]
        const cardZone = location[1]
        const cardZoneIndex = location[2]
        if ((cardZone == "st" && cardOptionsPresented.type.includes("Monster")) || (cardZone == "m1" && cardOptionsPresented.type.includes("Spell"))) {
            this.fadeInHand()
            return
        }
        let boardCopy = { ...this.state[board] }
        boardCopy[cardZone][cardZoneIndex] = { card: cardOptionsPresented, exists: true }
        this.setState({ [board]: boardCopy, hand: [...this.state.hand.filter(card => card.id != cardOptionsPresented.id)] })
        this.fadeInHand()
        console.log("hosting? ", this.state.hosting)
        await addCardToBoard({ location, zone: boardCopy[cardZone], hostUsername: this.state.hostedBy })
    }
    initialDraw = async () => {
        const { cards } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        //set the state with shuffled retrieved cards and selected deck
        this.setState({ selectedDeck: this.props.selectedDeck, cards: GameLogic.shared.shuffleDeck(cards) })
        //set the state with five cards 
        this.setState({ hand: GameLogic.shared.initialDraw(this.state.cards) })
    }
    drawCard = async () => {
        this.setState({ hand: [...this.state.hand, GameLogic.shared.drawCard(this.state.cards)] })
    }
    leaveDuel = () => {
        leaveDuel(this.props.user.username)
        this.props.navigation.navigate("HomePage")
    }
    presentCardOptions = (card) => {
        this.setState({ cardPopupVisible: true, cardOptionsPresented: card })
    }
    summonMonster = () => {
        this.fadeInHand()
        //find s
    }
    renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={{ width: 100, height: 200 }} onPress={() => this.presentCardOptions(item)}>
                <Image source={{ uri: item["card_images"][0]["image_url"] }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} style={{
                    width: 100, height: 200
                }} />
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
    render() {
        const properBoard = this.state.hosting ? "hostBoard" : "guestBoard"
        const opponentBoard = this.state.hosting ? "guestBoard" : "hostBoard"
        return (
            <View style={styles.container}>
                <FlatList
                    data={[1, 2, 3, 4, 5, 6]}
                    renderItem={this.renderOpponentHand}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal={true}
                    scrollEnabled={false}
                    style={{
                        position: "absolute", top: -80, left: 0, right: 0, zIndex: 5, transform: [{ rotate: '180deg' }]
                    }}
                />
                <View style={{ flex: 2 / 20 }}>
                </View>
                <View style={{ flex: 6 / 20, flexDirection: "column", alignItems: "center", justifyContent: "flex-start", transform: [{ rotate: '180deg' }] }}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null }}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null }}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null }}>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }} >
                        </TouchableOpacity>
                        {[1, 2, 3, 4, 5].map(cardIndex => (
                            <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }} >
                                {this.state.boardsRetrieved && this.state[opponentBoard].m1[cardIndex].exists && <Image source={{ uri: this.state[opponentBoard].m1[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }} >
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                    </View>
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
                            width: Dimensions.get("window").width - 64,
                            height: 50,
                        }}
                        loading={false}
                        onPress={this.leaveDuel}
                    />

                </View>
                <View style={{ flex: 6 / 20, flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null }}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null }}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null }}>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }} >
                        </TouchableOpacity>
                        {[1, 2, 3, 4, 5].map(cardIndex => (
                            <TouchableOpacity key={cardIndex} style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }} onPress={() => this.addCardToBoard([properBoard, "m1", cardIndex])}>
                                {this.state.boardsRetrieved && this.state[properBoard].m1[cardIndex].exists && <Image source={{ uri: this.state[properBoard].m1[cardIndex]['card'].card_images[0].image_url_small }} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }} >
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 50, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 4 / 20 }}>
                </View>
                <Animated.View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "47%", opacity: this.state.handOpacity, zIndex: this.state.handZIndex, }}>
                    <FlatList
                        data={this.state.hand}
                        renderItem={(item) => this.renderItem(item)}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal={true}
                        contentContainerStyle={{ justifyContent: "center", alignItems: "flex-end" }}
                        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%" }}
                    />
                </Animated.View>
                <Dialog
                    visible={this.state.waitingForOpponentPopupVisible}
                    width={0.85}
                    height={0.40}
                    dialogAnimation={new ScaleAnimation({
                        initialValue: 0, // optional
                        useNativeDriver: true, // optional
                    })}
                >
                    <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                            <Text style={{ fontSize: 20, fontWeight: '800' }}>Waiting for opponent...</Text>
                            <Image source={require("../assets/yugi-loading.gif")} resizeMode="contain" />
                        </View>
                    </DialogContent>
                </Dialog>





                <Dialog
                    visible={this.state.cardPopupVisible}
                    width={0.40}
                    height={0.10}
                    dialogAnimation={new SlideAnimation({
                        slideFrom: 'bottom',
                    })}
                    onTouchOutside={() => {
                        this.setState({ cardPopupVisible: false });
                    }}
                    overlayOpacity={0}
                    dialogStyle={{ position: 'absolute', bottom: 180 }}
                >



                    <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                            <TouchableOpacity>
                                <Text>Examine</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.fadeOutHand}>
                                <Text>Normal Summon</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.fadeOutHand}>
                                <Text>Special Summon</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text>Set</Text>
                            </TouchableOpacity>
                        </View>
                    </DialogContent>
                </Dialog>
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
        // justifyContent: 'center',
        // alignItems: 'center'
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