import React, { Component } from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    View,
    Image,
    Dimensions
} from 'react-native';
import * as firebase from "firebase"
import { createUser } from "./actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { UserDimensions } from 'firebase-functions/lib/providers/analytics';

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
                if (user) {
                    this.props.navigation.navigate("App")
                    this.props.createUser({ username: user.displayName, email: user.email })
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
        createUser
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AuthLoadingScreen);