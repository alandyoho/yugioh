import React, { Component } from 'react';
import {
    View,
    Image,
} from 'react-native';
import * as firebase from "firebase"
import { createUser, updateDeckList } from "./actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrieveDeckInfo, retrieveCardsFromDeck } from "../Firebase/FireMethods"
import { Asset } from 'expo-asset';



function cacheImages(images) {
    return images.map(image => {
        if (typeof image === 'string') {
            return Image.prefetch(image);
        } else {
            return Asset.fromModule(image).downloadAsync();
        }
    });
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
        const imageAssets = cacheImages([
            require("../assets/1.gif"),
            require("../assets/3.gif"),
            require("../assets/4.gif"),
            require("../assets/5.gif"),
            require("../assets/6.gif"),
            require("../assets/7.gif"),
            require("../assets/8.gif"),
            require("../assets/background-0.png"),
            require("../assets/background-1.png"),
            require("../assets/background-2.png"),
            require("../assets/background-3.png"),
            require("../assets/background-4.png"),
            require("../assets/background-5.png"),
            require("../assets/background-6.png"),
            require("../assets/yugi-loading.gif"),
            require("../assets/arrow.png"),
            require("../assets/default_card.png"),
            require("../assets/downArrow.png"),
            require("../assets/overview.png"),
            require("../assets/searchIcon.png"),
            require("../assets/skeletonscreen.gif"),
            require("../assets/upArrow.png"),
            ...images
        ]);
        await Promise.all([...imageAssets]);
    }



    render() {
        return (
            <View style={{ backgroundColor: "white", flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Image source={require('../assets/textLoading.gif')} resizeMode="contain" style={{
                    height: "30%",
                }}
                />
                <Image source={require('../assets/loading.gif')} />
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