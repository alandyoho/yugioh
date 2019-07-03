import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text, ScrollView, Animated } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import { updateSelectedDeck } from "./actions"
import { retrieveCardsFromDeck } from "../Firebase/FireMethods"
import { FlatList } from 'react-native-gesture-handler';

class DuelingRoomPage extends Component {
    constructor() {
        super()
        this.state = {
            selectedDeck: "",
            cards: [],
            hand: []
        }
    }
    async componentDidMount() {
        const { cards } = await retrieveCardsFromDeck({ username: this.props.user.username, deck: this.props.selectedDeck })
        console.log("here are the cards", cards)
        this.setState({ selectedDeck: this.props.selectedDeck, cards })
        this.shuffleDeck()
        for (let i = 0; i < 5; i++) {
            this.drawCard()
        }

    }

    shuffleDeck = () => {
        const { cards } = this.state
        var m = cards.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = cards[m];
            cards[m] = cards[i];
            cards[i] = t;
        }
        this.setState({ cards })
        return cards;
    }
    drawCard = () => {
        const { cards } = this.state
        const drewCard = cards.shift()
        this.setState({ cards, hand: [...this.state.hand, drewCard] })
        return drewCard
    }
    renderItem = ({ item }) => {
        return (
            <Image source={{ uri: item["card_images"][0]["image_url"] }} resizeMode={"contain"} style={{
                width: 100
            }} />
        )
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1 / 2 }}>
                    <Image resizeMode={"contain"} style={{ width: "100%", height: "100%" }} source={require("../assets/flippedField.png")} />
                </View>
                <View style={{ flex: 1 / 2 }}>
                    <Image resizeMode={"contain"} style={{ width: "100%", height: "100%" }} source={require("../assets/field.png")} />
                </View>
                <Animated.View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200 }}
                >
                    <FlatList
                        data={this.state.hand}
                        renderItem={(item) => this.renderItem(item)}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal={true}
                    />
                </Animated.View>
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