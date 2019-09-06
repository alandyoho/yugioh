import React, { Component } from 'react';
import { LogInSignUpPage, HomePage, DeckConstructorPage, DuelingRoomPage } from "./src"
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import userReducer from './src/reducer';
import { Platform } from 'react-native'
import AuthLoadingScreen from "./src/AuthLoadingPage"
import { createSwitchNavigator, createStackNavigator, createAppContainer, createBottomTabNavigator } from 'react-navigation';
import { StatusBar } from 'react-native';
import DraggableRoomHostBoard from "./src/DraggableDuelingRoomPage"
import { Root } from "native-base";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MultiBar, MultiBarToggle } from 'react-native-multibar';
import MainDeckDeckConstructor from "./src/MainDeckDeckConstructor"
import ExtraDeckDeckConstructor from "./src/ExtraDeckDeckConstructor"
import * as FileSystem from 'expo-file-system';

const DeckConstructorPageTabsNavigator = createBottomTabNavigator({
  MainDeckDeckConstructor: {
    screen: MainDeckDeckConstructor,
    navigationOptions: () => ({
      tabBarIcon: ({ tintColor }) => (
        <Icon
          name="alpha-m-circle"
          color={tintColor}
          size={24}
        />
      )
    })
  },
  MultiBar: {
    screen: () => null,
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: () => (
        <MultiBarToggle
          actionVibration={true}
          navigation={navigation}
          actionSize={30}
          routes={[
            {
              routeName: "MainDeckDeckConstructor",
              params: { requestingSearch: true, type: "monsters", deactivateShaking: true },
              color: 'rgb(130, 69, 91)',
              icon: (
                <Icon
                  name="alpha-m"
                  color="#FFF"
                  size={25}
                />
              )
            },
            {
              routeName: "MainDeckDeckConstructor",
              params: { requestingSearch: true, type: "spells", deactivateShaking: true },
              color: 'rgb(130, 69, 91)',
              icon: (
                <Icon
                  name="alpha-s"
                  color="#FFF"
                  size={25}
                />
              )
            },
            {
              routeName: "MainDeckDeckConstructor",
              params: { requestingSearch: true, type: "traps", deactivateShaking: true },

              color: 'rgb(130, 69, 91)',
              icon: (
                <Icon
                  name="alpha-t"
                  color="#FFF"
                  size={25}
                />
              )
            },
          ]}
          icon={(
            <Icon
              name="plus"
              color="#FFFFFF"
              size={24}
            />
          )}
        />
      )
    }),
    params: {
      navigationDisabled: true
    }
  },
  TabsProfile: {
    screen: ExtraDeckDeckConstructor,
    navigationOptions: () => ({
      tabBarIcon: ({ tintColor }) => (
        <Icon
          name="alpha-e-circle"
          color={tintColor}
          size={24}
        />
      )
    })
  }
}, {
    initialRouteName: "MainDeckDeckConstructor",
    tabBarComponent: MultiBar,
    tabBarOptions: {
      showLabel: true,
      // activeTintColor: '#F8F8F8',
      // activeBackgroundColor: "#586589",
      // activeBackgroundColor: "blue",
      // inactiveBackgroundColor: "#F8F8F8",
      // inactiveTintColor: '#586589',
      style: {
        backgroundColor: 'transparent'
      },
      tabStyle: {

      }
    },

  });




const AppStack = createStackNavigator({
  HomePage: {
    screen: HomePage,
    navigationOptions: {
      header: null
    }
  },
  DeckConstructorPage: {
    screen: DeckConstructorPageTabsNavigator,
    // screen: DeckConstructorPage,
    navigationOptions: {
      header: null,
      gesturesEnabled: true
    }
  },
  DuelingRoomPage: {
    screen: DuelingRoomPage,
    navigationOptions: {
      header: null,
      gesturesEnabled: false,

    }
  },
  DraggableDuelingRoomPage: {
    screen: DraggableRoomHostBoard,
    navigationOptions: {
      header: null,
      gesturesEnabled: false,

    }
  },
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
        <Root>
          <Yugioh />
        </Root>

      </Provider>
    )
  }
}


