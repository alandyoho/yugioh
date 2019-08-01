import React, { Component } from "react"
import { StyleSheet, View, Dimensions, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-elements';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import Swipeable from 'react-native-swipeable';
import { TextInput } from "react-native-gesture-handler";
import { updateMainDeckInfo, retrieveDeckInfo, deleteDeck } from "../../Firebase/FireMethods"

export default class DeckSelectPage extends Component {
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

    addNewDeck = async () => {
        const { deckName } = this.state
        const { username } = this.props.user
        if (deckName == "") {
            return
        }
        const exists = await updateMainDeckInfo({ username, deck: deckName })
        if (exists === false) {
            this.setState({ dialogVisible: true })
        }
        this.setState({ visible: false, deckName: "" })
        await this.refreshDeckInfo()
    }
    deleteDeck = async (deck) => {
        const { username } = this.props.user
        await deleteDeck({ username, deck })
        await this.refreshDeckInfo()
    }

    onPressItem = async (deck) => {
        const { navigate } = this.props.navigation
        this.props.updateSelectedDeck(deck)
        this.props.dismissDeckSelectPage()
        await this.props.disableAudio()
        navigate('DeckConstructorPage', {
            enableAudio: this.props.enableAudio
        })
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
                style={{ height: 75 }}
                rightButtons={[
                    <TouchableOpacity onPress={async () => await this.deleteDeck(item)} style={[styles.rightSwipeItem, { backgroundColor: 'red' }]}>
                        <Text>Delete</Text>
                    </TouchableOpacity>,
                ]}
                onRightButtonsOpenRelease={onOpen}
                onRightButtonsCloseRelease={onClose}
            >
                <TouchableOpacity style={[styles.listItem, { alignSelf: "flex-start", backgroundColor: 'white' }]} onPress={() => this.onPressItem(item)}>
                    <Text style={{ fontSize: 20, alignSelf: "flex-start" }}>{item}</Text>
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
        const { decks, visible, deckName, dialogVisible } = this.state
        return (
            <View style={styles.container}>
                <View style={{ flex: 3 / 4 }}>
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
                        : <Text style={{ fontSize: 30, alignSelf: "center" }}>No Available Decks!</Text>}

                </View>
                <View style={{ flex: 1 / 4 }}>
                    <Text style={{ fontSize: 15, alignSelf: "center" }}>—or—</Text>
                    <Button
                        title="Create New Deck"
                        titleStyle={{
                            color: 'white',
                            fontWeight: '800',
                            fontSize: 18
                        }}
                        buttonStyle={{
                            backgroundColor: 'rgb(130, 69, 91)',
                            marginTop: 10,
                            borderRadius: 10,
                            height: 50,
                            alignSelf: "center"
                        }}
                        loading={false}
                        onPress={() => this.setState({ visible: true })}
                    />

                </View>
                <Dialog
                    visible={visible}
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
                                value={deckName}
                                defaultValue={"deck name"}
                                onSubmitEditing={this.addNewDeck}
                                autoFocus={true}
                            />
                        </View>
                    </DialogContent>
                </Dialog>
                <Dialog
                    visible={dialogVisible}
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