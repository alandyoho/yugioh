import React, { Component } from 'react';
import {
    View,
    Image, Dimensions
} from 'react-native';
import * as firebase from "firebase"
import { createUser, updateDeckList, updatePreferences } from "./actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrieveDeckInfo, retrieveCardsFromDeck } from "../Firebase/FireMethods"
import { Asset } from 'expo-asset';
import * as Font from "expo-font"
import { FadeImage } from "./ComplexComponents"
import MatrixRegularSmallCaps from "../assets/MatrixRegularSmallCaps.ttf"
import { AsyncStorage } from 'react-native';

function cacheImages(images) {
    return images.map(image => {
        if (typeof image === 'string') {
            return Image.prefetch(image);
        } else {
            return Asset.fromModule(image).downloadAsync();
        }
    });
}
// async function cacheFonts(font) {
//     return Font.loadAsync(font)
// }

class AuthLoadingScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        }
        this.authSubscription()
    }
    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('sound-preferences');
            if (value !== null) {
                // We have data!!
                const valueAsObj = JSON.parse(value)

                return valueAsObj
            }
        } catch (error) {

        }
    };

    authSubscription = async () => {
        await setTimeout(async () => {
            await firebase.auth().onAuthStateChanged(async (user) => {
                if (user && user.displayName) {
                    try {
                        const userFromDB = await retrieveDeckInfo(user.displayName)
                        this.props.createUser(userFromDB)
                        const preferences = await this._retrieveData()
                        this.props.updatePreferences(preferences)

                        let cardImgs = []
                        // for (let i = 0; i < userFromDB.decks.length; i++) {
                        //     const { mainDeck, extraDeck } = await retrieveCardsFromDeck({ username: userFromDB.username, deck: userFromDB.decks[i] })
                        //     for (let j = 0; j < mainDeck.length; j++) {
                        //         const cardImg = mainDeck[j]["card_images"][0]["image_url_small"]
                        //         cardImgs.push(cardImg)
                        //     }
                        // }
                        await this._loadAssetsAsync(cardImgs)
                        this.props.navigation.navigate("App")
                        this.props.updateDeckList(userFromDB.decks)
                    } catch (err) {
                        console.error(err)
                    }
                } else {
                    await this._loadAssetsAsync()
                    this.props.navigation.navigate("Auth")
                }
            })
        }, 3000)
    }
    async _loadAssetsAsync(images = []) {
        await Font.loadAsync({
            'MatrixRegularSmallCaps': require('../assets/MatrixRegularSmallCaps.ttf'),
        });

        const imageAssets = cacheImages([
            require("../assets/friendRequestLoadingSmall.gif"),
            require("../assets/background-0.png"),
            require("../assets/background-1.png"),
            require("../assets/background-2.png"),
            require("../assets/background-3.png"),
            require("../assets/background-4.png"),
            require("../assets/background-5.png"),
            require("../assets/background-6.png"),
            require("../assets/background-7.png"),
            require("../assets/background-8.png"),
            require("../assets/background-9.png"),
            require("../assets/yugi-loading.gif"),
            require("../assets/arrow.png"),
            require("../assets/default_card.png"),
            require("../assets/downArrow.png"),
            require("../assets/overview.png"),
            require("../assets/searchIcon.png"),
            require("../assets/skeletonscreen.gif"),
            require("../assets/upArrow.png"),
            // require("../assets/yugioh_gif1.gif"),
            // require("../assets/yugioh_gif2.gif"),
            require("../assets/returnToHand.gif"),
            ...images
        ]);
        await Promise.all([...imageAssets]);

    }
    render() {
        return (
            <View style={{ backgroundColor: "black", flex: 1, justifyContent: "center", alignItems: "center" }}>
                <FadeImage source={require('../assets/yugioh_gif2.gif')} style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height, zIndex: 0, position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, cards } = state
    return { user, cards }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        createUser, updateDeckList, updatePreferences
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AuthLoadingScreen);