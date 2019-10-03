import React, { Component } from 'react'
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, StyleSheet, Alert } from 'react-native'

import { Button, Block, Input, Text } from '../components';
import { theme } from '../constants';

const VALID_EMAIL = "yugi@moto.com";
const VALID_PASSWORD = "******";
import { createUser } from "../actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { auth } from "../../Firebase/Fire"

class Login extends Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false,
  }
  validEmail = (e) => {
    var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
    return String(e).search(filter) != -1;
  }
  signIn = async (email, password) => {
    return await auth.signInWithEmailAndPassword(email, password);
  };

  handleLogin = async () => {
    const { navigation } = this.props;
    const { email, password } = this.state;
    const errors = [];

    Keyboard.dismiss();
    this.setState({ loading: true });

    // check with backend API or with some static data
    if (!this.validEmail(email)) {
      errors.push('email');
    }
    if (!password.length) {
      errors.push("password")
    }
    if (errors.length) {
      this.setState({ loading: false, errors });
    } else {
      try {
        await this.signIn(email, password)
      } catch (err) {
        if (err.toString() === "Error: There is no user record corresponding to this identifier. The user may have been deleted.") {
          Alert.alert('Email does not exist!')
        } else if (err.toString() === "Error: The password is invalid or the user does not have a password.") {
          Alert.alert('Invalid Username/Password!')
        } else {
          console.log(err.toString())
        }
      }
      this.setState({ loading: false });
    }






  }

  render() {
    const { navigation } = this.props;
    const { loading, errors } = this.state;
    const hasErrors = key => errors.includes(key) ? styles.hasErrors : null;

    return (
      <KeyboardAvoidingView style={styles.login} behavior="padding">
        <Block padding={[0, theme.sizes.base * 2]}>
          <Text h1 bold>Login</Text>
          <Block middle>
            <Input
              label="Email"
              error={hasErrors('email')}
              style={[styles.input, hasErrors('email')]}
              placeholder={"yugi@moto.com"}
              onChangeText={text => this.setState({ email: text })}
            />
            <Input
              secure
              label="Password"
              error={hasErrors('password')}
              style={[styles.input, hasErrors('password')]}
              placeholder={"******"}
              onChangeText={text => this.setState({ password: text })}
            />
            <Button gradient onPress={this.handleLogin}>
              {loading ?
                <ActivityIndicator size="small" color="white" /> :
                <Text bold white center>Login</Text>
              }
            </Button>

            <Button onPress={() => navigation.navigate('Forgot')}>
              <Text gray caption center style={{ textDecorationLine: 'underline' }}>
                Forgot your password?
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

export default connect(mapStateToProps, mapDispatchToProps)(Login);


const styles = StyleSheet.create({
  login: {
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
