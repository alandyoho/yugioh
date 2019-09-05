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


class DeckConstructorPage extends Component {
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
            cardWidth: Dimensions.get("window").width * 0.40,
            loading: false,
            deckRetrieved: false,
            overviewPopupVisible: false,
            quantities: { monstersQuant: 0, spellsQuant: 0, trapsQuant: 0 },
            shaking: false
        }
    }


    componentDidMount = async () => {

        await this.refreshCards()
        await setTimeout(() => {
            this.setState({ deckRetrieved: true })
        }, 3000)
    }



    refreshCards = async () => {
        const { mainDeck } = await retrieveCardsFromDeck({ username: "YOHO", deck: "Frog" })

        // const { mainDeck, extraDeck } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
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
            const { data } = await functions.httpsCallable("searchResults")({ name: cardName, type: this.state.cardType })
            data && this.setState({ cards: data })
        } catch (err) {
            console.error(err)
        }
        this.setState({ loading: false })
    }
    expandCard = async (cardInfo) => {
        this.setState({ selectedCard: cardInfo, popUpVisible: true })
    }
    addCard = async (cardInfo) => {
        this.setState({ popUpVisible: false })
        await addCardsToDeck({ username: this.props.user.username, deck: this.props.selectedDeck, card: cardInfo })
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
    activateDeleteMode = () => {
        this.setState({ shaking: true })
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
                    <TouchableOpacity style={{ width: size * 0.90, height: 100, flexDirection: "row", justifyContent: "center", alignItems: "flex-end", zIndex: 4 }} onLongPress={this.activateDeleteMode}>
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
                keyExtractor={(item, index) => item + index}
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
    render() {
        return (
            <View style={styles.container}>

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

export default connect(mapStateToProps, mapDispatchToProps)(DeckConstructorPage);

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
        width: "83%",
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
        marginBottom: 50
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
