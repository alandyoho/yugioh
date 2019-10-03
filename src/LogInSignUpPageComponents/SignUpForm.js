import { GiftedForm, GiftedFormManager } from "react-native-gifted-form"
import React, { Component } from "react"
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import signUpFormValidators from "./SignUpFormValidators"
import defaultAvatarImage from "../../assets/default-image.jpg"
import { updateUserInfo } from "../../Firebase/FireMethods"
import { TouchableOpacity } from "react-native-gesture-handler";


import { functions, auth, storage } from "../../Firebase/Fire"
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import uuid from 'uuid';



export default class SignUpForm extends Component {
    constructor() {
        super()
        this.state = {
            dialogVisible: false,
            userId: "",
            uploading: false,
            image: null
        }
        this.inputs = {};
    }
    focusNextField = (key) => {
        this.inputs[key].focus();
    }

    signUp = async (user) => {
        //create auth user in firebase
        try {
            await auth.createUserWithEmailAndPassword(user.email, user.password);
            if (this.state.photoURL) {
                auth.currentUser.updateProfile({
                    photoURL: this.state.image
                })
            }
            //update redux store with user info
            this.props.createUser(user)
        } catch (err) {
            console.log(err)
            return false
        }
        try {
            await updateUserInfo(user)
        } catch (err) {
            console.log(err)
            return false
        }
        return true

        //create user info in firestore, update user object to contain displayName



    }
    _pickImage = async () => {
        await Permissions.askAsync(Permissions.CAMERA_ROLL);
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
        });
        this._handleImagePicked(pickerResult);
    };

    _handleImagePicked = async pickerResult => {
        try {
            this.setState({ uploading: true });

            if (!pickerResult.cancelled) {
                uploadUrl = await this.uploadImageAsync(pickerResult.uri);
                this.setState({ image: uploadUrl });

            }
        } catch (e) {
            console.log(e);
            alert('Upload failed, sorry :(');
        } finally {
            this.setState({ uploading: false });
        }
    };

    uploadImageAsync = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });
        const ref = storage
            .ref()
            .child(uuid.v4());
        const snapshot = await ref.put(blob);
        blob.close();
        return await snapshot.ref.getDownloadURL();
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
                        <TouchableOpacity style={styles.avatarContainer} onPress={this._pickImage}>
                            <Image style={styles.avatar} source={defaultAvatarImage} source={this.state.uploading ? { uri: "https://ro-echs.sourceinfosys.com/resources/res_internal/img/loader.gif" } : (this.state.image ? { uri: this.state.image } : defaultAvatarImage)} />
                        </TouchableOpacity>
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
                                        "username": values.username,
                                        "imageURL": this.state.image || ""
                                    }

                                    //check if user email exists as authenticated user
                                    const signedUp = await this.signUp(user)
                                    //if exists => popup saying "user exists with email. Please log in"
                                    if (signedUp === false) {
                                        postSubmit("Email already taken!")
                                    } else {
                                        postSubmit()
                                        GiftedFormManager.reset('signupForm')
                                        this.props.navigateToHomePage()
                                        // this.props.dismissPopup()

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
