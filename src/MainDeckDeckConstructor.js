import React, { Component } from 'react';
import { TouchableOpacity, Alert, View, Image, Dimensions, StyleSheet, Text, Animated, TextInput, TouchableWithoutFeedback, Keyboard, LayoutAnimation, DeviceEventEmitter, ActivityIndicator, SectionList } from "react-native"
import CoverFlow from 'react-native-coverflow';
import { functions } from "../Firebase/Fire"
import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrieveCardsFromDeck, addCardsToDeck, deleteCard, removeCardsFromDeck } from "../Firebase/FireMethods"
import { FadeScaleImage, SwipeableRow, ShakingImage } from './ComplexComponents';
import CARDS from "./cards.js"
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';


class MainDeckDeckConstructor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: "",
            cards: {},
            mainDeck: [],
            monsters: [],
            spells: [],
            traps: [],
            extraDeck: [],
            refreshing: false,
            extraDeckCardsVisible: false,
            selectedDeck: "",
            visible: false,
            cardType: "Open",
            popUpVisible: false,
            selectedCard: "",
            expanded: false,
            loading: false,
            deckRetrieved: false,
            overviewPopupVisible: false,
            quantities: { monstersQuant: 0, spellsQuant: 0, trapsQuant: 0 },
            shaking: false,
            searchPopupVisible: false
        }
    }


    componentDidMount = async () => {
        await this.refreshCards()
        await setTimeout(() => {
            this.setState({ deckRetrieved: true })
        }, 3000)
    }



    refreshCards = async () => {
        // const { mainDeck } = await retrieveCardsFromDeck({ username: "YOHO", deck: "Frog" })

        const { mainDeck } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        let monsters = []
        let spells = []
        let traps = []
        let monstersQuant = 0
        let spellsQuant = 0
        let trapsQuant = 0
        for (let card of mainDeck) {
            if (card.type.includes("Monster")) {
                monsters.push(card)
                monstersQuant += card.quantity
            }
            else if (card.type.includes("Spell")) {
                spells.push(card)
                spellsQuant += card.quantity
            }
            else if (card.type.includes("Trap")) {
                traps.push(card)
                trapsQuant += card.quantity
            }
        }
        this.setState({ selectedDeck: this.props.selectedDeck, monsters, spells, traps, refreshing: false, quantities: { monstersQuant, spellsQuant, trapsQuant } })
    }

    search = async (cardName) => {
        this.setState({ loading: true })
        try {
            console.log("type,(1) ", this.state.cardType)
            console.log("type, (2)", this.props.navigation.state.params.type)


            const { data } = await functions.httpsCallable("searchResults")({ name: cardName, type: this.props.navigation.state.params.type })
            data && this.setState({ cards: data })
        } catch (err) {
            console.error(err)
        }
        this.setState({ loading: false })
    }
    expandCard = async (cardInfo) => {
        this.setState({ selectedCard: cardInfo, popUpVisible: true })
    }
    addCard = async (card) => {
        await addCardsToDeck({ username: this.props.user.username, deck: this.props.selectedDeck, card })
        await this.refreshCards()
    }

    onSubmit = async () => {
        if (this.state.search !== "") {
            await this.search(this.state.search)
        }
    }
    deleteCard = async (card) => {
        await deleteCard({ username: this.props.user.username, deck: this.state.selectedDeck, card })
        await this.refreshCards()
    }
    updateCardQuantity = async (obj) => {
        console.log("inside updateCardQuant, here's what we're passing through", obj)
        if (obj.value > obj.card.quantity) {
            await addCardsToDeck({ ...obj, val: obj.value })
        } else if (obj.value < obj.card.quantity) {
            await removeCardsFromDeck({ ...obj, val: obj.value })
        }
        this.refreshCards()
    }
    switchDisplayedDeck = () => {
        this.setState({ extraDeckCardsVisible: !this.state.extraDeckCardsVisible })
    }

    goHome = async () => {
        try {
            const enableAudio = this.props.navigation.getParam('enableAudio', 'NO-ID');
            if (this.props.preferences.musicEnabled) {
                await enableAudio()
            }

            // Your sound is playing!
        } catch (error) {

            // An error occurred!
        }
        this.props.navigation.navigate("HomePage")
    }
    toggleDeleteMode = () => {
        this.setState({ shaking: !this.state.shaking })
    }
    renderSubItem = ({ item }) => {
        const size = Dimensions.get('window').width / 6
        return (
            <View style={{
                width: size,
                height: 100,
                marginTop: 30,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}>
                <View style={{ width: size, height: 100 }}>
                    <TouchableOpacity style={{ width: size * 0.90, height: 100, flexDirection: "row", justifyContent: "center", alignItems: "flex-end", zIndex: 4 }} onLongPress={this.toggleDeleteMode} onPress={() => this.expandCard(item)}>
                        {item["card_images"] && <ShakingImage deleteCard={this.deleteCard} item={item} shaking={this.state.shaking} source={{ uri: item["card_images"][0]["image_url_small"] }} resizeMode={"contain"} style={{
                            width: size * 0.90, height: 100
                        }} />}
                    </TouchableOpacity>
                </View>

            </View>
        )


    }
    renderItem = (item) => {
        return (
            <FlatList
                data={item}
                numColumns={6}
                keyExtractor={(item) => `${item.id}`}
                renderItem={this.renderSubItem}
                contentContainerStyle={{
                    justifyContent: "flex-start"
                }}
            />
        )
    };
    handleRefresh = () => {
        this.setState({
            refreshing: true,
        }, () => {
            this.refreshCards()
        })
    }
    componentDidUpdate(prevProps) {

        if (this.props.navigation.state.params && this.props.navigation.state.params.requestingSearch && !this.state.searchPopupVisible) {
            this.setState({ searchPopupVisible: true, cardType: this.props.navigation.state.params.type, shaking: false })
        }
    }

    getCards() {
        const res = [];
        const exists = Object.keys(this.state.cards).length
        const keys = exists ? Object.keys(this.state.cards) : Object.keys(CARDS)
        for (let i = 0; i < keys.length; i++) {
            const card = keys[i];
            res.push(
                <TouchableOpacity disabled={!exists} onPress={() => exists && this.addCard(this.state.cards[card])} key={card}>
                    <FadeScaleImage
                        key={card}
                        source={exists ? { uri: this.state.cards[card]["card_images"][0]["image_url"] } : CARDS[card]}

                        resizeMode="contain"
                        style={{
                            height: "90%",
                            width: Dimensions.get("window").width * 0.60
                        }}
                    />
                </TouchableOpacity>
            )
        }
        return res;
    }
    render() {
        return (
            <View style={styles.container}>
                <FadeScaleImage resizeMode={"contain"} source={require("../assets/yugiohGif.gif")} style={{ width: Dimensions.get("window").width * 1.1, zIndex: 0, position: "absolute", left: 0, right: 0, bottom: 0 }} />

                <Text style={{
                    fontWeight: "800",
                    fontSize: 25,
                    backgroundColor: "transparent",
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                }}>{this.props.selectedDeck}</Text>
                <Text style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: "transparent",
                    fontWeight: "800",
                    fontSize: 20,
                    backgroundColor: "#FFF"
                }}>Main Deck: {this.state.quantities.monstersQuant + this.state.quantities.spellsQuant + this.state.quantities.trapsQuant} cards</Text>

                <SectionList
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                    renderItem={({ item }) => this.renderItem(item)}
                    stickySectionHeadersEnabled={false}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={{
                            paddingVertical: 10,
                            fontWeight: "800",
                            fontSize: 20,
                            paddingHorizontal: 20,
                            backgroundColor: "transparent"
                        }}>{title}: {this.state.quantities[`${title.toLowerCase()}Quant`]} cards</Text>
                    )}
                    sections={[
                        { title: 'Monsters', data: [this.state.monsters] },
                        { title: 'Spells', data: [this.state.spells] },
                        { title: 'Traps', data: [this.state.traps] },
                    ]}
                    keyExtractor={(item, index) => item + index}
                    contentContainerStyle={{
                        justifyContent: "flex-start"
                    }}
                />
                <Dialog
                    visible={this.state.searchPopupVisible}
                    width={0.90}
                    height={0.90}

                    dialogAnimation={new ScaleAnimation({
                        initialValue: 0, // optional
                        useNativeDriver: true, // optional
                    })}
                    onTouchOutside={() => {
                        this.setState({ searchPopupVisible: false })
                        this.props.navigation.setParams({ requestingSearch: false, type: "" });
                    }}
                >
                    <DialogContent style={{ flex: 1 }}>
                        {!this.state.loading ? <CoverFlow
                            style={{ flex: 6 / 10 }}
                            onChange={() => true}
                            spacing={100}
                            wingSpan={80}
                            rotation={50}
                            midRotation={50}
                            scaleDown={0.8}
                            scaleFurther={0.75}
                            perspective={800}
                            initialSelection={0}
                        >
                            {this.getCards()}
                        </CoverFlow> : <ActivityIndicator color={"rgb(130, 69, 91)"} size={"large"} style={{ flex: 1 }} />}


                        <View style={{ flex: 4 / 10 }}>
                            <View style={{ ...styles.deckSearchContainer, marginBottom: 15 }}>
                                <TextInput placeholderTextColor={"black"} placeholder={"Search..."} style={styles.deckSearchTextInput} onChangeText={(search) => this.setState({ search })} onSubmitEditing={this.onSubmit} onFocus={this.resetViewsToDefault} returnKeyType={"search"} autoCorrect={false} autoCapitalize={"none"} />
                                <FadeScaleImage source={require("../assets/searchIcon.png")} style={styles.searchIcon} />
                            </View>
                        </View>
                    </DialogContent>
                </Dialog>
                <Dialog
                    visible={this.state.popUpVisible}
                    width={0.90}
                    height={0.90}

                    dialogAnimation={new ScaleAnimation({
                        initialValue: 0, // optional
                        useNativeDriver: true, // optional
                    })}
                    onTouchOutside={() => {
                        this.setState({ popUpVisible: false })
                    }}
                >
                    <DialogContent style={{ flex: 1 }}>
                        <View style={{ flex: 8 / 10 }}>
                            {this.state.selectedCard && <FadeScaleImage resizeMode={"contain"} source={{ uri: this.state.selectedCard.card_images[0].image_url }} style={{ width: "100%", height: "100%" }} />}
                        </View>
                        <View style={{ flex: 2 / 10, justifyContent: "center", alignItems: "center" }}>
                            <Text style={{
                                fontWeight: "800",
                                fontSize: 25,
                                backgroundColor: "transparent",
                                paddingHorizontal: 20,
                                paddingVertical: 20,
                            }}>Quantity</Text>
                            <FlatList
                                data={[1, 2, 3]}
                                horizontal={true}
                                contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                                style={{ flex: 1, width: "100%" }}
                                keyExtractor={(item) => `${item}`}
                                renderItem={({ item, index }) => {
                                    let selectedCard = this.state.selectedCard
                                    let maxQuant = 3
                                    if ('banlist_info' in selectedCard) {
                                        if (selectedCard["banlist_info"]["ban_tcg"] == "Limited") {
                                            maxQuant = 1
                                        } else if (selectedCard["banlist_info"]["ban_tcg"] == "Semi-Limited") {
                                            maxQuant = 2
                                        }
                                    }
                                    return index + 1 <= maxQuant && (<TouchableOpacity style={{ width: 80, height: 40, borderRadius: 10, borderColor: "black", borderWidth: 2, justifyContent: "center", alignItems: "center", margin: 10, backgroundColor: index + 1 == selectedCard.quantity ? "black" : "white" }} onPress={() => {
                                        this.updateCardQuantity({ value: item, card: selectedCard, username: this.props.user.username, deck: this.props.selectedDeck })
                                        selectedCard.quantity = item

                                    }}>
                                        <Text style={{ fontSize: 30, color: index + 1 == selectedCard.quantity ? "white" : "black" }}>{item}</Text>
                                    </TouchableOpacity>)
                                }}
                            />
                        </View>
                    </DialogContent>
                </Dialog>
            </View >
        );
    }
}



const mapStateToProps = (state) => {
    const { user, cards, selectedDeck, preferences } = state
    return { user, cards, selectedDeck, preferences }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MainDeckDeckConstructor);

const styles = StyleSheet.create({
    deckSearchTextInput: {
        alignItems: "center",
        left: 6,
        color: "#6F8FA9"
    },
    deckSearchContainer: {
        shadowColor: 'black',
        backgroundColor: "#FFF",
        shadowOffset: { height: 5, width: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        borderRadius: 5,
        width: "95%",
        height: 41,
        alignSelf: "center",
        // top: 94,
        justifyContent: "center",
        // zIndex: 10,
    },

    item: {
        width: 64 * 2.5,
        height: 90 * 2.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
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
        marginBottom: 49
    },
    listItem: {
        height: 75,
        flexDirection: "row",
        justifyContent: 'flex-start',
        alignItems: "center",
        flex: 1

    },
    leftSwipeItem: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 20
    },
    rightSwipeItem: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 20
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
    searchIcon: {
        position: "absolute",
        height: 13,
        width: 13,
        right: 10,
    }
});