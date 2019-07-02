import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import PhotoReel from './PhotoReel';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import DuelingRoomPage from "./DuelingRoomPage"
import DeckSelectPage from "./DeckSelectPage"
import { updateSelectedDeck } from "./actions"

class HomePage extends Component {
    constructor() {
        super()
        this.state = {
            duelingRoomPageVisible: false,
            deckSelectPageVisible: false
        }
    }
    render() {
        const { user, navigation, updateSelectedDeck } = this.props
        const { duelingRoomPageVisible, deckSelectPageVisible } = this.state
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
                    onPress={() => this.setState({ duelingRoomPageVisible: true })}
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
                    visible={duelingRoomPageVisible}
                    width={0.85}
                    height={0.40}
                    dialogAnimation={new ScaleAnimation({
                        initialValue: 0, // optional
                        useNativeDriver: true, // optional
                    })}
                    onTouchOutside={() => {
                        this.setState({ duelingRoomPageVisible: false });
                    }}
                >
                    <DialogContent style={{ flex: 1 }}>
                        <DuelingRoomPage user={user} />
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