import React, { Component } from 'react';
// import { StyleSheet, Text, View, Image, Slider, Alert, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import { TouchableOpacity, Alert, View, Image, Dimensions, StyleSheet, Text, Animated, TextInput, TouchableWithoutFeedback, Keyboard, LayoutAnimation, DeviceEventEmitter, ActivityIndicator } from "react-native"

import CoverFlow from 'react-native-coverflow';
import { functions } from "../Firebase/Fire"
import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrieveCardsFromDeck, addCardsToDeck, deleteCard, removeCardsFromDeck } from "../Firebase/FireMethods"
import Swipeable from 'react-native-swipeable';
import SlidingUpPanel from 'rn-sliding-up-panel';
import { MultiSwitch, FadeScaleImage, SwipeableRow, CustomText } from './ComplexComponents';
import CARDS from "./cards.js"
import Dialog, { DialogContent, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import NumericInput from 'react-native-numeric-input'

import { ScrollView } from 'react-native-gesture-handler/GestureHandler';
import SideMenu from "react-native-side-menu"
import CustomSideMenu from "./SideMenu"
import { Audio } from 'expo-av';

class DeckConstructorPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: "",
            cards: {},
            mainDeck: [],
            extraDeck: [],
            extraDeckCardsVisible: false,
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
            cardWidth: Dimensions.get("window").width * 0.40,
            loading: false,
            deckRetrieved: false,
            overviewPopupVisible: false,
            quantities: { spells: 0, monsters: 0, extraDeckLength: 0, traps: 0, total: 0 }
        }
    }
    refreshOverviewPopup = () => {
        const expandedDeck = []
        let { mainDeck, extraDeck } = this.state

        for (let i = 0; i < mainDeck.length; i++) {
            for (let j = 0; j < mainDeck[i].quantity; j++) {
                expandedDeck.push(mainDeck[i])
            }
        }

        const expandedExtraDeck = []
        for (let i = 0; i < extraDeck.length; i++) {
            for (let j = 0; j < extraDeck[i].quantity; j++) {
                expandedExtraDeck.push(extraDeck[i])
            }
        }
        const spells = expandedDeck.filter(card => card.type.includes("Spell")).length
        const monsters = expandedDeck.filter(card => card.type.includes("Monster")).length
        const traps = expandedDeck.filter(card => card.type.includes("Trap")).length
        const total = expandedDeck.length
        const extraDeckLength = expandedExtraDeck.length
        this.setState({ overviewPopupVisible: true, quantities: { spells, monsters, extraDeckLength, traps, total } })
    }

    componentDidMount = async () => {
        await this.refreshCards()
        await setTimeout(() => {
            this.setState({ deckRetrieved: true })
        }, 3000)
    }


    expandDeckCardsListView = () => {
        Keyboard.dismiss()
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
                expanded: false
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
                expanded: false
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
    }
    expandSearchCardsListView = () => {
        Keyboard.dismiss()

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
                expanded: true,
                cardWidth: Dimensions.get("window").width * 0.80
            })
        }
    }

    refreshCards = async () => {
        const { mainDeck, extraDeck } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        // mainDeck = mainDeck.sort()
        const deck = mainDeck.sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            return 0;
        })
        const extra = extraDeck.sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            return 0;
        })
        this.setState({ selectedDeck: this.props.selectedDeck, mainDeck: deck, extraDeck: extra })
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


    getCards() {
        const res = [];
        const exists = Object.keys(this.state.cards).length
        const keys = exists ? Object.keys(this.state.cards) : Object.keys(CARDS)
        for (let i = 0; i < keys.length; i++) {
            const card = keys[i];
            res.push(
                <TouchableOpacity disabled={!exists} onPress={() => exists && this.expandCard(this.state.cards[card])} key={card}>
                    <FadeScaleImage
                        key={card}
                        source={exists ? { uri: this.state.cards[card]["card_images"][0]["image_url"] } : CARDS[card]}

                        resizeMode="contain"
                        style={{
                            height: "90%",
                            width: this.state.cardWidth
                        }}
                    />
                </TouchableOpacity>
            )
        }
        return res;
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

    renderItem = ({ item, index }) => (
        <SwipeableRow item={item} index={index} deleteCard={this.deleteCard} selectedDeck={this.state.selectedDeck} updateCardQuantity={this.updateCardQuantity} username={this.props.user.username} />
    )
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
    render() {
        const { spells, monsters, extraDeckLength, traps, total } = this.state.quantities
        const { search } = this.state;
        return (
            <SideMenu openMenuOffset={Dimensions.get("window").width / 2} menu={<CustomSideMenu screen={"DeckConstructorPage"} navigation={this.props.navigation} leaveDuel={this.leaveDuel} goHome={this.goHome} />}>
                <View style={styles.container}>
                    <Animated.View style={{ ...this.state.searchResultsView }}>
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
                        <TouchableOpacity style={{ position: "absolute", left: 0, bottom: 15, height: 41, width: 41 }} onPress={() => this.expandSearchCardsListView()}>
                            <FadeScaleImage source={require("../assets/downArrow.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                        </TouchableOpacity>
                        {/* <View style={{ height: 20, width: "33%", justifyContent: "center", alignSelf: "center", alignItems: "center", backgroundColor: "rgb(130, 69, 91)", borderTopLeftRadius: 30, borderTopRightRadius: 30, bottom: 0, marginTop: 15 }}>
                        <TouchableOpacity onPress={() => {
                            Keyboard.dismiss()
                            this._panel.show()
                        }}>
                            <CustomTextstyle={{ color: "white" }}>Advanced Search</CustomText>
                        </TouchableOpacity>
                    </View> */}
                        <View style={{ ...styles.deckSearchContainer, marginBottom: 15 }}>
                            <TextInput placeholderTextColor={"black"} placeholder={"Search..."} style={styles.deckSearchTextInput} onChangeText={(search) => this.setState({ search })} onSubmitEditing={this.onSubmit} onFocus={this.resetViewsToDefault} returnKeyType={"search"} autoCorrect={false} autoCapitalize={"none"} />
                            <FadeScaleImage source={require("../assets/searchIcon.png")} style={styles.searchIcon} />
                        </View>
                        <TouchableOpacity style={{ position: "absolute", right: 0, bottom: 15, height: 41, width: 41 }} onPress={() => this.expandDeckCardsListView()}>
                            <FadeScaleImage source={require("../assets/upArrow.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={{ ...this.state.deckListView, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <View style={{ flex: 1, flexDirection: "column", width: "100%" }}>
                            <TouchableOpacity style={{ position: "absolute", left: 5, top: 0, height: 41, width: 41, flexDirection: "row" }} onPress={() => this.switchDisplayedDeck()}>
                                <FadeScaleImage source={require("../assets/switch.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                                <CustomText>{this.state.extraDeckCardsVisible ? "Main Deck" : "Extra Deck"}</CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ position: "absolute", right: 15, top: 0, height: 41, width: 63, flexDirection: "row", justifyContent: "center", alignItems: "center" }} onPress={() => this.refreshOverviewPopup()}>
                                <CustomText>Overview</CustomText>
                                <FadeScaleImage source={require("../assets/overview.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                            </TouchableOpacity>


                            <CustomText style={{ fontSize: 30, fontWeight: "800", alignSelf: "center" }}>{this.state.selectedDeck}</CustomText>
                            {this.state.deckRetrieved ? <FlatList
                                data={this.state.extraDeckCardsVisible ? this.state.extraDeck : this.state.mainDeck}
                                contentContainerStyle={{ justifyContent: 'center' }}
                                renderItem={(item, index) => this.renderItem(item, index)}
                                keyExtractor={(item, index) => index.toString()}
                            /> : <React.Fragment>
                                    <FadeScaleImage source={require("../assets/skeletonscreen.gif")} style={{ width: "100%", height: 60 }} resizeMode={"stretch"} />
                                    <FadeScaleImage source={require("../assets/skeletonscreen.gif")} style={{ width: "100%", height: 60 }} resizeMode={"stretch"} />
                                    <FadeScaleImage source={require("../assets/skeletonscreen.gif")} style={{ width: "100%", height: 60 }} resizeMode={"stretch"} />
                                    <FadeScaleImage source={require("../assets/skeletonscreen.gif")} style={{ width: "100%", height: 60 }} resizeMode={"stretch"} />
                                    <FadeScaleImage source={require("../assets/skeletonscreen.gif")} style={{ width: "100%", height: 60 }} resizeMode={"stretch"} />
                                    <FadeScaleImage source={require("../assets/skeletonscreen.gif")} style={{ width: "100%", height: 60 }} resizeMode={"stretch"} />
                                    <FadeScaleImage source={require("../assets/skeletonscreen.gif")} style={{ width: "100%", height: 60 }} resizeMode={"stretch"} />
                                    <FadeScaleImage source={require("../assets/skeletonscreen.gif")} style={{ width: "100%", height: 60 }} resizeMode={"stretch"} />
                                    <FadeScaleImage source={require("../assets/skeletonscreen.gif")} style={{ width: "100%", height: 60 }} resizeMode={"stretch"} />
                                </React.Fragment>}
                        </View>
                    </Animated.View>
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

                                {!this.state.expanded ? <TouchableOpacity onPress={() => this.setState({ popUpVisible: false })}>
                                    {this.state.selectedCard && <FadeScaleImage
                                        source={{ uri: this.state.selectedCard["card_images"][0]["image_url"] }}
                                        resizeMode="contain"
                                        style={{
                                            height: Dimensions.get("window").height * 0.70,
                                            width: Dimensions.get("window").width * 0.70
                                        }}
                                    />}
                                </TouchableOpacity> :
                                    <TouchableOpacity onPress={() => this.setState({ popUpVisible: false })} style={{
                                        height: Dimensions.get("window").height * 0.70,
                                        width: Dimensions.get("window").width * 0.70
                                    }}></TouchableOpacity>
                                }

                            </View>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        dialogStyle={{ backgroundColor: '#FFF' }}
                        visible={this.state.overviewPopupVisible}
                        onTouchOutside={() => {
                            this.setState({ overviewPopupVisible: false });
                        }}
                        dialogAnimation={new ScaleAnimation({
                            initialValue: 0, // optional
                            useNativeDriver: true, // optional
                        })}
                        width={Dimensions.get("window").width * 0.70}
                        height={Dimensions.get("window").height * 0.45}
                    >
                        <DialogContent>
                            <View style={{ flexDirection: "column", justifyContent: "space-evenly", alignItems: "flex-start" }}>
                                <CustomText style={{ fontSize: 30, fontWeight: "800", alignSelf: "center", paddingBottom: 20 }}>{this.state.selectedDeck}</CustomText>

                                <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                                    <Image source={require("../assets/spellIcon.png")} style={{ height: 20, width: 20 }} resizeMode={"contain"} />
                                    <CustomText style={{ fontSize: 20 }}>Spells: {spells}</CustomText>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                                    <Image source={require("../assets/trapIcon.png")} style={{ height: 20, width: 20 }} resizeMode={"contain"} />
                                    <CustomText style={{ fontSize: 20 }}>Traps: {traps}</CustomText>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                                    <Image source={require("../assets/monsterIcon.png")} style={{ height: 25, width: 25 }} resizeMode={"contain"} />
                                    <CustomText style={{ fontSize: 20 }}>Monsters: {monsters}</CustomText>
                                </View>
                                <CustomText style={{ fontSize: 20 }}>Main Deck Length: {total}</CustomText>
                                <CustomText style={{ fontSize: 20 }}>Extra Deck Length: {extraDeckLength}</CustomText>



                            </View >
                        </DialogContent >
                    </Dialog >
                    <SlidingUpPanel
                        height={Dimensions.get("window").height * 0.50}
                        ref={c => this._panel = c}
                        backdropOpacity={0.25}
                        backgroundColor={"#00000"}
                        containerStyle={{ zIndex: 10 }}
                        draggableRange={{ top: Dimensions.get("window").height * 0.50, bottom: 0 }}
                    >
                        <View style={styles.panelStyles}>
                            <MultiSwitch
                                currentStatus={'Open'}
                                disableScroll={value => false}
                                isParentScrollEnabled={false}
                                onStatusChanged={text => {
                                    this.setState({ cardType: text })
                                    this.onSubmit()
                                }} />
                        </View>
                    </SlidingUpPanel>

                </View >
            </SideMenu >
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
