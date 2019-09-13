import React, { Component } from 'react';
import { TouchableOpacity, Alert, View, Image, Dimensions, StyleSheet, Text, Animated, TextInput, TouchableWithoutFeedback, Keyboard, LayoutAnimation, DeviceEventEmitter, ActivityIndicator, SectionList, Button } from "react-native"
import CoverFlow from 'react-native-coverflow';
import { functions } from "../Firebase/Fire"
import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrieveCardsFromDeck, addCardsToDeck, deleteCard, removeCardsFromDeck } from "../Firebase/FireMethods"
import { FadeScaleImage, SwipeableRow, ShakingImage } from './ComplexComponents';
import CARDS from "./cards.js"
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';
import KeyboardSpacer from 'react-native-keyboard-spacer';
// import Icon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable'
import Icon from 'react-native-vector-icons/Feather'
const AnimatedIcon = Animatable.createAnimatableComponent(Icon)

import ExaminePopupContent from "./ExaminePopupContents"
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
            overviewPopupVisible: false,
            quantities: { monstersQuant: 0, spellsQuant: 0, trapsQuant: 0 },
            shaking: false,
            searchPopupVisible: false,

        }
    }


    componentDidMount = () => {
        this.refreshCards()
    }
    animateIcon = () => {
        this.largeAnimatedIcon.stopAnimation()
        this.largeAnimatedIcon.bounceIn()
            .then(() => this.largeAnimatedIcon.bounceOut())
    }




    refreshCards = async () => {
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
        this.animateIcon()
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
    presentImage = () => {

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
                <Animated.View style={{ width: size * 0.90, height: 100, backgroundColor: "transparent", borderRadius: 10 }}>
                    <TouchableOpacity style={{ width: size * 0.90, height: 100, flexDirection: "row", justifyContent: "center", alignItems: "flex-end", zIndex: 4, opacity: 1 }} onLongPress={this.toggleDeleteMode} onPress={() => this.expandCard(item)}>
                        {item["card_images"] && <ShakingImage presentImage={this.presentImage} storedCards={this.props.storedCards} deleteCard={this.deleteCard} item={item} shaking={this.state.shaking} source={item["card_images"][0]["image_url_small"]} style={{
                            width: size * 0.90, height: 100
                        }} />}
                    </TouchableOpacity>
                </Animated.View>

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
                <TouchableWithoutFeedback disabled={!exists} onPress={() => exists && this.addCard(this.state.cards[card])} key={card}>
                    <FadeScaleImage
                        key={card}
                        source={exists ? { uri: this.state.cards[card]["card_images"][0]["image_url"] } : CARDS[card]}
                        resizeMode="contain"
                        style={{
                            height: "90%",
                            width: Dimensions.get("window").width * 0.60
                        }}
                    />
                </TouchableWithoutFeedback>
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
                    width={1.0}
                    height={0.80}

                    dialogAnimation={new SlideAnimation({
                        slideFrom: 'bottom',
                        useNativeDriver: true
                    })}
                    dialogStyle={{ position: 'absolute', bottom: 0 }}

                    onTouchOutside={() => {
                        this.setState({ searchPopupVisible: false })
                        this.props.navigation.setParams({ requestingSearch: false, type: "" });
                    }}
                >
                    <DialogContent style={{ flex: 1 }}>
                        <AnimatedIcon
                            ref={v => this.largeAnimatedIcon = v}
                            name="check-circle"
                            color={"rgb(130, 69, 91)"}
                            size={150}
                            style={{ position: "absolute", zIndex: 5, left: Dimensions.get("window").width / 2 - 75, top: Dimensions.get("window").height * 0.60 / 2 - 75, opacity: 0 }}
                            duration={500}
                            delay={200}
                        />

                        {!this.state.loading ? <CoverFlow
                            style={{ flex: 1 }}
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


                        {/* <View style={{ flex: 1 / 10 }}> */}
                        <View style={{ ...styles.deckSearchContainer, marginBottom: 5 }}>
                            <TextInput placeholderTextColor={"black"} placeholder={"Search..."} style={styles.deckSearchTextInput} onChangeText={(search) => this.setState({ search })} onSubmitEditing={this.onSubmit} onFocus={this.resetViewsToDefault} returnKeyType={"search"} autoCorrect={false} autoCapitalize={"none"} />
                            <FadeScaleImage source={require("../assets/searchIcon.png")} style={styles.searchIcon} />
                        </View>
                        <KeyboardSpacer />
                        {/* </View> */}
                    </DialogContent>
                </Dialog>
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
                        <ExaminePopupContent dismissExaminePopup={() => this.setState({ popUpVisible: false })} selectedCard={this.state.selectedCard} selectedCard={this.state.selectedCard} />
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
        // top: 94,
        justifyContent: "center",
        // zIndex: 10,
        alignSelf: "center"
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
