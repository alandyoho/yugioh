import React, { Component } from "react"
import { View, Image, Text, Dimensions, FlatList } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';
import { addCardToBoard } from "../../Firebase/FireMethods";
import LifePointsCalculator from "../LifePointsCalculator"

const DuelingRoomDialogs = ({ waitingForOpponentPopupVisible, cardPopupVisible, dismissCardPopup, cardOptionsPresented, fadeOutHand, board, addCardToBoard, cardOnFieldPressedPopupVisible, manageCardOnBoard, cardType, toggleExaminePopup, examinePopupVisible, graveyardPopupVisible, toggleGraveyardPopup, graveyard = [], manageCardInGraveyard, cardInGraveyardPressed, presentCardInGraveyardOptions, toggleCardInGraveyardOptions, toggleOpponentGraveyardPopup, requestingAccessToGraveyardPopupVisible, opponentGraveyard, extraDeck, extraDeckPopupVisible, toggleExtraDeckPopup, toggleCardInExtraDeckOptions, cardInExtraDeckPressed, manageCardInExtraDeck, hostLifePoints, guestLifePoints, hostLifePointsSelected, calculatorVisible, toggleLifePointsCalculator, returnNewLifePointVal }) => {
    const size = Dimensions.get('window').width / 3;
    return (
        <React.Fragment>
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
                visible={cardInExtraDeckPressed}
                width={0.40}
                height={0.20}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={toggleCardInExtraDeckOptions}
                overlayOpacity={0}
                dialogStyle={{ position: 'absolute', bottom: 250 }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                        <React.Fragment>
                            <TouchableOpacity onPress={() => manageCardInExtraDeck("Examine-ED")}>
                                <Text>Examine</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => manageCardInExtraDeck("Special-ED")}>
                                <Text>Special Summon</Text>
                            </TouchableOpacity>
                        </React.Fragment>
                    </View>
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
                        <Image source={require("../../assets/yugi-loading.gif")} resizeMode="contain" />
                    </View>
                </DialogContent>
            </Dialog>

            <Dialog
                visible={cardPopupVisible}
                width={0.40}
                height={0.20}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                children={[]}
                onTouchOutside={dismissCardPopup}
                overlayOpacity={0}
                dialogStyle={{ position: 'absolute', bottom: 180 }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                        {cardOptionsPresented && cardOptionsPresented.type.includes("Monster") ?
                            <React.Fragment>
                                <TouchableOpacity onPress={() => fadeOutHand("Normal")}>
                                    <Text>Normal Summon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Special")}>
                                    <Text>Special Summon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Set-Monster")}>
                                    <Text>Set</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => addCardToBoard([board, "graveyard", 1], "Send-To-Graveyard")}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <TouchableOpacity onPress={() => fadeOutHand("Activate")}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Set-ST")}>
                                    <Text>Set</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => addCardToBoard([board, "graveyard", 1], "Send-To-Graveyard")}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        }
                    </View>
                </DialogContent>
            </Dialog>




            <Dialog
                visible={cardOnFieldPressedPopupVisible}
                width={0.40}
                height={0.20}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={dismissCardPopup}
                overlayOpacity={0}
                dialogStyle={{ position: 'absolute', bottom: 250 }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                        {cardType.type && cardType.type.includes("Monster") ?
                            <React.Fragment>
                                {cardType.set && <TouchableOpacity onPress={() => manageCardOnBoard("Flip-Summon")}>
                                    <Text>Flip Summon</Text>
                                </TouchableOpacity>}
                                <TouchableOpacity onPress={() => manageCardOnBoard("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                {!cardType.set && <TouchableOpacity onPress={() => manageCardOnBoard("Change-Position")}>
                                    <Text>Change Position</Text>
                                </TouchableOpacity>}
                                <TouchableOpacity onPress={() => manageCardOnBoard("Return-To-Hand")}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Send-To-Graveyard")}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>

                            :
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Return-To-Hand")}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                {cardType.set && <TouchableOpacity onPress={() => manageCardOnBoard("Activate-Facedown")}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>}

                                <TouchableOpacity onPress={() => manageCardOnBoard("Send-To-Graveyard")}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        }

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
                            {cardType.type && <Image
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
                visible={cardInGraveyardPressed}
                width={0.40}
                height={0.20}
                children={[]}
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={toggleCardInGraveyardOptions}
                overlayOpacity={0}
                dialogStyle={{ position: 'absolute', bottom: 250 }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                        {cardType.type && cardType.type.includes("Monster") ?
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Return-To-Hand")}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Special-GY")}>
                                    <Text>Special Summon</Text>
                                </TouchableOpacity>
                            </React.Fragment>

                            :
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Return-To-Hand")}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Activate-GY")}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Set-ST-GY")}>
                                    <Text>Set</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        }

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
                                    {item["card_images"] && <Image source={{ uri: item["card_images"][0]["image_url_small"] }} resizeMode={"contain"} style={{
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
                                    {item["card_images"] && <Image source={{ uri: item["card_images"][0]["image_url_small"] }} resizeMode={"contain"} style={{
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