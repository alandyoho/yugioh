import React, { Component } from "react"
import { StyleSheet, View, Dimensions, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-elements';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import Swipeable from 'react-native-swipeable';
import { TextInput } from "react-native-gesture-handler";
import { updateDeckInfo, retrieveDeckInfo, deleteDeck, hostDuel, joinDuel } from "../../Firebase/FireMethods"

export default class DeckSelectPopup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            dialogVisible: false,
            deckName: "",
            decks: [],
            currentlyOpenSwipeable: null
        }
    }
    async componentDidMount() {
        await this.refreshDeckInfo()
    }
    refreshDeckInfo = async () => {
        const { username } = this.props.user
        const { decks } = await retrieveDeckInfo(username)
        this.setState({ decks })
    }

    onPressItem = (deck) => {
        this.props.resetState()
        if (this.props.type == "Host") {
            console.log("type of request", this.props.type)
            hostDuel(this.props.user.username)
        } else {
            console.log("type of request", this.props.type)
            joinDuel(this.props.type)
        }
        this.props.updateSelectedDeck(deck)
        this.props.dismissDuelingRoomSelectPage()
        this.props.navigation.navigate("DuelingRoomPage")

    }

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={[styles.listItem, { alignSelf: "flex-start", backgroundColor: 'white' }]} onPress={() => this.onPressItem(item)}>
                <Text style={{ fontSize: 20, alignSelf: "flex-start" }}>{`${item}`}</Text>
            </TouchableOpacity>
        )
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
    render() {
        const { decks } = this.state
        return (
            <View style={styles.container}>
                {this.state.decks.length ?
                    <React.Fragment>
                        <Text style={{ fontSize: 30, alignSelf: "center" }}>Select Deck</Text>
                        <FlatList
                            data={decks}
                            renderItem={(item) => this.renderItem(item)}
                            keyExtractor={(item, index) => index.toString()}
                            ItemSeparatorComponent={this.FlatListItemSeparator}
                        />
                    </React.Fragment>
                    : <Text style={{ fontSize: 30, alignSelf: "center" }}>No Saved Decks!</Text>}
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
    },
    listItem: {
        height: 75,
        alignItems: 'center',
        justifyContent: 'center',
        width: Dimensions.get("window").width
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

});




// const mapStateToProps = (state) => {
//     const { user, cards, selectedDeck } = state
//     return { user, cards, selectedDeck }
// };
// const mapDispatchToProps = dispatch => (
//     bindActionCreators({
//         updateSelectedDeck
//     }, dispatch)
// );

// export default connect(mapStateToProps, mapDispatchToProps)(DeckSelectPage);