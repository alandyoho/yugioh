import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { retrieveCardsFromDeck, addCardsToDeck, deleteCard, removeCardsFromDeck } from "../Firebase/FireMethods"

import { RectButton } from 'react-native-gesture-handler';

import Swipeable from 'react-native-gesture-handler/Swipeable';

export default class AppleStyleSwipeableRow extends Component {
    renderItem = ({ item }) => {
        const { currentlyOpenSwipeable } = this.props;
        const onOpen = (event, gestureState, swipeable) => {
            if (currentlyOpenSwipeable && currentlyOpenSwipeable !== swipeable) {
                currentlyOpenSwipeable.recenter();
            }
            this.props.updateCurrentlyOpenSwipeable(swipeable)
        }
        const onClose = () => this.props.updateCurrentlyOpenSwipeable(null)

        return (

            <Swipeable
                style={{ height: 60, flex: 1 }}
                rightButtons={[
                    <TouchableOpacity onPress={async () => await this.props.deleteCard(item)} style={[styles.rightSwipeItem, { backgroundColor: 'red' }]}>
                        <Text style={{
                            fontWeight: '800',
                            fontSize: 18
                        }}>Delete</Text>
                    </TouchableOpacity>,
                ]}
                onRightButtonsOpenRelease={onOpen}
                onRightButtonsCloseRelease={onClose}
            >
                <View style={[styles.listItem]}>
                    <Text
                        style={{ fontSize: 20, fontWeight: '800', }}>{item.name}</Text>
                    <NumericInput
                        containerStyle={{ position: "absolute", right: 10 }}
                        initValue={item.quantity}
                        onChange={value => this.props.updateCardQuantity({ value: value, card: item, username: this.props.user.username, deck: this.state.selectedDeck })}
                        onLimitReached={(isMax, msg) => console.log(isMax, msg)}
                        minValue={1}
                        maxValue={3}
                        totalWidth={120}
                        totalHeight={25}
                        iconSize={25}
                        step={1}
                        editable={false}
                        valueType='real'
                        rounded
                        textColor='#B0228C'
                        iconStyle={{ color: 'white' }}
                        rightButtonBackgroundColor="rgb(130, 69, 91)"
                        leftButtonBackgroundColor="rgb(130, 69, 91)" />
                </View>
            </Swipeable>
        )
    }
}

const styles = StyleSheet.create({
    leftAction: {
        flex: 1,
        backgroundColor: '#497AFC',
        justifyContent: 'center',
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'transparent',
        padding: 10,
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    deckSearchTextInput: {
        alignItems: "center",
        left: 6,
        // fontFamily: "Merriweather-Bold",
        color: "#6F8FA9"
    },
    deckSearchContainer: {
        shadowColor: 'black',
        backgroundColor: "#FFF",
        shadowOffset: { height: 5, width: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        borderRadius: 5,
        width: "83%",
        height: 41,
        alignSelf: "center",
        // top: 94,
        justifyContent: "center",
        // zIndex: 10,
    },

    item: {
        width: 64 * 2.5,
        height: 90 * 2.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
    },
    panelStyles: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: 'center',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20
    },
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    listItem: {
        height: 75,
        flexDirection: "row",
        justifyContent: 'flex-start',
        alignItems: "center",
        flex: 1

    },
    leftSwipeItem: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 20
    },
    rightSwipeItem: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 20
    },
    panelStyles: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: 'center',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20
    },
    searchIcon: {
        position: "absolute",
        height: 13,
        width: 13,
        right: 10,
    }
});
