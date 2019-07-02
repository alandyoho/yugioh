import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import { updateSelectedDeck } from "./actions"

class DuelingRoomPage extends Component {
    constructor() {
        super()
        this.state = {

        }
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1 / 2 }}>
                    <Image resizeMode={"contain"} style={{ width: "100%", height: "100%" }} source={require("../assets/flippedField.png")} />
                </View>
                <View style={{ flex: 1 / 2 }}>
                    <Image resizeMode={"contain"} style={{ width: "100%", height: "100%" }} source={require("../assets/field.png")} />
                </View>
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
        flexDirection: "column"
        // justifyContent: 'center',
        // alignItems: 'center'
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

export default connect(mapStateToProps, mapDispatchToProps)(DuelingRoomPage);