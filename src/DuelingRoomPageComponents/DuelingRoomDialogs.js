import React, { Component } from "react"
import { View, Image, Text, Dimensions, FlatList, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';
import { addCardToBoard } from "../../Firebase/FireMethods";
import LifePointsCalculator from "../LifePointsCalculator"
import CustomImage from "../ImageLoader"

const DuelingRoomDialogs = ({ waitingForOpponentPopupVisible, cardInHandPressedPopupVisible, dismissCardPopup, cardOptionsPresented, fadeOutHand, board, addCardToBoard, cardOnFieldPressedPopupVisible, manageCardOnBoard, cardType, toggleExaminePopup, examinePopupVisible, graveyardPopupVisible, toggleGraveyardPopup, graveyard = [], manageCardInGraveyard, cardInGraveyardPressed, presentCardInGraveyardOptions, toggleCardInGraveyardOptions, toggleOpponentGraveyardPopup, requestingAccessToGraveyardPopupVisible, opponentGraveyard, extraDeck, extraDeckPopupVisible, toggleExtraDeckPopup, toggleCardInExtraDeckOptions, cardInExtraDeckPressed, manageCardInExtraDeck, hostLifePoints, guestLifePoints, hostLifePointsSelected, calculatorVisible, toggleLifePointsCalculator, returnNewLifePointVal, toggleMainDeckOptions, mainDeckOptionsVisible, drawCard, deck, deckPopupVisible, toggleDeckPopup, toggleCardInDeckOptions, manageCardInDeck, cardInDeckPressed, shuffleDeck, banishedZone, banishedZonePopupVisible, toggleBanishedZonePopup, toggleCardInBanishedZoneOptions, cardInBanishedZonePressed, manageCardInBanishedZone }) => {
    const size = Dimensions.get('window').width / 3
    const HEIGHT = Dimensions.get("window").height * 0.35
    const CANCELHEIGHT = Dimensions.get("window").height * 0.07
    const BUTTONHEIGHT = Dimensions.get("window").height * 0.05
    const WIDTH = Dimensions.get("window").width * 0.95
    const SPACE = Dimensions.get("window").width * 0.025
    return (
        <React.Fragment>


            <Dialog
                visible={cardInGraveyardPressed}
                width={0.95}
                height={0.30}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={() => toggleCardInGraveyardOptions()}
                dialogStyle={{ position: 'absolute', bottom: 0, backgroundColor: "transparent" }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", width: WIDTH, height: Dimensions.get("window").height * 0.30, borderRadius: 10, bottom: 0 }}>
                        {cardType.type && cardType.type.includes("Monster") ?
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Examine")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Return-To-Hand")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Special-GY")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Special Summon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Banish-GY")} style={{ borderColor: "transparent", borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Banish</Text>
                                </TouchableOpacity>
                            </React.Fragment>

                            :
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Examine")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Return-To-Hand")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Activate-GY")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Set-ST-GY")} style={{ borderColor: "transparent", borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Set</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        }

                    </View>
                    <View style={{ borderRadius: 10, backgroundColor: "#FFF", width: WIDTH, height: CANCELHEIGHT, top: SPACE, justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={dismissCardPopup} style={{ width: WIDTH, height: CANCELHEIGHT, justifyContent: "center", alignItems: "center" }}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </DialogContent>
            </Dialog>

            <Dialog
                visible={cardInBanishedZonePressed}
                width={0.95}
                height={0.30}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={() => toggleCardInBanishedZoneOptions()}

                dialogStyle={{ position: 'absolute', bottom: 0, backgroundColor: "transparent" }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", width: WIDTH, height: Dimensions.get("window").height * 0.30, borderRadius: 10, bottom: 0 }}>
                        {cardType.type && cardType.type.includes("Monster") ?
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardInBanishedZone("Examine-BZ")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInBanishedZone("Return-To-Hand-BZ")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInBanishedZone("Special-BZ")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Special Summon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInBanishedZone("Send-To-Graveyard-BZ")} style={{ borderColor: "transparent", borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>

                            :
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardInBanishedZone("Examine-BZ")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInBanishedZone("Return-To-Hand-BZ")}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInBanishedZone("Activate-BZ")}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInBanishedZone("Set-ST-BZ")}>
                                    <Text>Set</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInBanishedZone("Send-To-Graveyard-BZ")}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        }

                    </View>
                    <View style={{ borderRadius: 10, backgroundColor: "#FFF", width: WIDTH, height: CANCELHEIGHT, top: SPACE, justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => toggleCardInBanishedZoneOptions()} style={{ width: WIDTH, height: CANCELHEIGHT, justifyContent: "center", alignItems: "center" }}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </DialogContent>
            </Dialog>


            <Dialog
                visible={banishedZonePopupVisible}
                overlayOpacity={0}
                children={[]}
                onTouchOutside={toggleBanishedZonePopup}
                dialogAnimation={new ScaleAnimation({
                    initialValue: 0, // optional
                    useNativeDriver: true, // optional
                })}
                width={1.0}
                height={0.80}
                dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width, height: Dimensions.get("window").height * 0.80 }}
            >
                <DialogContent style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "white", height: Dimensions.get("window").height * 0.80 }}>
                    <FlatList
                        data={banishedZone}
                        style={{ flex: 1 }}
                        renderItem={({ item }) => (
                            <View style={{
                                width: size,
                                height: size,
                                marginTop: 30,
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <TouchableOpacity style={{ width: 100, height: 200, flexDirection: "row", justifyContent: "center", alignItems: "flex-end" }} onPress={() => toggleCardInBanishedZoneOptions(item)}>
                                    {item["card_images"] && <CustomImage source={{ uri: item["card_images"][0]["image_url_small"] }} resizeMode={"contain"} style={{
                                        width: 100, height: 200
                                    }} />}
                                </TouchableOpacity>
                            </View>
                        )}
                        keyExtractor={item => item.id}
                        numColumns={3} />


                </DialogContent>
            </Dialog>

















            <Dialog
                visible={deckPopupVisible}
                overlayOpacity={0}
                children={[]}
                onTouchOutside={toggleDeckPopup}
                dialogAnimation={new ScaleAnimation({
                    initialValue: 0, // optional
                    useNativeDriver: true, // optional
                })}
                width={1.0}
                height={0.80}
                dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width, height: Dimensions.get("window").height * 0.80 }}
            >
                <DialogContent style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "white", height: Dimensions.get("window").height * 0.80 }}>
                    <FlatList
                        data={deck}
                        style={{ flex: 1 }}
                        renderItem={({ item }) => (
                            <View style={{
                                width: size,
                                height: size,
                                marginTop: 30,
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <TouchableOpacity style={{ width: 100, height: 200, flexDirection: "row", justifyContent: "center", alignItems: "flex-end" }} onPress={() => toggleCardInDeckOptions(item)}>
                                    {item["card_images"] && <CustomImage source={{ uri: item["card_images"][0]["image_url_small"] }} resizeMode={"contain"} style={{
                                        width: 100, height: 200
                                    }} />}
                                </TouchableOpacity>
                            </View>
                        )}
                        keyExtractor={item => item.id}
                        numColumns={3} />


                </DialogContent>
            </Dialog>
            <Dialog
                visible={calculatorVisible}
                width={0.50}
                height={0.50}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={toggleLifePointsCalculator}
                overlayOpacity={0}
                dialogStyle={{ backgroundColor: "transparent" }}
            >

                <DialogContent style={{ flex: 1 }}>
                    <LifePointsCalculator hostLifePoints={hostLifePoints} guestLifePoints={guestLifePoints} hostLifePointsSelected={hostLifePointsSelected} returnNewLifePointVal={returnNewLifePointVal} toggleLifePointsCalculator={toggleLifePointsCalculator} />
                </DialogContent>
            </Dialog>










            <Dialog
                visible={waitingForOpponentPopupVisible}
                width={0.85}
                height={0.40}
                children={[]}
                dialogAnimation={new ScaleAnimation({
                    initialValue: 0, // optional
                    useNativeDriver: true, // optional
                })}
            >
                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                        <Text style={{ fontSize: 20, fontWeight: '800' }}>Waiting for opponent...</Text>
                        <CustomImage source={require("../../assets/yugi-loading.gif")} resizeMode="contain" />
                    </View>
                </DialogContent>
            </Dialog>

            <Dialog
                visible={cardInExtraDeckPressed}
                width={0.95}
                height={0.20}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={() => toggleCardInExtraDeckOptions()}
                // overlayOpacity={0}
                dialogStyle={{ position: 'absolute', bottom: 0, backgroundColor: "transparent" }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", width: WIDTH, height: Dimensions.get("window").height * 0.20, borderRadius: 10, bottom: 0 }}>
                        <React.Fragment>
                            <TouchableOpacity onPress={() => manageCardInExtraDeck("Examine-ED")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                <Text>Examine</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => manageCardInExtraDeck("Special-ED")} style={{ borderColor: "transparent", borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                <Text>Special Summon</Text>
                            </TouchableOpacity>
                        </React.Fragment>
                    </View>
                    <View style={{ borderRadius: 10, backgroundColor: "#FFF", width: WIDTH, height: CANCELHEIGHT, top: SPACE, justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => toggleCardInExtraDeckOptions()} style={{ width: WIDTH, height: CANCELHEIGHT, justifyContent: "center", alignItems: "center" }}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </DialogContent>
            </Dialog>

            <Dialog
                visible={cardInDeckPressed}
                width={0.95}
                height={0.24}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={() => toggleCardInDeckOptions()}
                dialogStyle={{ position: 'absolute', bottom: 0, backgroundColor: "transparent" }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", width: WIDTH, height: Dimensions.get("window").height * 0.21, borderRadius: 10, bottom: 0 }}>
                        <React.Fragment>
                            <TouchableOpacity onPress={() => manageCardInDeck("Examine-D")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                <Text>Examine</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => manageCardInDeck("Add-To-Hand-D")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                <Text>Add to Hand</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => manageCardInDeck("Send-To-Graveyard-D")} style={{ borderColor: "transparent", borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                <Text>Send to Graveyard</Text>
                            </TouchableOpacity>
                        </React.Fragment>
                    </View>
                    <View style={{ borderRadius: 10, backgroundColor: "#FFF", width: WIDTH, height: CANCELHEIGHT, top: SPACE, justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => toggleCardInDeckOptions()} style={{ width: WIDTH, height: CANCELHEIGHT, justifyContent: "center", alignItems: "center" }}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </DialogContent>
            </Dialog>


            <Dialog
                visible={mainDeckOptionsVisible}
                width={0.95}
                height={0.24}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={() => toggleMainDeckOptions()}
                dialogStyle={{ position: 'absolute', bottom: 0, backgroundColor: "transparent" }}
            >
                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", width: WIDTH, height: Dimensions.get("window").height * 0.21, borderRadius: 10, bottom: 0 }}>
                        <React.Fragment>
                            <TouchableOpacity onPress={drawCard} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                <Text>Draw</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleDeckPopup} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                <Text>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={shuffleDeck} style={{ borderColor: "transparent", borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                <Text>Shuffle</Text>
                            </TouchableOpacity>
                        </React.Fragment>
                    </View>
                    <View style={{ borderRadius: 10, backgroundColor: "#FFF", width: WIDTH, height: CANCELHEIGHT, top: SPACE, justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => toggleMainDeckOptions()} style={{ width: WIDTH, height: CANCELHEIGHT, justifyContent: "center", alignItems: "center" }}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </DialogContent>
            </Dialog>

            <Dialog
                visible={cardInHandPressedPopupVisible}
                width={0.95}
                height={cardOptionsPresented && cardOptionsPresented.type.includes("Monster") ? 0.35 : 0.28}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                children={[]}
                onTouchOutside={dismissCardPopup}
                // overlayOpacity={0}
                dialogStyle={{ position: 'absolute', bottom: 0, backgroundColor: "transparent" }}
            // dialogStyle={{ position: 'absolute', bottom: 10, backgroundColor: "red" }}

            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", width: WIDTH, height: cardOptionsPresented && cardOptionsPresented.type.includes("Monster") ? Dimensions.get("window").height * 0.35 : Dimensions.get("window").height * 0.24, borderRadius: 10, bottom: 0 }}>
                        {cardOptionsPresented && cardOptionsPresented.type.includes("Monster") ?
                            <React.Fragment >
                                <TouchableOpacity onPress={() => fadeOutHand("Normal")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Normal Summon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Special")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Special Summon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Set-Monster")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Set</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Examine")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => addCardToBoard([board, "graveyard", 1], "Send-To-Graveyard")} style={{ height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <TouchableOpacity onPress={() => fadeOutHand("Activate")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Set-ST")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Set</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Examine")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => addCardToBoard([board, "graveyard", 1], "Send-To-Graveyard")} style={{ borderColor: "transparent", borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        }
                    </View>
                    <View style={{ borderRadius: 10, backgroundColor: "#FFF", width: WIDTH, height: CANCELHEIGHT, top: SPACE, justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={dismissCardPopup} style={{ width: WIDTH, height: CANCELHEIGHT, justifyContent: "center", alignItems: "center" }}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </DialogContent>
            </Dialog>





            <Dialog
                containerStyle={{ backgroundColor: "transparent" }}
                dialogStyle={{ backgroundColor: 'rgba(52, 52, 52, alpha)' }}
                visible={examinePopupVisible}
                overlayOpacity={0}
                children={[]}
                onTouchOutside={toggleExaminePopup}
                dialogAnimation={new ScaleAnimation({
                    initialValue: 0, // optional
                    useNativeDriver: true, // optional
                })}
                width={Dimensions.get("window").width * 0.9}
                height={Dimensions.get("window").height * 0.9}
            >
                <DialogContent>
                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={toggleExaminePopup}>
                            {cardType.type && <CustomImage
                                source={{ uri: cardType["card_images"][0]["image_url"] }}
                                resizeMode="contain"
                                style={{
                                    height: Dimensions.get("window").height * 0.70,
                                    width: Dimensions.get("window").width * 0.70
                                }}
                            />}
                        </TouchableOpacity>
                    </View>
                </DialogContent>
            </Dialog>


            <Dialog
                visible={cardOnFieldPressedPopupVisible}
                width={0.95}
                height={cardType && cardType.type.includes("Monster") ? 0.30 : (cardType.set ? 0.30 : 0.24)}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={dismissCardPopup}
                // overlayOpacity={0}
                dialogStyle={{ position: 'absolute', bottom: 0, backgroundColor: "transparent" }}
            >
                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", width: WIDTH, height: cardType && cardType.type.includes("Monster") ? Dimensions.get("window").height * 0.30 : (cardType.set ? Dimensions.get("window").height * 0.30 : Dimensions.get("window").height * 0.24), borderRadius: 10, bottom: 0 }}>
                        {cardType.type && cardType.type.includes("Monster") ?
                            <React.Fragment>
                                {cardType.set && <TouchableOpacity onPress={() => manageCardOnBoard("Flip-Summon")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Flip Summon</Text>
                                </TouchableOpacity>}
                                <TouchableOpacity onPress={() => manageCardOnBoard("Examine")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                {!cardType.set && <TouchableOpacity onPress={() => manageCardOnBoard("Change-Position")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Change Position</Text>
                                </TouchableOpacity>}
                                <TouchableOpacity onPress={() => manageCardOnBoard("Return-To-Hand")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Send-To-Graveyard")} style={{ height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>

                            :
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Examine")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Return-To-Hand")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                {cardType.set && <TouchableOpacity onPress={() => manageCardOnBoard("Activate-Facedown")} style={{ borderColor: "transparent", borderBottomColor: 'rgb(200, 199, 204)', borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>}

                                <TouchableOpacity onPress={() => manageCardOnBoard("Send-To-Graveyard")} style={{ borderColor: "transparent", borderWidth: StyleSheet.hairlineWidth, height: BUTTONHEIGHT, width: WIDTH, justifyContent: "center", alignItems: "center" }}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        }

                    </View>
                    <View style={{ borderRadius: 10, backgroundColor: "#FFF", width: WIDTH, height: CANCELHEIGHT, top: SPACE, justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={dismissCardPopup} style={{ width: WIDTH, height: CANCELHEIGHT, justifyContent: "center", alignItems: "center" }}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </DialogContent>
            </Dialog>



            <Dialog
                visible={extraDeckPopupVisible}
                overlayOpacity={0}
                children={[]}
                onTouchOutside={toggleExtraDeckPopup}
                dialogAnimation={new ScaleAnimation({
                    initialValue: 0, // optional
                    useNativeDriver: true, // optional
                })}
                width={1.0}
                height={0.80}
                dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width, height: Dimensions.get("window").height * 0.80 }}
            >
                <DialogContent style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "white", height: Dimensions.get("window").height * 0.80 }}>
                    <FlatList
                        data={extraDeck}
                        style={{ flex: 1 }}
                        renderItem={({ item }) => (
                            <View style={{
                                width: size,
                                height: size,
                                marginTop: 30,
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <TouchableOpacity style={{ width: 100, height: 200, flexDirection: "row", justifyContent: "center", alignItems: "flex-end" }} onPress={() => toggleCardInExtraDeckOptions(item)}>
                                    {item["card_images"] && <CustomImage source={{ uri: item["card_images"][0]["image_url_small"] }} resizeMode={"contain"} style={{
                                        width: 100, height: 200
                                    }} />}
                                </TouchableOpacity>
                            </View>
                        )}
                        keyExtractor={item => item.id}
                        numColumns={3} />


                </DialogContent>
            </Dialog>





            <Dialog
                visible={graveyardPopupVisible}
                overlayOpacity={0}
                children={[]}
                onTouchOutside={toggleGraveyardPopup}
                dialogAnimation={new ScaleAnimation({
                    initialValue: 0, // optional
                    useNativeDriver: true, // optional
                })}
                width={1.0}
                height={0.80}
                dialogStyle={{ backgroundColor: "transparent", width: Dimensions.get("window").width, height: Dimensions.get("window").height * 0.80 }}
            >
                <DialogContent style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "white", height: Dimensions.get("window").height * 0.80 }}>
                    <FlatList
                        data={opponentGraveyard.length ? opponentGraveyard : graveyard}
                        style={{ flex: 1 }}
                        renderItem={({ item }) => (
                            <View style={{
                                width: size,
                                height: size,
                                marginTop: 30,
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <TouchableOpacity style={{ width: 100, height: 200, flexDirection: "row", justifyContent: "center", alignItems: "flex-end" }} onPress={() => toggleCardInGraveyardOptions(item)}>
                                    {item["card_images"] && <CustomImage source={{ uri: item["card_images"][0]["image_url_small"] }} resizeMode={"contain"} style={{
                                        width: 100, height: 200
                                    }} />}
                                </TouchableOpacity>
                            </View>
                        )}
                        keyExtractor={item => item.id}
                        numColumns={3} />


                </DialogContent>
            </Dialog>




            <Dialog
                visible={requestingAccessToGraveyardPopupVisible}
                width={0.40}
                height={0.20}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                containerStyle={{ backgroundColor: "transparent" }}
                onTouchOutside={() => toggleOpponentGraveyardPopup("dismiss")}
                overlayOpacity={0}
                children={[]}
                footer={
                    <DialogFooter>
                        <DialogButton
                            style={{ backgroundColor: "rgb(130, 69, 91)", borderRadius: 30 }}

                            textStyle={{ color: "white" }}
                            text="Approve"
                            onPress={() => toggleOpponentGraveyardPopup("approve")}
                        />
                    </DialogFooter>
                }
                dialogStyle={{ position: 'absolute', bottom: 250 }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                        <Text>Opponent would like to see your graveyard...</Text>

                    </View>
                </DialogContent>
            </Dialog>







        </React.Fragment>
    )

}


export default DuelingRoomDialogs