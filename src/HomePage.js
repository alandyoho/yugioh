import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createUser } from "./actions"
import PhotoReel from './PhotoReel';


class HomePage extends Component {
    render() {
        const { navigate } = this.props.navigation
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
                    onPress={() => navigate("DeckSelectPage")}
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
                    onPress={() => navigate("DuelingRoomPage")}
                />
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
        createUser
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);