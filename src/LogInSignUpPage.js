import React, { Component } from "react"
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import { Button } from 'react-native-elements';
import SlidingUpPanel from 'rn-sliding-up-panel';
import { SignUpForm, LogInForm } from "./LogInSignUpPageComponents"
import { createUser } from "./actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PhotoReel from "./PhotoReel.js"

class LogInSignUpPage extends Component {
    constructor() {
        super()
        this.state = {
            panelHeight: 0,
            visible: false,
            logInRequested: true
        }
    }
    logInRequested = () => {
        this.setState({ logInRequested: true })
        this._panel.show()
    }
    signUpRequested = () => {
        this.setState({ logInRequested: false })
        this._panel.show()
    }
    render() {
        const { navigate } = this.props.navigation
        const { visible, logInRequested } = this.state
        const { createUser } = this.props
        return (
            <View style={styles.container}>
                <PhotoReel />

                <Button
                    title="Log In"
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
                    onPress={this.logInRequested}
                />
                <Button
                    title="Sign Up"
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
                    onPress={this.signUpRequested}
                />
                <SlidingUpPanel
                    visible={visible}
                    height={Dimensions.get("window").height * 0.85}
                    ref={c => this._panel = c}
                    backdropOpacity={0.25}
                    backgroundColor={"#00000"}
                    draggableRange={{ top: Dimensions.get("window").height * 0.85, bottom: 0 }}
                >
                    <View style={styles.panelStyles}>
                        {logInRequested ? <LogInForm createUser={createUser} dismissPopup={() => this._panel.hide()} navigateToHomePage={() => navigate("HomePage")} /> : <SignUpForm createUser={createUser} navigateToHomePage={() => navigate("HomePage")} dismissPopup={() => this._panel.hide()} />}
                    </View>
                </SlidingUpPanel>
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

export default connect(mapStateToProps, mapDispatchToProps)(LogInSignUpPage);