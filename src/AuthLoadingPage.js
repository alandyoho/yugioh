import React, { Component } from 'react';
import {
    View,
    Image, Dimensions, Animated
} from 'react-native';
import * as firebase from "firebase"
import { createUser, updateDeckList, updatePreferences, updateStoredCardsList } from "./actions"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrieveDeckInfo, retrieveCardsFromDeck } from "../Firebase/FireMethods"
import { Asset } from 'expo-asset';
import * as Font from "expo-font"
import { FadeImage } from "./ComplexComponents"
import MatrixRegularSmallCaps from "../assets/MatrixRegularSmallCaps.ttf"
import { AsyncStorage } from 'react-native';
import * as FileSystem from 'expo-file-system';

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
            loaded: false,
            animatedValue: new Animated.Value(0)
        }
        this.ifNecessaryCreateDirectory()
        this.authSubscription()
    }
    componentDidMount() {
        Animated.timing(this.state.animatedValue, {
            toValue: 150,
            duration: 1500
        }).start();
    }
    ifNecessaryCreateDirectory = async () => {
        const metaDataDir = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "CARD_IMAGES");
        const isDir = metaDataDir.isDirectory;
        if (!isDir) {
            console.log("no directory here")
            try {
                await FileSystem.makeDirectoryAsync(
                    FileSystem.documentDirectory + "CARD_IMAGES",
                    { intermediates: true }
                );
            } catch (e) {
                console.info("ERROR", e);
            }
        } else {
            console.log("directory present")
            // try {
            //     const storedCards = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + "CARD_IMAGES")
            //     console.log("stored cards {1}", storedCards)
            //     storedCardsAsObj = storedCards.reduce(function (result, item, index, array) {
            //         result[item] = true; //a, b, c
            //         return result;
            //     }, {})
            //     console.log("stored cards {2}", storedCardsAsObj)

            //     this.props.updateStoredCardsList(storedCardsAsObj)
            // } catch (e) {
            //     console.info("ERROR,", e)
            // }
        }
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

    createEntry = async (uri) => {
        let parsedURI;
        if (!uri.includes("ygoprodeck.com")) {
            parsedURI = uri.slice(uri.indexOf("/o/") + 3, uri.indexOf("?"))
        } else {
            parsedURI = uri.slice(uri.indexOf("/pics_small/") + 12, uri.indexOf(".jpg"))
            // console.log("card is from ygoprodeck", parsedURI)
        }
        try {
            const createdEntry = await FileSystem.downloadAsync(uri, FileSystem.documentDirectory + "CARD_IMAGES/" + `${parsedURI}.jpg`)
            // console.log("CREATED_ENTRY", createdEntry)
            return createdEntry
        } catch (e) {
            console.log("ERROR_CREATING_ENTRY", e)
        }
    }
    retrieveEntry = async (uri) => {
        let parsedURI;
        if (!uri.includes("ygoprodeck.com")) {
            parsedURI = uri.slice(uri.indexOf("/o/") + 3, uri.indexOf("?"))
            // console.log("card is not from ygoprodeck", parsedURI)
        } else {
            parsedURI = uri.slice(uri.indexOf("/pics_small/") + 12, uri.indexOf(".jpg"))
            // console.log("lookup uri", parsedURI)
        }
        try {
            const retrievedEntry = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "CARD_IMAGES/" + `${parsedURI}.jpg`, { md5: false, size: false })
            // console.log("RETRIEVED_ENTRY", retrievedEntry)
            return retrievedEntry
        } catch (e) {
            console.log("ERROR_RETRIEVING_ENTRY", e)
        }
    }
    retrieveDocumentInfo = async () => {
        try {
            const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "CARD_IMAGES")
            console.log("CARD IMAGES INFO", info)
        } catch (e) {
            console.log("error :(", e)
        }
    }
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
                        let storedCards = {}
                        for (let i = 0; i < userFromDB.decks.length; i++) {
                            const { mainDeck, extraDeck } = await retrieveCardsFromDeck({ username: userFromDB.username, deck: userFromDB.decks[i] })
                            for (let j = 0; j < mainDeck.length; j++) {
                                const cardImg = mainDeck[j]["card_images"][0]["image_url_small"]
                                const info = await this.retrieveEntry(cardImg)
                                if (!info.exists) {
                                    console.log("card is not in file system")
                                    const createdEntry = await this.createEntry(cardImg)
                                    console.log("here's the juice", createdEntry)
                                    storedCards[mainDeck[j].id] = createdEntry.uri
                                    cardImgs.push(createdEntry.uri)
                                } else {
                                    console.log("card image info", info.uri)
                                    storedCards[mainDeck[j].id] = info.uri
                                    cardImgs.push(info.uri)
                                }
                            }
                            for (let j = 0; j < extraDeck.length; j++) {
                                const cardImg = extraDeck[j]["card_images"][0]["image_url_small"]
                                const info = await this.retrieveEntry(cardImg)
                                if (!info.exists) {
                                    console.log("card is not in file system")
                                    const createdEntry = await this.createEntry(cardImg)
                                    console.log("here's the juice", createdEntry)
                                    storedCards[extraDeck[j].id] = createdEntry.uri
                                    cardImgs.push(createdEntry.uri)
                                } else {
                                    console.log("card image info", info.uri)
                                    storedCards[extraDeck[j].id] = info.uri
                                    cardImgs.push(info.uri)
                                }
                            }
                        }
                        this.props.updateStoredCardsList(storedCards)
                        await this._loadAssetsAsync(cardImgs)


                        this.props.navigation.navigate("App")


                        this.props.updateDeckList(userFromDB.decks)
                    } catch (err) {
                        console.log("beans!")
                        console.error(err)
                    }
                } else {
                    await this._loadAssetsAsync()
                    this.retrieveDocumentInfo()
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
            require("../assets/loadingScreen-1.gif"),
            require("../assets/loadingGifAdvanced1.png"),
            require("../assets/loadingGifAdvanced2.png"),
            ...images
        ]);
        await Promise.all([...imageAssets]);
    }


    render() {
        const interpolateColor = this.state.animatedValue.interpolate({
            inputRange: [0, 150],
            outputRange: ['rgb(0,0,0)', 'rgb(230, 77, 61)']
        })


        return (
            <Animated.View style={{ backgroundColor: interpolateColor, flex: 1, justifyContent: "center", alignItems: "center" }}>
                {/* <FadeImage source={require('../assets/textLoading.gif')} style={{ height: 200, width: Dimensions.get("window").width, zIndex: 0, position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }} /> */}
                <FadeImage source={require('../assets/loadingGifAdvanced.gif')} style={{ height: 100, width: 100, zIndex: 0 }} />
            </Animated.View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user, cards } = state
    return { user, cards }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        createUser, updateDeckList, updatePreferences, updateStoredCardsList
    }, dispatch)
);




export default connect(mapStateToProps, mapDispatchToProps)(AuthLoadingScreen);