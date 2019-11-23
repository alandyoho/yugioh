import { GiftedForm, GiftedFormManager } from "react-native-gifted-form"
import React, { Component } from "react"
import { StyleSheet, Text, View, Dimensions, ART } from 'react-native';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
// import { auth } from "../Firebase/Fire"
import submitChangesFormValidators from "../LogInSignUpPageComponents/SignUpFormValidators"
import defaultAvatarImage from "../../assets/default-image.jpg"
import { updateUserInfo, updateUser } from "../../Firebase/FireMethods"
import firebase from "firebase"

import Image from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Pie'

import { functions, auth, storage } from "../../Firebase/Fire"
// import { ImagePicker, Permissions } from 'expo';
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import uuid from 'uuid';
import { TouchableOpacity } from "react-native-gesture-handler";



export default class EditProfileForm extends Component {
    constructor() {
        super()
        this.state = {
            userId: "",
            image: null
        }
        this.inputs = {};
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
                let uploadUrl = await this.uploadImageAsync(pickerResult.uri);
                const indexOfInsertion = uploadUrl.indexOf(".com/o/") + 7
                const output = [uploadUrl.slice(0, indexOfInsertion), "thumb_", uploadUrl.slice(indexOfInsertion)].join('');
                console.log("upload url", output)
                auth.currentUser.updateProfile({
                    photoURL: output
                })

                // "https://firebasestorage.googleapis.com/v0/b/yugioh-c720d.appspot.com/o/fbe07d24-3b5b-4a32-af4e-828fc4853b02?alt=media&token=5f253bd6-89e6-4c5d-98da-303bda4f851f"
                this.props.updateUser({ "imageURL": uploadUrl })
                setTimeout(() => {
                    this.props.updateUser({ "imageURL": output })
                }, 10000)
                // this.props.updateUser({ "imageURL": output })
                // this.props.createUser(user)
                await updateUser(this.props.user.username, { "imageURL": output })

                // //create user info in firestore, update user object to contain displayName
                //     await updateUserInfo(user)



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


    focusNextField = (key) => {
        this.inputs[key].focus();
    }
    submitChanges = async (user) => {
        try {
            await updateUserInfo(user)
            return "successfully created account"
        } catch (error) {
            return false
        }
    }
    componentDidMount() {
        // console.log("user beans", this.props.user)
    }

    reauthenticate = (currentPassword) => {
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(
            user.email, currentPassword);
        return user.reauthenticateWithCredential(cred);
    }
    changePassword = (currentPassword, newPassword) => {
        this.reauthenticate(currentPassword).then(() => {
            var user = firebase.auth().currentUser;
            user.updatePassword(newPassword).then(() => {
                console.log("Password updated!");
            }).catch((error) => { console.log(error); });
        }).catch((error) => { console.log(error); });
    }
    changeEmail = (currentPassword, newEmail) => {
        this.reauthenticate(currentPassword).then(() => {
            var user = firebase.auth().currentUser;
            user.updateEmail(newEmail).then(() => {
                console.log("Email updated!");
            }).catch((error) => { console.log(error); });
        }).catch((error) => { console.log(error); });
    }



    render() {
        return (
            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}>
                <View style={styles.container} >
                    <GiftedForm
                        scrollEnabled={false}
                        style={{
                            backgroundColor: "#FFF",
                        }}
                        formName='signupForm' // GiftedForm instances that use the same name will also share the same states
                        openModal={() => { }}
                        clearOnClose={false} // delete the values of the form when unmounted
                        validators={submitChangesFormValidators}
                    >
                        <GiftedForm.SeparatorWidget />
                        <TouchableOpacity style={styles.avatarContainer} onPress={this._pickImage}>
                            <Image
                                source={this.state.image ? { uri: this.state.image } : (this.props.user.imageURL ? { uri: this.props.user.imageURL } : defaultAvatarImage)}
                                indicator={ProgressBar}
                                indicatorProps={{
                                    size: 80,
                                    borderWidth: 0,
                                    color: 'rgb(130, 69, 91)',
                                    unfilledColor: 'rgba(200, 200, 200, 0.2)'
                                }}
                                imageStyle={styles.avatar}
                                style={{ ...styles.avatar, borderColor: "transparent" }} />
                        </TouchableOpacity>
                        <GiftedForm.TextInputWidget
                            keyboardType="default"
                            returnKeyType="next"
                            name='fullName'
                            title='Full name'
                            autoFocus={false}
                            blurOnSubmit={false}
                            // image={require('../../assets/user.png')}
                            defaultValue={this.props.user.name}
                            editable={false}
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
                            defaultValue={this.props.user.username}
                            editable={false}
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
                            defaultValue={"******"}
                            editable={false}
                            // image={require('../../assets/lock.png')}
                            blurOnSubmit={false}
                            onSubmitEditing={() => { this.focusNextField('four') }}
                            ref={input => { this.inputs['three'] = input; }}
                        />
                        <GiftedForm.TextInputWidget
                            name='emailAddress' // mandatory
                            title='Email address'
                            placeholder='yugi@gmail.com'
                            defaultValue={this.props.user.email}
                            editable={false}
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
                            title={"Submit Changes"}
                            widgetStyles={{
                                submitButton: styles.submitButton,
                                textSubmitButton: styles.textSubmitButton
                            }}
                            disabled={true}
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
                                    const signedUp = await this.submitChanges(user)
                                    //if exists => popup saying "user exists with email. Please log in"
                                    if (signedUp == false) {
                                        postSubmit("Email already taken!")
                                    } else {
                                        postSubmit()
                                        // this.props.navigateToHomePage()
                                        // this.props.dismissPopup()
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
        width: 110,
        height: 110,
        borderRadius: 55,
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
