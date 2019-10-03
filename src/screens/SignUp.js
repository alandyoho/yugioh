import React, { Component } from 'react';
import { Alert, ActivityIndicator, Keyboard, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';

import { Button, Block, Input, Text } from '../components';
import { theme } from '../constants';
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
import uuid from 'uuid';
import defaultAvatarImage from "../../assets/default-image.jpg"
import { storage, auth, firestore } from "../../Firebase/Fire"
import { updateUserInfo } from "../../Firebase/FireMethods"

import { createUser } from "../actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class SignUp extends Component {
  state = {
    email: null,
    username: null,
    password: null,
    errors: [],
    loading: false,
    uploading: false,
    image: null
  }
  validEmail = (e) => {
    var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
    return String(e).search(filter) != -1;
  }

  handleSignUp = async () => {
    const { navigation } = this.props;
    const { email, username, password } = this.state;
    const errors = [];

    Keyboard.dismiss();
    this.setState({ loading: true });

    // check with backend API or with some static data
    if (!this.validEmail(email)) errors.push('email');
    if (!username) errors.push('username');
    if (!password) errors.push('password');

    if (!errors.length) {
      const user = {
        email, username, password,
        "imageURL": this.state.image || "https://www.silhouette.pics/images/quotes/english/general/yugi-muto-yugioh-yu-gi-52650-91229.jpg"
      }

      //check if user email exists as authenticated user

      await this.signUp(user)
      this.setState({ loading: false });

    } else {
      this.setState({ errors, loading: false });

    }

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
  signUp = async (user) => {
    //create auth user in firebase
    try {
      await firestore.collection("users").doc(user.username).get()
        .then(async (docSnapshot) => {
          if (docSnapshot.exists) {
            return Alert.alert("Username already taken!")
          } else {
            await auth.createUserWithEmailAndPassword(user.email, user.password);
            await auth.currentUser.updateProfile({
              photoURL: user.photoURL,
              displayName: user.username
            })
            // await auth.signInWithEmailAndPassword(user.email, user.password);
            Alert.alert(
              'Success!',
              'Your account has been created',
            )
            //update redux store with user info
            this.props.createUser(user)
            await auth.signOut()
            await auth.signInWithEmailAndPassword(user.email, user.password)
            await updateUserInfo({ ...user, password: "" })
          }
        });
      //users can currently overwrite other usernames during signUp



    } catch (err) {
      if (err.toString() === "Error: Password should be at least 6 characters") {
        Alert.alert("Password must have at least six characters.")
      } else {
        Alert.alert(err.toString())
      }
      console.log(err)
      return false
    }
    //create user info in firestore, update user object to contain displayName
  }

  render() {
    const { navigation } = this.props;
    const { loading, errors } = this.state;
    const hasErrors = key => errors.includes(key) ? styles.hasErrors : null;

    return (
      <KeyboardAvoidingView style={styles.signup} behavior="padding">
        <Block padding={[0, theme.sizes.base * 2]}>
          <Text h1 bold>Sign Up</Text>
          <TouchableOpacity style={styles.avatarContainer} onPress={this._pickImage}>
            <Image style={styles.avatar} source={defaultAvatarImage} source={this.state.uploading ? { uri: "https://ro-echs.sourceinfosys.com/resources/res_internal/img/loader.gif" } : (this.state.image ? { uri: this.state.image } : defaultAvatarImage)} />
          </TouchableOpacity>
          <Block middle>
            <Input
              email
              label="Email"
              error={hasErrors('email')}
              style={[styles.input, hasErrors('email')]}
              defaultValue={this.state.email}
              placeholder={"yugi@moto.com"}
              onChangeText={text => this.setState({ email: text })}
            />
            <Input
              label="Username"
              error={hasErrors('username')}
              style={[styles.input, hasErrors('username')]}
              defaultValue={this.state.username}
              placeholder={"yugimoto"}
              onChangeText={text => this.setState({ username: text })}
            />
            <Input
              secure
              label="Password"
              error={hasErrors('password')}
              style={[styles.input, hasErrors('password')]}
              defaultValue={this.state.password}
              placeholder={"******"}
              onChangeText={text => this.setState({ password: text })}
            />
            <Button gradient onPress={() => this.handleSignUp()}>
              {loading ?
                <ActivityIndicator size="small" color="white" /> :
                <Text bold white center>Sign Up</Text>
              }
            </Button>

            <Button onPress={() => navigation.navigate('Welcome')}>
              <Text gray caption center style={{ textDecorationLine: 'underline' }}>
                Back
              </Text>
            </Button>
          </Block>
        </Block>
      </KeyboardAvoidingView>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);




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
  },
  signup: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hasErrors: {
    borderBottomColor: theme.colors.accent,
  }
})
