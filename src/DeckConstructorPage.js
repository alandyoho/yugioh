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
import MultiSwitch from './rn-slider-switch';
import CARDS from "./cards.js"
import Dialog, { DialogContent, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import NumericInput from 'react-native-numeric-input'
import CustomImage from "./ImageLoader"
import SwipeableRow from "./SwipeableComponent"

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
            loading: false
        }
    }
    componentDidMount = async () => {
        await this.refreshCards()
        // console.log("cards", this.state.mainDeck)
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
        this.setState({ selectedDeck: this.props.selectedDeck, mainDeck, extraDeck })
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
        console.log("card info", cardInfo)
        this.setState({ popUpVisible: false })
        await addCardsToDeck({ username: this.props.user.username, deck: this.props.selectedDeck, card: cardInfo })
        await this.refreshCards()
    }


    getCards() {
        const res = [];
        const exists = Object.keys(this.state.cards).length
        const keys = exists ? Object.keys(this.state.cards) : Object.keys(CARDS)
        console.log("keys:", keys)
        for (let i = 0; i < keys.length; i++) {
            const card = keys[i];
            console.log("here's the card", card)
            res.push(
                <TouchableOpacity disabled={!exists} onPress={() => exists && this.expandCard(this.state.cards[card])} key={card}>
                    <CustomImage
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
    }
    switchDisplayedDeck = () => {
        this.setState({ extraDeckCardsVisible: !this.state.extraDeckCardsVisible })
    }

    renderItem = ({ item, index }) => (
        <SwipeableRow item={item} index={index} deleteCard={this.deleteCard} selectedDeck={this.state.selectedDeck} updateCardQuantity={this.updateCardQuantity} username={this.props.user.username} />
    )


    // const { currentlyOpenSwipeable } = this.state;
    // const onOpen = (event, gestureState, swipeable) => {
    //     if (currentlyOpenSwipeable && currentlyOpenSwipeable !== swipeable) {
    //         currentlyOpenSwipeable.recenter();
    //     }
    //     this.setState({ currentlyOpenSwipeable: swipeable });
    // }
    // const onClose = () => this.setState({ currentlyOpenSwipeable: null })

    // return (

    //     <Swipeable
    //         style={{ height: 60, flex: 1 }}
    //         rightButtons={[
    //             <TouchableOpacity onPress={async () => await this.deleteCard(item)} style={[styles.rightSwipeItem, { backgroundColor: 'red' }]}>
    //                 <Text style={{
    //                     fontWeight: '800',
    //                     fontSize: 18
    //                 }}>Delete</Text>
    //             </TouchableOpacity>,
    //         ]}
    //         onRightButtonsOpenRelease={onOpen}
    //         onRightButtonsCloseRelease={onClose}
    //     >
    //         <View style={[styles.listItem]}>
    //             <Text
    //                 style={{ fontSize: 20, fontWeight: '800', }}>{item.name}</Text>
    // <NumericInput
    //     containerStyle={{ position: "absolute", right: 10 }}
    //     initValue={item.quantity}
    //     onChange={value => this.updateCardQuantity({ value: value, card: item, username: this.props.user.username, deck: this.state.selectedDeck })}
    //     onLimitReached={(isMax, msg) => console.log(isMax, msg)}
    //     minValue={1}
    //     maxValue={3}
    //     totalWidth={120}
    //     totalHeight={25}
    //     iconSize={25}
    //     step={1}
    //     editable={false}
    //     valueType='real'
    //     rounded
    //     textColor='#B0228C'
    //     iconStyle={{ color: 'white' }}
    //     rightButtonBackgroundColor="rgb(130, 69, 91)"
    //     leftButtonBackgroundColor="rgb(130, 69, 91)" />
    //         </View>
    //     </Swipeable>
    // )

    render() {
        const { search } = this.state;
        return (
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
                        <CustomImage source={require("../assets/downArrow.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                    </TouchableOpacity>
                    <View style={{ height: 20, width: "33%", justifyContent: "center", alignSelf: "center", alignItems: "center", backgroundColor: "rgb(130, 69, 91)", borderTopLeftRadius: 30, borderTopRightRadius: 30, bottom: 0, marginTop: 15 }}>
                        <TouchableOpacity onPress={() => {
                            Keyboard.dismiss()
                            this._panel.show()
                        }}>
                            <Text style={{ color: "white" }}>Advanced Search</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ ...styles.deckSearchContainer, marginBottom: 15 }}>
                        <TextInput placeholderTextColor={"black"} placeholder={"Search..."} style={styles.deckSearchTextInput} onChangeText={(search) => this.setState({ search })} onSubmitEditing={this.onSubmit} onFocus={this.resetViewsToDefault} returnKeyType={"search"} />
                        <CustomImage source={require("../assets/searchIcon.png")} style={styles.searchIcon} />
                    </View>
                    <TouchableOpacity style={{ position: "absolute", right: 0, bottom: 15, height: 41, width: 41 }} onPress={() => this.expandDeckCardsListView()}>
                        <CustomImage source={require("../assets/upArrow.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={{ ...this.state.deckListView, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, flexDirection: "column", width: "100%" }}>
                        <TouchableOpacity style={{ position: "absolute", left: 5, top: 0, height: 41, width: 41, flexDirection: "row" }} onPress={() => this.switchDisplayedDeck()}>
                            <CustomImage source={require("../assets/switch.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                            <Text>{this.state.extraDeckCardsVisible ? "Main Deck" : "Extra Deck"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ position: "absolute", right: 40, top: 0, height: 63, width: 63, flexDirection: "row" }} >
                            <Text>Overview</Text>
                            <CustomImage source={require("../assets/overview.png")} style={{ height: 35, width: 35 }} resizeMode={"contain"} />
                        </TouchableOpacity>


                        <Text style={{ fontSize: 30, fontWeight: "800", alignSelf: "center" }}>{this.state.selectedDeck}</Text>
                        <FlatList
                            data={this.state.extraDeckCardsVisible ? this.state.extraDeck : this.state.mainDeck}
                            ItemSeparatorComponent={() => <View style={{
                                backgroundColor: 'rgb(200, 199, 204)',
                                height: StyleSheet.hairlineWidth,
                            }} />}
                            contentContainerStyle={{ justifyContent: 'center' }}
                            renderItem={(item, index) => this.renderItem(item, index)}
                            keyExtractor={(item, index) => index.toString()}
                        />
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
                                {this.state.selectedCard && <CustomImage
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

            </View>
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
