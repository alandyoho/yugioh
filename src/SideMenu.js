import React, { Component } from "react"
import { ScrollView, SafeAreaView, StyleSheet, View, Dimensions, Image, Text, Animated } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import { auth } from "../Firebase/Fire"
// import { ScrollView, SafeAreaView, View, Text, TouchableOpacity, Image } from "react-native"


export default class CustomSideMenu extends Component {
    logOut = () => {
        auth.signOut()
        this.props.navigation.navigate("LogInSignUpPage")
    }
    renderScreen = () => {
        if (this.props.screen === "HomePage") {
            return (
                <React.Fragment>
                    <TouchableOpacity onPress={this.props.toggleSettingsPopup} style={styles.tabContainerTouchableOpacity}>
                        <View style={styles.tabContainerContents}>
                            {/* <Image style={styles.tabContainerImage} source={require("../../assets/logout.png")} /> */}
                            <Text style={styles.tabContainerText}>Settings</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.logOut} style={styles.tabContainerTouchableOpacity}>
                        <View style={styles.tabContainerContents}>
                            {/* <Image style={styles.tabContainerImage} source={require("../../assets/logout.png")} /> */}
                            <Text style={styles.tabContainerText}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </React.Fragment>
            )
        } else if (this.props.screen === "DuelingRoomPage") {
            return (

                <TouchableOpacity onPress={this.props.leaveDuel} style={styles.tabContainerTouchableOpacity}>
                    <View style={styles.tabContainerContents}>
                        {/* <Image style={styles.tabContainerImage} source={require("../../assets/logout.png")} /> */}
                        <Text style={styles.tabContainerText}>Leave Duel</Text>
                    </View>
                </TouchableOpacity>
            )
        } else if (this.props.screen === "DeckConstructorPage") {
            return (
                <TouchableOpacity onPress={this.props.goHome} style={styles.tabContainerTouchableOpacity}>
                    <View style={styles.tabContainerContents}>
                        {/* <Image style={styles.tabContainerImage} source={require("../../assets/logout.png")} /> */}
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

