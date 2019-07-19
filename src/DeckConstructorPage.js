import React, { Component } from 'react';
// import { StyleSheet, Text, View, Image, Slider, Alert, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import { TouchableOpacity, Alert, View, Image, Dimensions, StyleSheet, Text, Animated, TextInput, TouchableWithoutFeedback, Keyboard, LayoutAnimation } from "react-native"

import CoverFlow from 'react-native-coverflow';
import { functions } from "../Firebase/Fire"
import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrieveCardsFromDeck, addCardsToDeck, deleteCard, removeCardsFromDeck } from "../Firebase/FireMethods"
import Swipeable from 'react-native-swipeable';
import SlidingUpPanel from 'rn-sliding-up-panel';
import MultiSwitch from './rn-slider-switch';
import CARDS from "./cards.js"
import Dialog, { DialogContent, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import NumericInput from 'react-native-numeric-input'
class DeckConstructorPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: "",
            cards: null,
            deckCards: [],
            selectedDeck: "",
            visible: false,
            cardType: "Open",
            popUpVisible: false,
            selectedCard: "",
            expanded: false,
            deckListView: {
                flex: 9 / 20,
                alignItems: "center",
                backgroundColor: "#FFF",
                justifyContent: "center"
            },
            searchResultsView: {
                flex: 11 / 20,
                backgroundColor: "#FFF"
            },
            cardWidth: Dimensions.get("window").width * 0.40
        }
    }
    componentDidMount = async () => {
        await this.refreshCards()
        console.log("cards", this.state.deckCards)
    }

    expandDeckCardsListView = () => {
        LayoutAnimation.configureNext({
            duration: 1500,
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
        if (this.state.deckListView.flex === 9 / 20) {
            this.setState({
                deckListView: {
                    flex: 1,
                    alignItems: "center",
                    backgroundColor: "#FFF"
                },
                searchResultsView: {
                    flex: 0,
                },
                expanded: true
            })
        } else if (this.state.deckListView.flex === 0) {
            this.setState({
                deckListView: {
                    flex: 9 / 20,
                    alignItems: "center",
                    backgroundColor: "#FFF"
                },
                searchResultsView: {
                    flex: 11 / 20,
                },
                expanded: true
            })
        }
    }
    resetViewsToDefault = () => {
        LayoutAnimation.configureNext({
            duration: 1500,
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
        this.setState({
            deckListView: {
                flex: 9 / 20,
                alignItems: "center",
                backgroundColor: "#FFF"
            },
            searchResultsView: {
                flex: 11 / 20,
                backgroundColor: "#FFF"
            },
            expanded: false,
            cardWidth: Dimensions.get("window").width * 0.40
        })
        // Keyboard.dismiss()
    }
    expandSearchCardsListView = () => {
        LayoutAnimation.configureNext({
            duration: 1500,
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
        if (this.state.searchResultsView.flex === 0) {
            this.setState({
                deckListView: {
                    flex: 9 / 20,
                    alignItems: "center",
                    backgroundColor: "#FFF"
                },
                searchResultsView: {
                    flex: 11 / 20,
                    backgroundColor: "#FFF"
                },
                expanded: false,
                cardWidth: Dimensions.get("window").width * 0.80
            })
        } else if (this.state.searchResultsView.flex === 11 / 20) {
            this.setState({
                deckListView: {
                    flex: 0,
                    alignItems: "center",
                    backgroundColor: "#FFF"
                },
                searchResultsView: {
                    flex: 1,
                    backgroundColor: "#FFF"
                },
                expanded: false,
                cardWidth: Dimensions.get("window").width * 0.80
            })
        }
        // Keyboard.dismiss()
    }

    refreshCards = async () => {
        const { cards } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        this.setState({ selectedDeck: this.props.selectedDeck, deckCards: cards })
    }
    FlatListItemSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: "100%",
                    backgroundColor: "#607D8B",
                }}
            />
        );
    }
    search = async (cardName) => {
        try {
            const { data } = await functions.httpsCallable("searchResults")({ name: cardName, type: this.state.cardType })
            this.setState({ cards: data })
        } catch (err) {
            console.error(err)
        }
    }

    onChange = (item) => {
        // console.log(`'Current Item', ${item}`);
    }

    onPress = async (item) => {
        Alert.alert(`Pressed on current item ${item}`);

    }
    expandCard = async (cardInfo) => {

        this.setState({ selectedCard: cardInfo, popUpVisible: true })

    }
    addCard = async (cardInfo) => {
        console.log("card info", cardInfo)
        this.setState({ popUpVisible: false })
        await addCardsToDeck({ username: this.props.user.username, deck: this.props.selectedDeck, card: cardInfo })
        await this.refreshCards()
    }


    getCards() {
        const res = [];
        const keys = Object.keys(this.state.cards ? this.state.cards : CARDS);
        for (let i = 0; i < keys.length; i += 1) {
            const card = keys[i];
            res.push(
                <TouchableOpacity onPress={() => this.state.cards && this.expandCard(this.state.cards[card])} key={card}>
                    <Image
                        key={card}
                        source={this.state.cards ? { uri: this.state.cards[card]["card_images"][0]["image_url"] } : CARDS[card]}

                        resizeMode="contain"
                        style={{
                            height: "90%",
                            width: this.state.cardWidth
                        }}
                    />
                </TouchableOpacity>
            );
        }
        return res;
    }
    onSubmit = async () => {
        if (this.state.search !== "") {
            await this.search(this.state.search)
        }
    }
    deleteCard = async (card) => {
        await deleteCard({ username: this.props.user.username, deck: this.state.selectedDeck, card: card })
        await this.refreshCards()
    }
    refreshCardInfo = async () => {
        const { cards } = await retrieveDeckInfo(this.props.user.username)
        this.setState({ decks })
    }
    updateCardQuantity = async (obj) => {
        console.log("what we have to work with", obj)
        if (obj.value > obj.card.quantity) {
            await addCardsToDeck({ ...obj, val: obj.value })
        } else if (obj.value < obj.card.quantity) {
            await removeCardsFromDeck({ ...obj, val: obj.value })
        }
    }

    renderItem = ({ item }) => {
        const { currentlyOpenSwipeable } = this.state;
        const onOpen = (event, gestureState, swipeable) => {
            if (currentlyOpenSwipeable && currentlyOpenSwipeable !== swipeable) {
                currentlyOpenSwipeable.recenter();
            }
            this.setState({ currentlyOpenSwipeable: swipeable });
        }
        const onClose = () => this.setState({ currentlyOpenSwipeable: null })

        return (

            <Swipeable
                style={{ height: 60 }}
                rightButtons={[
                    <TouchableOpacity onPress={async () => await this.deleteCard(item.name)} style={[styles.rightSwipeItem, { backgroundColor: 'red' }]}>
                        <Text style={{
                            fontWeight: '800',
                            fontSize: 18
                        }}>Delete</Text>
                    </TouchableOpacity>,
                ]}
                onRightButtonsOpenRelease={onOpen}
                onRightButtonsCloseRelease={onClose}
            >
                <View style={[styles.listItem, { backgroundColor: 'white' }]}>
                    <Text
                        style={{
                            fontSize: 20,
                            alignSelf: "flex-start",
                            fontWeight: '800',

                        }}>{item.name}</Text>
                    <View style={{ position: "absolute", right: 10 }}>
                        <NumericInput
                            initValue={item.quantity}
                            onChange={value => this.updateCardQuantity({ value: value, card: item, username: this.props.user.username, deck: this.state.selectedDeck })}
                            onLimitReached={(isMax, msg) => console.log(isMax, msg)}
                            minValue={1}
                            maxValue={3}
                            totalWidth={120}
                            totalHeight={25}
                            iconSize={25}
                            step={1}
                            // containerStyle={{ backgroundColor: "black" }}
                            valueType='real'
                            rounded
                            textColor='#B0228C'
                            iconStyle={{ color: 'white' }}
                            rightButtonBackgroundColor="rgb(130, 69, 91)"
                            leftButtonBackgroundColor="rgb(130, 69, 91)" />
                    </View>
                </View>
            </Swipeable>
        )
    }
    render() {
        const { search } = this.state;
        return (
            <TouchableWithoutFeedback accessible={false}>
                <View style={styles.container}>
                    <View style={{ ...this.state.searchResultsView }}>
                        <CoverFlow
                            style={{ flex: 1 }}
                            onChange={this.onChange}
                            onPress={this.onPress}
                            spacing={100}
                            wingSpan={80}
                            rotation={50}
                            midRotation={50}
                            scaleDown={0.8}
                            scaleFurther={0.75}
                            perspective={800}
                            initialSelection={5}
                        >
                            {this.getCards()}
                        </CoverFlow>
                        <TouchableOpacity style={{ position: "absolute", left: 0, bottom: 15, height: 41, width: 41 }} onPress={() => this.expandSearchCardsListView()}>
                            <Image source={require("../assets/downArrow.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                        </TouchableOpacity>
                        <View style={{ ...styles.deckSearchContainer, marginBottom: 15, marginTop: 15 }}>
                            <TextInput placeholderTextColor={"#6F8FA9"} placeholder={"Search..."} style={styles.deckSearchTextInput} onChangeText={(search) => this.setState({ search })} onSubmitEditing={this.onSubmit} onFocus={this.resetViewsToDefault} />
                            <Image source={require("../assets/searchIcon.png")} style={styles.searchIcon} />
                        </View>
                        <TouchableOpacity style={{ position: "absolute", right: 0, bottom: 15, height: 41, width: 41 }} onPress={() => this.expandDeckCardsListView()}>
                            <Image source={require("../assets/upArrow.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ ...this.state.deckListView, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <View style={{ flex: 1 / 9, height: 35, width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <Text style={{ fontSize: 30, fontWeight: "800" }}>{this.state.selectedDeck}</Text>

                        </View>
                        <View style={{ flex: 8 / 9, flexDirection: "row" }}>
                            <FlatList
                                data={this.state.deckCards}
                                ItemSeparatorComponent={this.FlatListItemSeparator}
                                contentContainerStyle={{ justifyContent: 'center' }}
                                renderItem={(item) => this.renderItem(item)}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </View>
                    <Dialog
                        containerStyle={{ backgroundColor: "transparent" }}
                        dialogStyle={{ backgroundColor: 'rgba(52, 52, 52, alpha)' }}
                        visible={this.state.popUpVisible}
                        overlayOpacity={0}
                        onTouchOutside={() => {
                            this.setState({ popUpVisible: false });
                        }}

                        footer={
                            <DialogFooter>
                                <DialogButton
                                    style={{ backgroundColor: "rgb(130, 69, 91)", borderRadius: 30 }}
                                    textStyle={{ color: "white" }}
                                    text="Add To Deck"
                                    onPress={() => this.addCard(this.state.selectedCard)}
                                />
                            </DialogFooter>
                        }
                        dialogAnimation={new ScaleAnimation({
                            initialValue: 0, // optional
                            useNativeDriver: true, // optional
                        })}
                        width={Dimensions.get("window").width * 0.9}
                        height={Dimensions.get("window").height * 0.9}
                    >
                        <DialogContent>
                            <View style={{ justifyContent: "center", alignItems: "center" }}>

                                <TouchableOpacity onPress={() => this.setState({ popUpVisible: false })}>
                                    {this.state.selectedCard && <Image
                                        source={{ uri: this.state.selectedCard["card_images"][0]["image_url"] }}
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
                </View>

            </TouchableWithoutFeedback>
        );
    }
}



const mapStateToProps = (state) => {
    const { user, cards, selectedDeck } = state
    return { user, cards, selectedDeck }
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
        // fontFamily: "Merriweather-Bold",
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
    },
    listItem: {
        height: 75,
        flexDirection: "row",
        justifyContent: 'flex-start',

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
