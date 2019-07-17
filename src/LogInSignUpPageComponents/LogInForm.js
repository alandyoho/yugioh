import { GiftedForm, GiftedFormManager } from "react-native-gifted-form"
import React, { Component } from "react"
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { auth } from "../../Firebase/Fire"

export default class LogInForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dialogVisible: false
        }
        this.inputs = {};
    }
    focusNextField = (key) => {
        this.inputs[key].focus();
    }
    signIn = async (email, password) => {
        try {
            const sign = await auth.signInWithEmailAndPassword(email, password);

            return "successfully signed in"
        } catch (err) {
            return false
        }
    };
    render() {
        return (
            <TouchableWithoutFeedback
                onPress={() => Keyboard.dismiss()}>
                <View style={styles.container} >
                    <Text style={{
                        color: 'black', fontWeight: '800', fontSize: 30, fontStyle: "italic"
                    }}>Welcome back, duelist</Text>
                    <GiftedForm
                        scrollEnabled={false}
                        style={{
                            backgroundColor: "#FFF",
                        }}
                        formName='loginForm' // GiftedForm instances that use the same name will also share the same states
                        openModal={() => { }}
                        clearOnClose={false} // delete the values of the form when unmounted
                    >
                        <GiftedForm.SeparatorWidget />
                        <GiftedForm.TextInputWidget
                            name='emailAddress' // mandatory
                            title='Email address'
                            placeholder='yugi@gmail.com'
                            keyboardType='email-address'
                            returnKeyType="next"
                            clearButtonMode='while-editing'
                            // image={require('../../assets/email.png')}
                            blurOnSubmit={true}
                            ref={input => {
                                this.inputs['one'] = input;
                            }}
                        />
                        <GiftedForm.TextInputWidget
                            name='password' // mandatory
                            title='Password'
                            placeholder='******'
                            clearButtonMode='while-editing'
                            secureTextEntry={true}
                            returnKeyType="done"

                            // image={require('../../assets/lock.png')}
                            blurOnSubmit={false}

                            ref={input => {
                                this.inputs['two'] = input;
                            }}
                        />


                        <GiftedForm.SeparatorWidget />

                        <GiftedForm.ErrorsWidget />
                        <GiftedForm.SubmitWidget
                            title={"Log In"}
                            widgetStyles={{
                                submitButton: {
                                    backgroundColor: 'rgb(130, 69, 91)',
                                    marginTop: 10,
                                    borderRadius: 10,
                                    width: Dimensions.get("window").width - 64,
                                    height: 50,
                                    alignSelf: "center"
                                },
                                textSubmitButton: {
                                    color: 'white', fontWeight: '800', fontSize: 18
                                }
                            }}
                            onSubmit={async (isValid, values, validationResults, postSubmit = null, modalNavigator = null) => {
                                if (isValid === true) {
                                    const user = {
                                        "email": values.emailAddress,
                                        "name": values.fullName,
                                        "password": values.password,
                                        "username": values.username
                                    }
                                    this.props.createUser(user)
                                    const signedIn = await this.signIn(values.emailAddress, values.password)
                                    if (signedIn == false) {
                                        postSubmit(['Incorrect Email/Password'])
                                    } else {
                                        postSubmit()
                                        GiftedFormManager.reset('loginForm')
                                        this.props.dismissPopup()
                                        await setTimeout(() => { this.props.navigateToHomePage() }, 500)
                                    }
                                }
                            }}
                        />
                        <GiftedForm.HiddenWidget name='tos' value={true} />
                    </GiftedForm >
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 2,
        borderColor: 'rgb(130, 69, 91)',
        marginBottom: 10,
    }
});
