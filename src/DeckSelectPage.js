import React, { Component } from "react"
import moment from "moment"
import { StyleSheet, View, Dimensions, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-elements';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import Swipeable from 'react-native-swipeable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TextInput } from "react-native-gesture-handler";
import { updateDeckInfo, retrieveDeckInfo, deleteDeck } from "../Firebase/FireMethods"
import { updateSelectedDeck } from "./actions"

class DeckSelectPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            dialogVisible: false,
            deckName: "",
            decks: null,
            currentlyOpenSwipeable: null
        }
    }
    async componentDidMount() {
        await this.refreshDeckInfo()
    }
    refreshDeckInfo = async () => {
        const { decks } = await retrieveDeckInfo(this.props.user.username)
        this.setState({ decks })
    }

    addNewDeck = async () => {
        if (this.state.deckName == "") {
            return
        }
        const exists = await updateDeckInfo({ username: this.props.user.username, deck: this.state.deckName })
        if (exists === false) {
            this.setState({ dialogVisible: true })
        }
        this.setState({ visible: false, deckName: "" })
        await this.refreshDeckInfo()
    }
    deleteDeck = async (deck) => {
        await deleteDeck({ username: this.props.user.username, deck: deck })
        await this.refreshDeckInfo()
    }

    onPressItem = (deck) => {
        const { navigate } = this.props.navigation
        this.props.updateSelectedDeck(deck)
        navigate("DeckConstructorPage")
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
                    <TouchableOpacity onPress={async () => await this.deleteDeck(item)} style={[styles.rightSwipeItem, { backgroundColor: 'red' }]}>
                        <Text>Delete</Text>
                    </TouchableOpacity>,
                ]}
                onRightButtonsOpenRelease={onOpen}
                onRightButtonsCloseRelease={onClose}
            >
                <TouchableOpacity style={[styles.listItem, { alignSelf: "flex-start", backgroundColor: 'white' }]} onPress={() => this.onPressItem(item)}>
                    <Text style={{ fontSize: 20, alignSelf: "flex-start" }}>{`${item}`}</Text>
                </TouchableOpacity>

            </Swipeable>
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
        return (
            <View style={styles.container}>
                <Text style={{ fontSize: 30, alignSelf: "center" }}>Deck List</Text>
                <FlatList
                    data={this.state.decks}
                    renderItem={(item) => this.renderItem(item)}
                    keyExtractor={(item, index) => index.toString()}
                    ItemSeparatorComponent={this.FlatListItemSeparator}
                />
                <Dialog
                    visible={this.state.visible}
                    dialogTitle={<DialogTitle title="New Deck Name" />}
                    onTouchOutside={() => {
                        this.setState({ visible: false });
                    }}
                    dialogAnimation={new ScaleAnimation({
                        initialValue: 0, // optional
                        useNativeDriver: true, // optional
                    })}
                    footer={
                        <DialogFooter>
                            <DialogButton
                                text="Submit"
                                onPress={this.addNewDeck}
                            />
                        </DialogFooter>
                    }
                    width={Dimensions.get("window").width * 0.80}
                >
                    <DialogContent>
                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <TextInput
                                style={{ height: 40, borderColor: 'black', borderWidth: 1, width: Dimensions.get("window").width * 0.70 }}
                                onChangeText={(deckName) => this.setState({ deckName })}
                                value={this.state.deckName}
                                defaultValue={"deck name"}
                                onSubmitEditing={this.addNewDeck}
                                autoFocus={true}
                            />
                        </View>
                    </DialogContent>
                </Dialog>

                <Dialog
                    visible={this.state.dialogVisible}
                    dialogTitle={<DialogTitle title="Deck Name Already Taken!" />}
                    onTouchOutside={() => {
                        this.setState({ dialogVisible: false });
                    }}
                    dialogAnimation={new ScaleAnimation({
                        initialValue: 0, // optional
                        useNativeDriver: true, // optional
                    })}
                    children={undefined}
                    width={Dimensions.get("window").width * 0.80}
                    footer={
                        <DialogFooter>
                            <DialogButton
                                text="OK"
                                onPress={() => { this.setState({ dialogVisible: false }) }}
                            />
                        </DialogFooter>
                    }
                >
                </Dialog>





                <View style={{ flexDirection: "row", justifyContent: "flex-start", right: 15, bottom: 15, position: "absolute" }}>
                    <TouchableOpacity onPress={() => this.setState({ visible: true })}>
                        <Image ref="plusButton" style={{ width: 80, height: 80, zIndex: 1 }} source={require('../assets/plus.png')} />
                    </TouchableOpacity>
                </View>
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




const mapStateToProps = (state) => {
    const { user, cards, selectedDeck } = state
    return { user, cards, selectedDeck }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        updateSelectedDeck
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DeckSelectPage);