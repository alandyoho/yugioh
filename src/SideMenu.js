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
    render() {
        return (
            <ScrollView style={styles.scrollViewContainer}
                scrollEnabled={false}
                contentContainerStyle={{
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "flex-end"
                }}>
                <SafeAreaView style={styles.safeAreaViewContainer} forceInset={{ top: 'always', horizontal: 'never' }}>
                    <View style={styles.tabContainer}>
                        {
                            this.props.screen === "HomePage" ?
                                <TouchableOpacity onPress={this.logOut} style={styles.tabContainerTouchableOpacity}>
                                    <View style={styles.tabContainerContents}>
                                        {/* <Image style={styles.tabContainerImage} source={require("../../assets/logout.png")} /> */}
                                        <Text style={styles.tabContainerText}>Log Out</Text>
                                    </View>
                                </TouchableOpacity> :
                                <TouchableOpacity onPress={this.props.leaveDuel} style={styles.tabContainerTouchableOpacity}>
                                    <View style={styles.tabContainerContents}>
                                        {/* <Image style={styles.tabContainerImage} source={require("../../assets/logout.png")} /> */}
                                        <Text style={styles.tabContainerText}>Leave Duel</Text>
                                    </View>
                                </TouchableOpacity>
                        }

                    </View>
                </SafeAreaView>
            </ScrollView >

        )
    }
}


const styles = StyleSheet.create({
    scrollViewContainer: {
    },
    safeAreaViewContainer: {
        flex: 1,
    },
    tabContainer: {
        flex: 1,
        paddingLeft: 20,
        flexDirection: "column",
        justifyContent: "flex-end",
    },

    tabContainerTouchableOpacity: {
        borderWidth: 2,
        borderColor: "#fff",
        padding: 20
    },
    tabContainerContents: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    tabContainerImage: {
        width: 25,
        height: 25
    },
    tabContainerText: {
        fontSize: 20,
    }


});

