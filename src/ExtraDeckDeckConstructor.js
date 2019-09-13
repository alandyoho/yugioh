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
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';
import ExaminePopupContent from "./ExaminePopupContents"

class ExtraDeckDeckConstructor extends Component {
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
            quantities: { monstersQuant: 0 },
            shaking: false
        }
    }


    componentDidMount = async () => {
        console.log("beansssss", this.props.storedCards)

        await this.refreshCards()
        await setTimeout(() => {
            this.setState({ deckRetrieved: true })
        }, 3000)
    }



    refreshCards = async () => {

        const { extraDeck } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        let monsters = extraDeck

        let monstersQuant = 0

        for (let card of extraDeck) {
            monstersQuant += card.quantity
        }
        this.setState({ selectedDeck: this.props.selectedDeck, monsters, refreshing: false, quantities: { monstersQuant } })
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
                        {item["card_images"] && <ShakingImage storedCards={this.props.storedCards} deleteCard={this.deleteCard} item={item} shaking={this.state.shaking} source={item["card_images"][0]["image_url_small"]} resizeMode={"contain"} style={{
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
                <FadeScaleImage resizeMode={"contain"} source={require("../assets/yugiohGif.gif")} style={{ width: Dimensions.get("window").width * 1.1, zIndex: 0, position: "absolute", left: 0, right: 0, bottom: 0 }} />
                <Text style={{
                    fontWeight: "800",
                    fontSize: 25,
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                    backgroundColor: "transparent"
                }}>{this.props.selectedDeck}</Text>
                <SectionList
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                    renderItem={({ item }) => this.renderItem(item)}
                    stickySectionHeadersEnabled={false}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            backgroundColor: "transparent",
                            fontWeight: "800",
                            fontSize: 20,
                            backgroundColor: "#FFF"
                        }}>{title}: {this.state.quantities.monstersQuant} cards</Text>
                    )}
                    sections={[
                        { title: 'Extra Deck', data: [this.state.monsters] },
                    ]}
                    keyExtractor={(item, index) => item + index}
                    contentContainerStyle={{
                        justifyContent: "flex-start"
                    }}
                />
                <Dialog
                    visible={this.state.popUpVisible}
                    width={1.0}
                    height={0.80}

                    dialogAnimation={new SlideAnimation({
                        slideFrom: 'bottom',
                        useNativeDriver: true
                    })}
                    dialogStyle={{ position: 'absolute', bottom: 0 }}
                    onTouchOutside={() => {
                        this.setState({ popUpVisible: false })
                    }}
                >
                    <DialogContent style={{ flex: 1 }}>
                        <ExaminePopupContent updateCardQuantity={this.updateCardQuantity} dismissExaminePopup={() => this.setState({ popUpVisible: false })} selectedCard={this.state.selectedCard} selectedCard={this.state.selectedCard} user={this.props.user} selectedDeck={this.props.selectedDeck} />

                    </DialogContent>
                </Dialog>
            </View >
        );
    }
}



const mapStateToProps = (state) => {
    const { user, cards, selectedDeck, preferences, storedCards } = state
    return { user, cards, selectedDeck, preferences, storedCards }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ExtraDeckDeckConstructor);

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
