import React, { Component } from "react"
import { View, Image, Text, Dimensions, FlatList } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';
import { addCardToBoard } from "../../Firebase/FireMethods";

const DuelingRoomDialogs = ({ waitingForOpponentPopupVisible, cardPopupVisible, dismissCardPopup, cardOptionsPresented, fadeOutHand, board, addCardToBoard, cardOnFieldPressedPopupVisible, manageCardOnBoard, cardType, toggleExaminePopup, examinePopupVisible, graveyardPopupVisible, toggleGraveyardPopup, graveyard = [], manageCardInGraveyard, cardInGraveyardPressed, presentCardInGraveyardOptions, toggleCardInGraveyardOptions, toggleCardInGraveyardOptions1 }) => {
    // const gyLength = () => graveyard && graveyard.length && graveyard.length % 3 === 0 ? 3 : (graveyard.length % 2 === 0 ? 2 : 1)
    const size = Dimensions.get('window').width / 3;
    return (
        <React.Fragment>

            <Dialog
                visible={waitingForOpponentPopupVisible}
                width={0.85}
                height={0.40}
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
                onTouchOutside={() => {
                    dismissCardPopup("")
                }}
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
                                <TouchableOpacity onPress={() => dismissCardPopup("Send-To-Graveyard") && addCardToBoard([board, "graveyard", 1])}>
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
                                <TouchableOpacity onPress={() => dismissCardPopup("Send-To-Graveyard") && addCardToBoard([board, "graveyard", 1])}>
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
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={() => {
                    dismissCardPopup("")
                }}
                overlayOpacity={0}
                dialogStyle={{ position: 'absolute', bottom: 250 }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                        {cardType && cardType.type.includes("Monster") ?
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
                onTouchOutside={() => {
                    toggleExaminePopup()
                }}
                dialogAnimation={new ScaleAnimation({
                    initialValue: 0, // optional
                    useNativeDriver: true, // optional
                })}
                width={Dimensions.get("window").width * 0.9}
                height={Dimensions.get("window").height * 0.9}
            >
                <DialogContent>
                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => toggleExaminePopup()}>
                            {cardType.type != "" && <Image
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
                dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={toggleCardInGraveyardOptions1}
                overlayOpacity={0}
                dialogStyle={{ position: 'absolute', bottom: 250 }}
            >

                <DialogContent style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", top: 10, bottom: 10 }}>
                        {cardType && cardType.type.includes("Monster") ?
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Return-To-Hand")}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Special")}>
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
                                <TouchableOpacity onPress={() => manageCardInGraveyard("Activate-Facedown")}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Set-ST")}>
                                    <Text>Set</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        }

                    </View>
                </DialogContent>
            </Dialog>








            <Dialog
                visible={graveyardPopupVisible}
                overlayOpacity={0}
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
                        data={graveyard}
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


        </React.Fragment>
    )

}


export default DuelingRoomDialogs