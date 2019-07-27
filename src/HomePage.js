import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text, Animated } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import PhotoReel from './PhotoReel';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import { DuelingRoomSelectPage, DeckSelectPage, DeckSelectPopup } from "./HomePageComponents"
import { updateSelectedDeck } from "./actions"
import SideMenu from "react-native-side-menu"
import CustomSideMenu from "./SideMenu"

class HomePage extends Component {
    constructor() {
        super()
        this.state = {
            duelingRoomSelectPageVisible: false,
            deckSelectPageVisible: false,
            duelingRoomSelectPageOpacity: new Animated.Value(1),
            deckSelectPopupOpacity: new Animated.Value(0),
            duelingRoomSelectPageZPosition: 3,
            deckSelectPopupZPosition: 2,
            type: ""
        }
    }
    fadeOutDuelingRoomSelectPage = (type) => {
        Animated.timing(this.state.duelingRoomSelectPageOpacity, { toValue: 0, useNativeDriver: true, }).start();
        Animated.timing(this.state.deckSelectPopupOpacity, { toValue: 1, useNativeDriver: true, }).start();
        this.setState({ duelingRoomSelectPageZPosition: 2, deckSelectPopupZPosition: 3, type })
    }
    resetState = () => {
        Animated.timing(this.state.duelingRoomSelectPageOpacity, { toValue: 1, useNativeDriver: true, }).start();
        Animated.timing(this.state.deckSelectPopupOpacity, { toValue: 0, useNativeDriver: true, }).start();
        this.setState({ duelingRoomSelectPageZPosition: 3, deckSelectPopupZPosition: 2, type: "" })
    }
    render() {
        const { user, navigation, updateSelectedDeck } = this.props
        const { duelingRoomSelectPageVisible, deckSelectPageVisible } = this.state
        return (
            <SideMenu menu={<CustomSideMenu screen={"HomePage"} navigation={navigation} />}>
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
                            this.resetState()
                        }}
                    >
                        <DialogContent style={{ flex: 1 }}>
                            <Animated.View style={{ position: "absolute", left: 20, right: 20, top: 20, bottom: 20, zIndex: this.state.duelingRoomSelectPageZPosition, opacity: this.state.duelingRoomSelectPageOpacity }}>
                                <DuelingRoomSelectPage user={user} dismissDuelingRoomSelectPage={() => this.setState({ duelingRoomSelectPageVisible: false })} fadeOutDuelingRoomSelectPage={this.fadeOutDuelingRoomSelectPage} />
                            </Animated.View>
                            <Animated.View style={{ position: "absolute", left: 20, right: 20, top: 20, bottom: 20, zIndex: this.state.deckSelectPopupZPosition, opacity: this.state.deckSelectPopupOpacity }}>
                                <DeckSelectPopup user={user} navigation={navigation} dismissDuelingRoomSelectPage={() => this.setState({ duelingRoomSelectPageVisible: false })} updateSelectedDeck={this.props.updateSelectedDeck} resetState={this.resetState} type={this.state.type} />
                            </Animated.View>
                        </DialogContent>
                    </Dialog>
                </View>
            </SideMenu>
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
        backgroundColor: 'black',
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