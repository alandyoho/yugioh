import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import PhotoReel from './PhotoReel';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import DuelingRoomSelectPage from "./DuelingRoomSelectPage"
import DeckSelectPage from "./DeckSelectPage"
import { updateSelectedDeck } from "./actions"

class HomePage extends Component {
    constructor() {
        super()
        this.state = {
            duelingRoomSelectPageVisible: false,
            deckSelectPageVisible: false
        }
    }
    render() {
        const { user, navigation, updateSelectedDeck } = this.props
        const { duelingRoomSelectPageVisible, deckSelectPageVisible } = this.state
        return (
            <View style={styles.container}>
                <PhotoReel />
                <Button
                    title="Deck Constructor"
                    titleStyle={{
                        color: 'white',
                        fontWeight: '800',
                        fontSize: 18
                    }}
                    buttonStyle={{
                        backgroundColor: 'rgb(130, 69, 91)',
                        marginTop: 10,
                        borderRadius: 10,
                        width: Dimensions.get("window").width - 64,
                        height: 50,
                        alignSelf: "center"
                    }}
                    loading={false}
                    onPress={() => this.setState({ deckSelectPageVisible: true })}
                />
                <Button
                    title="Dueling Room"
                    titleStyle={{
                        color: 'white',
                        fontWeight: '800',
                        fontSize: 18
                    }}
                    buttonStyle={{
                        backgroundColor: 'rgb(130, 69, 91)',
                        marginTop: 10,
                        borderRadius: 10,
                        width: Dimensions.get("window").width - 64,
                        height: 50,
                        alignSelf: "center"
                    }}
                    loading={false}
                    onPress={() => this.setState({ duelingRoomSelectPageVisible: true })}
                />
                <Dialog
                    visible={deckSelectPageVisible}
                    width={0.85}
                    height={0.40}
                    dialogAnimation={new ScaleAnimation({
                        initialValue: 0, // optional
                        useNativeDriver: true, // optional
                    })}
                    onTouchOutside={() => {
                        this.setState({ deckSelectPageVisible: false });
                    }}
                >
                    <DialogContent style={{ flex: 1 }}>
                        <DeckSelectPage user={user} navigation={navigation} updateSelectedDeck={updateSelectedDeck} dismissDeckSelectPage={() => this.setState({ deckSelectPageVisible: false })} />
                    </DialogContent>
                </Dialog>
                <Dialog
                    visible={duelingRoomSelectPageVisible}
                    width={0.85}
                    height={0.40}
                    dialogAnimation={new ScaleAnimation({
                        initialValue: 0, // optional
                        useNativeDriver: true, // optional
                    })}
                    onTouchOutside={() => {
                        this.setState({ duelingRoomSelectPageVisible: false });
                    }}
                >
                    <DialogContent style={{ flex: 1 }}>
                        <DuelingRoomSelectPage user={user} navigation={navigation} dismissDuelingRoomSelectPage={() => this.setState({ duelingRoomSelectPageVisible: false })} />
                    </DialogContent>
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
        justifyContent: 'center',
        alignItems: 'center'
    },
});

const mapStateToProps = (state) => {
    const { user, cards } = state
    return { user, cards }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        createUser,
        updateSelectedDeck
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);