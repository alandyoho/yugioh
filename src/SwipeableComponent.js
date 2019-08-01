import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions } from 'react-native';
import NumericInput from 'react-native-numeric-input'

import { RectButton } from 'react-native-gesture-handler';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);


const Row = ({ item, updateCardQuantity, username, selectedDeck }) => (
    <View style={styles.rectButtonContainer}>
        <View style={styles.rectButton} >
            <Text style={styles.fromText}>{item.name}</Text>
            <NumericInput
                containerStyle={{ left: 20, top: 0 }}
                initValue={item.quantity}
                onChange={value => updateCardQuantity({ value: value, card: item, username: username, deck: selectedDeck })}
                onLimitReached={(isMax, msg) => console.log("limit")}
                minValue={1}
                maxValue={3}
                totalWidth={120}
                totalHeight={20}
                iconSize={25}
                step={1}
                editable={false}
                valueType='real'
                rounded
                textColor='#B0228C'
                iconStyle={{ color: 'white' }}
                rightButtonBackgroundColor="rgb(130, 69, 91)"
                leftButtonBackgroundColor="rgb(130, 69, 91)" />


            <Text style={styles.dateText}>
                {'❭'}
            </Text>
        </View>
    </View>
);

export default class AppleStyleSwipeableRow extends Component {
    renderRightActions = (progress, dragX) => {
        const scale = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
        return (
            <RectButton style={styles.rightAction} onPress={this.close}>
                <AnimatedIcon
                    name="delete-forever"
                    size={30}
                    color="#fff"
                    style={[styles.actionIcon, { transform: [{ scale }] }]}
                />
            </RectButton>
        );
    };
    updateRef = ref => {
        this._swipeableRow = ref;
    };
    close = async () => {
        await this.props.deleteCard(this.props.item)
        this._swipeableRow.close();
    };
    render() {
        const { children } = this.props;
        return (
            <Swipeable
                ref={this.updateRef}
                friction={2}
                rightThreshold={40}
                renderRightActions={this.renderRightActions}>
                <Row item={this.props.item} updateCardQuantity={this.props.updateCardQuantity} username={this.props.username} selectedDeck={this.props.selectedDeck} />


            </Swipeable>
        );
    }
}

const styles = StyleSheet.create({
    leftAction: {
        flex: 1,
        backgroundColor: '#388e3c',
        justifyContent: 'center',
    },
    actionIcon: {
        width: 30,
        marginHorizontal: 10,
    },
    rightAction: {
        alignItems: 'flex-end',
        backgroundColor: '#dd2c00',
        flex: 1,
        justifyContent: 'center',
    },
    rectButton: {
        // flex: 1,
        // width: Dimensions.get("window").width * 0.80,
        height: 40,
        // paddingVertical: 10,
        // paddingHorizontal: 20,
        // justifyContent: 'space-between',
        flexDirection: 'column',
        borderRadius: 10,

        shadowColor: 'black',
        backgroundColor: "#FFF",
        shadowOffset: { height: 0.5, width: 0.5 },
        shadowOpacity: 0.8,
        shadowRadius: 2.5,
        borderRadius: 2.5,
        width: Dimensions.get("window").width * 0.90,
        height: 41,
        // alignSelf: "center",
        // top: 94,
        // justifyContent: "center",
        // zIndex: 10,
    },
    rectButtonContainer: {
        width: Dimensions.get("window").width,
        flex: 1,
        height: 60,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        flexDirection: 'column',
        backgroundColor: 'white',
    },
    separator: {
        backgroundColor: 'rgb(200, 199, 204)',
        height: StyleSheet.hairlineWidth,
    },
    fromText: {
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        fontSize: 18,
        left: 20
    },
    messageText: {
        color: '#999',
        backgroundColor: 'transparent',
        fontSize: 15
    },
    dateText: {
        backgroundColor: 'transparent',
        position: 'absolute',
        right: 20,
        top: 10,
        color: '#999',
        fontWeight: 'bold',
    },
});