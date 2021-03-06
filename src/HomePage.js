import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text, Animated, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import PhotoReel from './PhotoReel';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import { DuelingRoomSelectPage, DeckSelectPage, DeckSelectPopup, SettingsPopup } from "./HomePageComponents"
import { updateSelectedDeck, updatePreferences, updateUser, updateFriendsList, addFriendToList } from "./actions"
import SideMenu from "react-native-side-menu"
import CustomSideMenu from "./SideMenu"
import { Audio } from 'expo-av';
import { FadeImage } from "./ComplexComponents"
import * as Haptics from 'expo-haptics';
import EditProfileForm from "./HomePageComponents/EditProfileForm"
import FriendsPopup from "./HomePageComponents/FriendsPopup"
import TouchableScale from 'react-native-touchable-scale';



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
            type: "",
            settingsPopupVisible: false,
            profilePopupVisible: false,
            friendsPopupVisible: false,
            animatedValue: new Animated.Value(0),
            FadeViewZIndex: 20
        }
        this.soundObject = new Audio.Sound();
        this.animatedValue = new Animated.Value(0)
        this.duelingRoomButtonAnimatedValue = new Animated.Value(1)
        this.deckConstructorButtonAnimatedValue = new Animated.Value(1)

    }
    async componentDidMount() {
        console.log("(7)", this.props.storedCards)
        //now we have the cards in redux, all we need to do, when rendering image, check if exists in redux, if it does, render from file system, otherwise, render from card's url

        if (this.props.preferences.musicEnabled) {
            await this.loadAndEnableAudio()
        }
        setTimeout(() => {
            Animated.spring(this.animatedValue, {
                toValue: -400,
                duration: 400,
            }).start();
            setTimeout(() => {
                this.fadeView.setNativeProps({ zIndex: -1 })
            }, 400)
        }, 1000)




    }
    loadAndEnableAudio = async () => {
        try {
            await this.soundObject.loadAsync(require('../assets/yugioh-theme2.mp3'));
            await this.soundObject.playAsync();
            // Your sound is playing!
        } catch (error) {
            // An error occurred!
        }
    }
    stopAudio = async () => {
        try {
            await this.soundObject.pauseAsync()

        } catch (err) {

        }

        // await this.soundObject.unloadAsync()
    }
    enableAudio = async () => {
        await this.soundObject.playAsync()
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
    dismissSettingsPopup = async () => {
        this.setState({ settingsPopupVisible: false });
        if (this.props.preferences.musicEnabled) {
            try {
                await this.enableAudio()

            } catch (err) {
                await this.loadAndEnableAudio()
            }
        } else {
            await this.stopAudio()
        }
    }
    handleLongPress = (type) => {
        Haptics.impactAsync("heavy")
        if (type === "DeckConstructor") {
            this.setState({ deckSelectPageVisible: true })
        } else {
            this.setState({ duelingRoomSelectPageVisible: true })
        }
    }
    toggleFriendsPopup = () => {

        this.setState({ friendsPopupVisible: !this.state.friendsPopupVisible })
    }
    toggleProfilePopup = () => {
        this.setState({ profilePopupVisible: !this.state.profilePopupVisible })
    }
    handlePressIn = (type) => {
        Animated.timing(this[type + "ButtonAnimatedValue"], {
            toValue: 0.90,
            duration: 250
        }).start()
    }
    handlePressOut = (type) => {
        Animated.timing(this[type + "ButtonAnimatedValue"], {
            toValue: 1,
            friction: 3,
            tension: 40,
            duration: 250
        }).start()
    }
    render() {
        const deckConstructorAnimatedStyle = {
            transform: [{ scale: this.deckConstructorButtonAnimatedValue }]
        }
        const duelingRoomAnimatedStyle = {
            transform: [{ scale: this.duelingRoomButtonAnimatedValue }]
        }
        const { user, navigation, updateSelectedDeck } = this.props
        const { duelingRoomSelectPageVisible, deckSelectPageVisible, settingsPopupVisible, friendsPopupVisible, profilePopupVisible } = this.state
        return (
            <SideMenu openMenuOffset={Dimensions.get("window").width / 2} menu={<CustomSideMenu screen={"HomePage"} navigation={navigation} CustomSideMenu={Dimensions.get("window").width / 3} toggleSettingsPopup={() => this.setState({ settingsPopupVisible: true })} toggleFriendsPopup={this.toggleFriendsPopup} toggleProfilePopup={this.toggleProfilePopup} user={this.props.user} />}>
                <View style={styles.container}>
                    <Animated.View style={{ position: "absolute", flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "transparent", zIndex: 20 }} ref={v => this.fadeView = v}>

                        {/* <Animated.View style={{ position: "absolute", backgroundColor: interpolateColor, flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", left: 0, right: 0, top: 0, bottom: 0, zIndex: this.state.FadeViewZIndex }}> */}
                        <Animated.View style={{ position: "absolute", left: this.animatedValue, top: 0, bottom: 0, width: Dimensions.get("window").width / 2, backgroundColor: 'rgb(230, 77, 61)', justifyContent: "center", alignItems: 'flex-end' }}>
                            <Image source={require("../assets/loadingGifAdvanced1.png")} style={{ height: 100, width: 50 }} />
                        </Animated.View>
                        <Animated.View style={{ position: "absolute", right: this.animatedValue, top: 0, bottom: 0, width: Dimensions.get("window").width / 2, backgroundColor: 'rgb(230, 77, 61)', justifyContent: "center", alignItems: 'flex-start' }}>
                            <Image source={require("../assets/loadingGifAdvanced2.png")} style={{ height: 100, width: 50 }} />
                        </Animated.View>

                    </Animated.View>
                    <PhotoReel />
                    <View style={{ height: 100, marginBottom: 25, width: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        <FadeImage source={require("../assets/yugiohLogo.png")} resizeMode="contain" style={{ width: "80%" }} />
                    </View>
                    <TouchableWithoutFeedback
                        onPressIn={() => this.handlePressIn("deckConstructor")}
                        onPressOut={() => this.handlePressOut("deckConstructor")}
                        onLongPress={() => this.handleLongPress("DeckConstructor")}
                        onPress={() => this.setState({ deckSelectPageVisible: true })}
                    >
                        <Animated.View style={[{
                            backgroundColor: 'rgb(130, 69, 91)',
                            marginTop: 10,
                            borderRadius: 10,
                            width: Dimensions.get("window").width - 64,
                            height: 50,
                            alignSelf: "center",
                            justifyContent: "center",
                            alignItems: "center"
                        }, deckConstructorAnimatedStyle]}>
                            <Text style={{
                                color: 'white',
                                fontWeight: '800',
                                fontSize: 18,
                            }}>Deck Constructor</Text>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                        onPressIn={() => this.handlePressIn("duelingRoom")}
                        onPressOut={() => this.handlePressOut("duelingRoom")}
                        onPress={() => this.setState({ duelingRoomSelectPageVisible: true })}
                        onLongPress={() => this.handleLongPress("DuelingRoom")}
                    >
                        <Animated.View style={[{
                            backgroundColor: 'rgb(130, 69, 91)',
                            marginTop: 10,
                            borderRadius: 10,
                            width: Dimensions.get("window").width - 64,
                            height: 50,
                            alignSelf: "center",
                            justifyContent: "center",
                            alignItems: "center"
                        }, duelingRoomAnimatedStyle]}>
                            <Text style={{
                                color: 'white',
                                fontWeight: '800',
                                fontSize: 18,
                            }}>Dueling Room</Text>
                        </Animated.View>
                    </TouchableWithoutFeedback>

                    {/* <Button
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
                        onLongPress={() => this.handleLongPress("DuelingRoom")}

                    /> */}
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
                            <DeckSelectPage user={user} navigation={navigation} updateSelectedDeck={updateSelectedDeck} dismissDeckSelectPage={() => this.setState({ deckSelectPageVisible: false })} disableAudio={this.stopAudio} enableAudio={this.enableAudio} />
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        visible={duelingRoomSelectPageVisible}
                        width={0.90}
                        height={0.40}

                        dialogAnimation={new ScaleAnimation({
                            initialValue: 0, // optional
                            useNativeDriver: true, // optional
                        })}
                        onTouchOutside={() => {
                            this.setState({ duelingRoomSelectPageVisible: false });
                            this.resetState()
                        }}
                        dialogStyle={{ width: Dimensions.get('window').width, heigth: Dimensions.get("window").height * 0.40, backgroundColor: "transparent", borderRadius: 5 }}
                    >
                        <DialogContent style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "flex-start", backgroundColor: "transparent" }}>
                            <Animated.View style={{ flex: 1, zIndex: this.state.duelingRoomSelectPageZPosition, opacity: this.state.duelingRoomSelectPageOpacity, width: Dimensions.get('window').width * 0.90, height: Dimensions.get("window").height * 0.40, backgroundColor: "rgb(255, 253, 255)", borderRadius: 5 }}>
                                <DuelingRoomSelectPage user={user} dismissDuelingRoomSelectPage={() => this.setState({ duelingRoomSelectPageVisible: false })} fadeOutDuelingRoomSelectPage={this.fadeOutDuelingRoomSelectPage} />
                            </Animated.View>
                            <Animated.View style={{ flex: 1, zIndex: this.state.deckSelectPopupZPosition, opacity: this.state.deckSelectPopupOpacity, width: Dimensions.get('window').width * 0.90, height: Dimensions.get("window").height * 0.40, backgroundColor: "rgb(255, 253, 255)", borderRadius: 5, position: "absolute" }}>
                                <DeckSelectPopup user={user} navigation={navigation} dismissDuelingRoomSelectPage={() => this.setState({ duelingRoomSelectPageVisible: false })} updateSelectedDeck={this.props.updateSelectedDeck} resetState={this.resetState} type={this.state.type} disableAudio={this.stopAudio} enableAudio={this.enableAudio} preferences={this.props.preferences} />
                            </Animated.View>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        visible={settingsPopupVisible}
                        width={0.85}
                        height={0.40}

                        dialogAnimation={new ScaleAnimation({
                            initialValue: 0, // optional
                            useNativeDriver: true, // optional
                        })}
                        onTouchOutside={this.dismissSettingsPopup}
                    >
                        <DialogContent style={{ flex: 1 }}>
                            <SettingsPopup updatePreferences={this.props.updatePreferences} preferences={this.props.preferences} loadAndEnableAudio={this.loadAndEnableAudio} />
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        // visible={profilePopupVisible}
                        visible={friendsPopupVisible}

                        children={[]}
                        onTouchOutside={this.toggleFriendsPopup}
                        dialogAnimation={new ScaleAnimation({
                            initialValue: 0, // optional
                            useNativeDriver: true, // optional
                        })}
                        width={0.90}
                        height={0.60}
                        dialogStyle={{ width: Dimensions.get('window').width, heigth: Dimensions.get("window").height * 0.60, backgroundColor: "transparent", borderRadius: 5 }}
                    >
                        <DialogContent style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "flex-start", backgroundColor: "transparent" }}>
                            <View style={{ width: Dimensions.get('window').width * 0.90, heigth: Dimensions.get("window").height * 0.60, backgroundColor: "rgb(255, 253, 255)", borderRadius: 5 }}>
                                <FriendsPopup user={this.props.user} friendsList={this.props.friendsList} updateFriendsList={this.props.updateFriendsList} addFriendToList={this.props.addFriendToList} />
                            </View>
                        </DialogContent>
                    </Dialog>
                    <Dialog
                        // visible={profilePopupVisible}
                        visible={profilePopupVisible}

                        children={[]}
                        onTouchOutside={this.toggleProfilePopup}
                        dialogAnimation={new ScaleAnimation({
                            initialValue: 0, // optional
                            useNativeDriver: true, // optional
                        })}
                        width={0.90}
                        height={0.60}
                    // dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width * 0.80, height: Dimensions.get("window").height * 0.80 }}
                    >
                        <DialogContent style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "flex-start", backgroundColor: "white" }}>
                            <EditProfileForm user={this.props.user} updateUser={this.props.updateUser} />
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
    const { user, cards, preferences, friendsList, storedCards } = state
    return { user, cards, preferences, friendsList, storedCards }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        createUser,
        updateSelectedDeck, updatePreferences,
        updateUser, updateFriendsList, addFriendToList
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);