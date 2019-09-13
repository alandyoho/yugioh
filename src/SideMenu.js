import React, { Component } from "react"
import { ScrollView, SafeAreaView, StyleSheet, View, Dimensions, Image, Text, Animated } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import { auth } from "../Firebase/Fire"
import * as Haptics from 'expo-haptics';
import defaultAvatarImage from "../assets/default-image.jpg"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import FriendsIcon from "react-native-vector-icons/FontAwesome5"

import SettingsIcon from "react-native-vector-icons/Octicons"

import LogOutIcon from "react-native-vector-icons/SimpleLineIcons"

import BackIcon from "react-native-vector-icons/Entypo"

export default class CustomSideMenu extends Component {
    logOut = () => {
        auth.signOut()
        this.props.navigation.navigate("LogInSignUpPage")
    }
    handleLongPress = (type) => {
        Haptics.impactAsync("heavy")
        if (type === "preferences") {
            this.props.toggleSettingsPopup()
        } else if (type === "friends") {
            this.props.toggleFriendsPopup()
        } else if (type === "profile") {
            this.props.toggleProfilePopup()
        }
    }
    renderScreen = () => {
        if (this.props.screen === "HomePage") {
            return (
                <React.Fragment>

                    <TouchableOpacity onPress={this.props.toggleProfilePopup} onLongPress={() => this.handleLongPress("profile")}>
                        <Image style={{
                            width: 130,
                            height: 130,
                            borderRadius: 63,
                            borderWidth: 2,
                            borderColor: "#000000",
                            marginBottom: 10,
                        }} source={(this.props.user.imageURL ? { uri: this.props.user.imageURL } : defaultAvatarImage)}
                        />

                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.props.toggleProfilePopup} onLongPress={() => this.handleLongPress("profile")} style={styles.tabContainerTouchableOpacity}>
                        <View style={styles.tabContainerContents}>
                            <Icon
                                name="face-profile"
                                color={"black"}
                                size={20}
                                style={{ paddingRight: 10 }}
                            />
                            <Text style={styles.tabContainerText}>Profile</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.props.toggleFriendsPopup} onLongPress={() => this.handleLongPress("friends")} style={styles.tabContainerTouchableOpacity}>
                        <View style={styles.tabContainerContents}>
                            <FriendsIcon
                                name="user-friends"
                                color={"black"}
                                size={20}
                                style={{ paddingRight: 10 }}

                            />
                            <Text style={styles.tabContainerText}>Friends</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={this.props.toggleSettingsPopup} onLongPress={() => this.handleLongPress("preferences")} style={styles.tabContainerTouchableOpacity}>
                        <View style={styles.tabContainerContents}>
                            <SettingsIcon
                                name="settings"
                                color={"black"}
                                size={20}
                                style={{ paddingRight: 10 }}

                            />
                            <Text style={styles.tabContainerText}>Preferences</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.logOut} style={styles.tabContainerTouchableOpacity}>
                        <View style={styles.tabContainerContents}>
                            <LogOutIcon
                                name="logout"
                                color={"black"}
                                size={20}
                                style={{ paddingRight: 10 }}

                            />
                            <Text style={styles.tabContainerText}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </React.Fragment>
            )
        } else if (this.props.screen === "DuelingRoomPage") {
            return (

                <TouchableOpacity onPress={this.props.leaveDuel} style={styles.tabContainerTouchableOpacity}>
                    <View style={styles.tabContainerContents}>
                        <BackIcon
                            name="back"
                            color={"black"}
                            size={20}
                            style={{ paddingRight: 10 }}

                        />
                        <Text style={styles.tabContainerText}>Leave Duel</Text>
                    </View>
                </TouchableOpacity>
            )
        } else if (this.props.screen === "DeckConstructorPage") {
            return (
                <TouchableOpacity onPress={this.props.goHome} style={styles.tabContainerTouchableOpacity}>
                    <View style={styles.tabContainerContents}>
                        <BackIcon
                            name="back"
                            color={"black"}
                            size={20}
                            style={{ paddingRight: 10 }}
                        />
                        <Text style={styles.tabContainerText}>Home</Text>
                    </View>
                </TouchableOpacity>
            )

        }
    }
    render() {
        return (
            <ScrollView style={styles.scrollViewContainer}
                scrollEnabled={false}
                contentContainerStyle={{
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    backgroundColor: 'black'
                }}>
                <SafeAreaView style={styles.safeAreaViewContainer} forceInset={{ top: 'always', horizontal: 'never' }}>
                    <View style={styles.tabContainer}>
                        {
                            this.renderScreen()
                        }

                    </View>
                </SafeAreaView>
            </ScrollView >

        )
    }
}


const styles = StyleSheet.create({
    scrollViewContainer: {
        backgroundColor: "#FFF"
    },
    safeAreaViewContainer: {
        flex: 1,
        backgroundColor: "#FFF"
    },
    tabContainer: {
        flex: 1,
        paddingLeft: 20,
        flexDirection: "column",
        justifyContent: "flex-end",
        backgroundColor: "#FFF"
    },

    tabContainerTouchableOpacity: {
        // borderWidth: 2,
        // borderColor: "#fff",
        padding: 20
    },
    tabContainerContents: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    tabContainerImage: {
        width: 25,
        height: 25
    },
    tabContainerText: {
        fontSize: 20,
        color: "black",
        fontWeight: "800"
    }


});

