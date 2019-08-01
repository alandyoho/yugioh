import React, { Component } from 'react';
import { LogInSignUpPage, HomePage, DeckConstructorPage, DuelingRoomPage } from "./src"
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import userReducer from './src/reducer';
import { Platform } from 'react-native'
import AuthLoadingScreen from "./src/AuthLoadingPage"
import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';
import { StatusBar } from 'react-native';
import DraggableCards from "./src/DraggableCards"
import { Audio } from 'expo-av';

const AppStack = createStackNavigator({
  HomePage: {
    screen: HomePage,
    navigationOptions: {
      header: null
    }
  },
  DeckConstructorPage: {
    screen: DeckConstructorPage,
    navigationOptions: {
      header: null,
      gesturesEnabled: false,

    }
  },
  DuelingRoomPage: {
    screen: DuelingRoomPage,
    navigationOptions: {
      header: null,
      gesturesEnabled: false,

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
  componentDidMount() {
    StatusBar.setHidden(true);

  }
  render() {
    return (
      <Provider store={store}>
        <Yugioh />
      </Provider>
    )
  }
}


