import { GiftedForm, GiftedFormManager } from "react-native-gifted-form"
import React, { Component } from "react"
import moment from "moment"
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { auth, functions } from "../../Firebase/Fire"
import signUpFormValidators from "./SignUpFormValidators"
import defaultAvatarImage from "../../assets/default-image.jpg"
import { updateUserInfo } from "../../Firebase/FireMethods"

export default class SignUpForm extends Component {
    constructor() {
        super()
        this.state = {
            dialogVisible: false,
            userId: ""
        }
        this.inputs = {};
    }
    focusNextField = (key) => {
        this.inputs[key].focus();
    }
    componentDidMount() {

    }
    signUp = async (user) => {
        try {
            //create auth user in firebase
            await auth.createUserWithEmailAndPassword(user.email, user.password);
            //update redux store with user info
            this.props.createUser(user)
            //create user info in firestore, update user object to contain displayName
            await updateUserInfo(user)
            return "successfully created account"
        } catch (error) {
            return false
        }
    }
    render() {
        return (
            <TouchableWithoutFeedback
                onPress={() => Keyboard.dismiss()}>

                <View style={styles.container} >
                    <GiftedForm
                        scrollEnabled={true}
                        style={{
                            backgroundColor: "#FFF",
                        }}
                        formName='signupForm' // GiftedForm instances that use the same name will also share the same states
                        openModal={() => { }}
                        clearOnClose={false} // delete the values of the form when unmounted
                        validators={signUpFormValidators}
                    >
                        <Text style={styles.welcomeDuelist}>Welcome, duelist</Text>
                        <GiftedForm.SeparatorWidget />
                        <View style={styles.avatarContainer}>
                            <Image style={styles.avatar} source={defaultAvatarImage} />
                        </View>
                        <GiftedForm.TextInputWidget
                            keyboardType="default"
                            returnKeyType="next"
                            name='fullName'
                            title='Full name'
                            autoFocus={false}
                            blurOnSubmit={false}
                            // image={require('../../assets/user.png')}
                            placeholder='Yugi Muto'
                            clearButtonMode='while-editing'
                            ref={input => {
                                this.inputs['one'] = input;
                            }}
                            onSubmitEditing={() => { this.focusNextField('two'); }}
                        />
                        <GiftedForm.TextInputWidget
                            returnKeyType="next"
                            name='username'
                            title='Username'
                            // image={require('../../assets/username.png')}
                            placeholder='DarkMagicianGirlFan21'
                            clearButtonMode='while-editing'
                            blurOnSubmit={false}
                            onSubmitEditing={() => { this.focusNextField('three'); }}
                            ref={input => { this.inputs['two'] = input }}
                        />

                        <GiftedForm.TextInputWidget
                            name='password' // mandatory
                            title='Password'
                            placeholder='******'
                            clearButtonMode='while-editing'
                            secureTextEntry={true}
                            returnKeyType="next"
                            // image={require('../../assets/lock.png')}
                            blurOnSubmit={false}
                            onSubmitEditing={() => { this.focusNextField('four') }}
                            ref={input => { this.inputs['three'] = input; }}
                        />

                        <GiftedForm.TextInputWidget
                            name='emailAddress' // mandatory
                            title='Email address'
                            placeholder='yugi@gmail.com'
                            keyboardType='email-address'
                            returnKeyType="done"
                            clearButtonMode='while-editing'
                            // image={require('../../assets/email.png')}
                            blurOnSubmit={true}
                            ref={input => { this.inputs['four'] = input }}
                        />
                        <GiftedForm.SeparatorWidget />
                        <GiftedForm.ErrorsWidget />
                        <GiftedForm.SubmitWidget
                            title={"Sign Up"}
                            widgetStyles={{
                                submitButton: styles.submitButton,
                                textSubmitButton: styles.textSubmitButton
                            }}
                            onSubmit={async (isValid, values, validationResults, postSubmit = null, modalNavigator = null) => {
                                if (isValid === true) {
                                    //prepare user object
                                    const user = {
                                        "email": values.emailAddress,
                                        "name": values.fullName,
                                        "password": values.password,
                                        "username": values.username
                                    }
                                    //check if user email exists as authenticated user
                                    const signedUp = await this.signUp(user)
                                    //if exists => popup saying "user exists with email. Please log in"
                                    if (signedUp == false) {
                                        postSubmit("Email already taken!")
                                    } else {
                                        postSubmit()
                                        this.props.navigateToHomePage()
                                        this.props.dismissPopup()
                                        GiftedFormManager.reset('signupForm')
                                    }
                                    //else => create new authenticated user in firebase, store user info in redux, segue to home screen

                                    /* Implement the request to your server using values variable
                                    ** then you can do:
                                    ** postSubmit(); // disable the loader
                                    ** postSubmit(['An error occurred, please try again']); // disable the loader and display an error message
                                    ** postSubmit(['Username already taken', 'Email already taken']); // disable the loader and display an error message
                                    ** GiftedFormManager.reset('signupForm'); // clear the states of the form manually. 'signupForm' is the formName used
                                    */
                                }
                            }
                            }
                        />

                        <GiftedForm.NoticeWidget
                            title={'By signing up, you agree to the Terms of Service and Privacy Policity.'}
                            style={{ color: "black" }}
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#ffff",
        padding: 15
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 2,
        borderColor: 'rgb(130, 69, 91)',
        marginBottom: 10,
    },
    welcomeDuelist: {
        color: 'black',
        fontWeight: '800',
        fontSize: 30,
        fontStyle: "italic",
        alignSelf: "center"
    },
    submitButton: {
        backgroundColor: 'rgb(130, 69, 91)',
        marginTop: 10,
        borderRadius: 10,
        width: Dimensions.get("window").width - 64,
        height: 50,
        alignSelf: "center"
    },
    textSubmitButton: {
        color: 'white',
        fontWeight: '800',
        fontSize: 18
    }
});
