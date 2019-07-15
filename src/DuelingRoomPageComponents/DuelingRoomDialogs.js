import React, { Component } from "react"
import { View, Image, Text, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';
import { addCardToBoard } from "../../Firebase/FireMethods";

const DuelingRoomDialogs = ({ waitingForOpponentPopupVisible, cardPopupVisible, dismissCardPopup, cardOptionsPresented, fadeOutHand, board, addCardToBoard, cardOnFieldPressedPopupVisible, manageCardOnBoard, cardType, toggleExaminePopup, examinePopupVisible }) => {
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
                                <TouchableOpacity onPress={() => fadeOutHand("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Normal")}>
                                    <Text>Normal Summon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Special")}>
                                    <Text>Special Summon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Set-Monster")}>
                                    <Text>Set</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => dismissCardPopup("Send-To-Graveyard") && addCardToBoard([board, "graveyard", 1])}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <TouchableOpacity onPress={() => fadeOutHand("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Activate")}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => fadeOutHand("Set-ST")}>
                                    <Text>Set</Text>
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
                        {cardType.type.includes("Monster") ?
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Change-Position")}>
                                    <Text>Change Position</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Send-To-Graveyard")}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Return-To-Hand")}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                {cardType.set && <TouchableOpacity onPress={() => manageCardOnBoard("Flip-Summon")}>
                                    <Text>Flip Summon</Text>
                                </TouchableOpacity>}
                            </React.Fragment>

                            :
                            <React.Fragment>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Examine")}>
                                    <Text>Examine</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Send-To-Graveyard")}>
                                    <Text>Send to Graveyard</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => manageCardOnBoard("Return-To-Hand")}>
                                    <Text>Return to Hand</Text>
                                </TouchableOpacity>
                                {cardType.set && <TouchableOpacity onPress={() => manageCardOnBoard("Activate-Facedown")}>
                                    <Text>Activate</Text>
                                </TouchableOpacity>}
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

                // footer={
                //     <DialogFooter>
                //         <DialogButton
                //             style={{ backgroundColor: "rgb(130, 69, 91)", borderRadius: 30 }}
                //             textStyle={{ color: "white" }}
                //             text="Add To Deck"
                //             onPress={() => this.addCard(this.state.selectedCard)}
                //         />
                //     </DialogFooter>
                // }
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






        </React.Fragment>
    )

}


export default DuelingRoomDialogs