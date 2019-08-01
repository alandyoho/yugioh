import React, { Component } from 'react';
import {
    View,
    Image, Dimensions
} from 'react-native';
import * as firebase from "firebase"
import { createUser, updateDeckList } from "./actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrieveDeckInfo, retrieveCardsFromDeck } from "../Firebase/FireMethods"
import { Asset } from 'expo-asset';
import { setCustomText } from 'react-native-global-props';
import { Font } from "expo"


// import MatrixRegularSmallCaps from "../assets/MatrixRegularSmallCaps.ttf"




function cacheImages(images) {
    return images.map(image => {
        if (typeof image === 'string') {
            return Image.prefetch(image);
        } else {
            return Asset.fromModule(image).downloadAsync();
        }
    });
}
async function cacheFonts(font) {
    return Font.loadAsync(font)
}

class AuthLoadingScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        }
        this.authSubscription()
    }
    authSubscription = async () => {
        await setTimeout(async () => {
            await firebase.auth().onAuthStateChanged(async (user) => {
                if (user && user.displayName) {




                    //
                    try {
                        this.props.createUser({ username: user.displayName, email: user.email })
                        const { decks } = await retrieveDeckInfo(user.displayName)


                        console.log(decks)
                        let cardImgs = []
                        for (let i = 0; i < decks.length; i++) {
                            const { mainDeck, extraDeck } = await retrieveCardsFromDeck({ username: user.displayName, deck: decks[i] })
                            for (let j = 0; j < mainDeck.length; j++) {
                                const cardImg = mainDeck[j]["card_images"][0]["image_url_small"]
                                cardImgs.push(cardImg)
                            }
                        }
                        await this._loadAssetsAsync(cardImgs)
                        this.props.navigation.navigate("App")




                        this.props.updateDeckList(decks)
                    } catch (err) {
                        console.error(err)
                    }
                } else {
                    this.props.navigation.navigate("Auth")
                }
            })
        }, 5000)
    }
    async _loadAssetsAsync(images = []) {
        // const fontAssets = cacheFonts(MatrixRegularSmallCaps);
        const imageAssets = cacheImages([
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
            require("../assets/yugioh_gif1.gif"),
            require("../assets/yugioh_gif2.gif"),
            ...images
        ]);
        await Promise.all([...imageAssets]);

    }



    render() {
        return (
            <View style={{ backgroundColor: "black", flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Image source={require('../assets/yugioh_gif2.gif')} style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height, zIndex: 0, position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }} />
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
        createUser, updateDeckList
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AuthLoadingScreen);