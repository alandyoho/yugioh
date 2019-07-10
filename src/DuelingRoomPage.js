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
            waitingForOpponentPopupVisible: false,
            opponent: "",
            hosting: null,
            cardPopupVisible: false
        }
    }
    async componentDidMount() {
        // console.log("here's the width of the device", Dimensions.get("window").width / 5)
        this.setState({ waitingForOpponentPopupVisible: true })
        const { hostedBy } = await retrieveDeckInfo(this.props.user.username)

        this.listenForGameChanges(hostedBy)
    }

    listenForGameChanges = (hosted) => {
        //figure out host's username
        if (hosted == "") {
            hosted = this.props.user.username
            this.setState({ hosting: true })
        }
        firestore.collection("rooms").doc(hosted)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const { guestBoard, hostBoard, opponent } = doc.data()
                    console.log("data", doc.data())
                    this.setState({ guestBoard, hostBoard, opponent })
                    if (this.state.opponent != "") {
                        this.setState({ waitingForOpponentPopupVisible: false })
                        this.drawCards()
                    }
                }
            })
    }
    addCardToBoard = async (card) => {




        await addCardToBoard(card)

    }
    drawCards = async () => {
        const { cards } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        //set the state with shuffled retrieved cards and selected deck
        this.setState({ selectedDeck: this.props.selectedDeck, cards: GameLogic.shared.shuffleDeck(cards) })
        //set the state with five cards 
        this.setState({ hand: GameLogic.shared.initialDraw(this.state.cards) })
    }
    leaveDuel = () => {
        leaveDuel(this.props.user.username)
        this.props.navigation.navigate("HomePage")
    }
    presentCardOptions = (card) => {
        this.setState({ cardPopupVisible: true })

    }
    renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={{ width: 100, height: 200 }} onPress={item => this.presentCardOptions(item)}>
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
        return (
            <View style={styles.container}>
                <FlatList
                    data={[1, 2, 3, 4, 5, 6]}
                    renderItem={() => this.renderOpponentHand()}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal={true}
                    scrollEnabled={false}
                    style={{
                        position: "absolute", top: -40, left: 0, right: 0, zIndex: 5, transform: [{ rotate: '180deg' }]
                    }}

                />
                <View style={{ flex: 9 / 20 }}>
                    <Image resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} style={{ width: "100%", height: "100%" }} source={require("../assets/flippedField.png")} />
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

                <View style={{ flex: 9 / 20, flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                    </View><View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, width: 70, height: null, borderColor: 'rgb(130, 69, 91)', borderRadius: 10, borderWidth: 5 }}>
                            {/* <Image source={require("../assets/default_card.png")} resizeMode={"contain"} style={{ flex: 1, width: null, height: null }} /> */}
                        </TouchableOpacity>
                    </View>



                    {/* <Image resizeMode={"contain"} style={{flex: 1, width: null, height: null}} style={{ width: "100%", height: "100%" }} source={require("../assets/field.png")} /> */}
                </View>

                <FlatList
                    data={this.state.hand}
                    renderItem={(item) => this.renderItem(item)}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal={true}
                    contentContainerStyle={{ justifyContent: "center", alignItems: "flex-end" }}
                    style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%" }}
                />
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
                            <TouchableOpacity>
                                <Text>Normal Summon</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
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