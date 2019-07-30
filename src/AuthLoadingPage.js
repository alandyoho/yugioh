import React, { Component } from 'react';
import {
    View,
    Image,
} from 'react-native';
import * as firebase from "firebase"
import { createUser, updateDeckList } from "./actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrieveDeckInfo } from "../Firebase/FireMethods"

class AuthLoadingScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        }
        this.authSubscription()
    }
    authSubscription = async () => {
        await setTimeout(async () => {
            await firebase.auth().onAuthStateChanged(async (user) => {
                if (user && user.displayName) {
                    this.props.navigation.navigate("App")
                    this.props.createUser({ username: user.displayName, email: user.email })
                    //console.log("displayname", user)
                    try {
                        const { decks } = await retrieveDeckInfo(user.displayName)
                        this.props.updateDeckList(decks)
                    } catch (err) {
                        console.error(err)
                    }
                } else {
                    this.props.navigation.navigate("Auth")
                }
            })
        }, 5000)
    }
    render() {
        return (
            <View style={{ backgroundColor: "white", flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Image source={require('../assets/textLoading.gif')} resizeMode="contain" style={{
                    height: "30%",
                }}
                />
                <Image source={require('../assets/loading.gif')} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, cards } = state
    return { user, cards }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        createUser, updateDeckList
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AuthLoadingScreen);