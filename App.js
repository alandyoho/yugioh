import React, { Component } from 'react';
import { LogInSignUpPage, DeckSelectPage, HomePage, DeckConstructorPage, DrawerPage, DuelingRoomPage } from "./src"
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import userReducer from './src/reducer';
import { Platform } from 'react-native'
import AuthLoadingScreen from "./src/AuthLoadingPage"
import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';

const AppStack = createStackNavigator({
  HomePage: {
    screen: HomePage,
    navigationOptions: {
      header: null
    }
  },
  DeckSelectPage: {
    screen: DeckSelectPage,
    navigationOptions: {
      header: null
    }
  },
  DeckConstructorPage: {
    screen: DeckConstructorPage,
    navigationOptions: {
      header: null
    }
  },
  DuelingRoomPage: {
    screen: DuelingRoomPage,
    navigationOptions: {
      header: null
    }
  }
});
const AuthStack = createStackNavigator({
  LogInSignUpPage: {
    screen: LogInSignUpPage,
    navigationOptions: {
      header: null
    }
  }
});

if (Platform.OS !== 'web') {
  window = undefined
}
const store = createStore(userReducer)

export default class App extends Component {
  constructor() {
    super();
    Yugioh = createAppContainer(createSwitchNavigator(
      {
        AuthLoading: AuthLoadingScreen,
        App: AppStack,
        Auth: AuthStack,
      },
      {
        initialRouteName: 'AuthLoading',
      }
    ));

  }

  render() {
    return (
      <Provider store={store}>
        <Yugioh />
      </Provider>
    )
  }
}


