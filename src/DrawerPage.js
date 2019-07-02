import React, { Component } from "react"
import styles from "./styles"
import { ScrollView, SafeAreaView, View, Text, TouchableOpacity, Image } from "react-native"
import { auth, functions } from "../Firebase/Fire"

export default class DrawerView extends Component {
    constructor() {
        super()
        this.state = {
            userName: null,
            exists: false,
            photo: null
        }
    }
    // componentDidMount() {
    //     auth.onAuthStateChanged(user => {
    //         if (user) {
    //             this.setState({ userId: user.uid, userName: user.displayName, exists: true, photo: user.photoURL || "https://hovercraftdoggy.files.wordpress.com/2012/07/iain-acton3-we-go-with-the-flow1.gif" })
    //         } else {
    //             this.setState({ exists: false })
    //             console.log("no user yet")
    //         }
    //     })
    // }
    // logOut = () => {
    //     auth.signOut()
    //     this.props.navigation.closeDrawer()
    // }
    // navigateToSettings = () => {
    //     const { navigate, closeDrawer } = this.props.navigation
    //     navigate("SettingsView")
    //     closeDrawer()
    // }
    // navigateToMap = () => {
    //     const { navigate, closeDrawer } = this.props.navigation
    //     navigate("MapView")
    //     closeDrawer()
    // }
    // navigateToRideHistory = () => {
    //     const { navigate, closeDrawer } = this.props.navigation
    //     navigate("RideHistoryView")
    //     closeDrawer()
    // }

    render() {
        const { closeDrawer } = this.props.navigation
        const { exists, userName, photo } = this.state
        return (
            <ScrollView style={styles.scrollViewContainer}
                scrollEnabled={false}>
                <SafeAreaView style={styles.safeAreaViewContainer} forceInset={{ top: 'always', horizontal: 'never' }}>
                    <View style={styles.userGreetingContainer}>
                        <Text style={styles.userGreetingContainerText}>{userName ? "Hey, " + userName + " 👋" : " Hey, there"}</Text>
                    </View>
                    <View style={styles.userAvatarContainer}>
                        <TouchableOpacity onPress={this.navigateToSettings} >
                            <Image style={styles.avatar} source={{ uri: exists ? photo : "https://hovercraftdoggy.files.wordpress.com/2012/07/iain-acton3-we-go-with-the-flow1.gif" }} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tabContainer}>
                        {/* <TouchableOpacity onPress={this.navigateToMap} style={styles.tabContainerTouchableOpacity}>
                            <View style={styles.tabContainerContents}>
                                <Image style={styles.tabContainerImage} source={require("../../assets/map.png")} />
                                <Text style={styles.tabContainerText}>Map</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToRideHistory} style={styles.tabContainerTouchableOpacity}>
                            <View style={styles.tabContainerContents}>
                                <Image style={styles.tabContainerImage} source={require("../../assets/rideHistory.png")} />
                                <Text style={styles.tabContainerText}>Ride History</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={closeDrawer} style={styles.tabContainerTouchableOpacity}>
                            <View style={styles.tabContainerContents}>
                                <Image style={styles.tabContainerImage} source={require("../../assets/help.png")} />
                                <Text style={styles.tabContainerText}>Help</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToSettings} style={styles.tabContainerTouchableOpacity}>
                            <View style={styles.tabContainerContents}>
                                <Image style={styles.tabContainerImage} source={require("../../assets/settings.png")} />
                                <Text style={styles.tabContainerText}>Settings</Text>
                            </View>
                        </TouchableOpacity>
                        {exists &&
                            <TouchableOpacity onPress={this.logOut} style={styles.tabContainerTouchableOpacity}>
                                <View style={styles.tabContainerContents}>
                                    <Image style={styles.tabContainerImage} source={require("../../assets/logout.png")} />
                                    <Text style={styles.tabContainerText}>Log Out</Text>
                                </View>
                            </TouchableOpacity>
                        } */}
                    </View>
                </SafeAreaView>
            </ScrollView >
        )
    }
}

