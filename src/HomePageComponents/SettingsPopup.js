import React, { Component } from "react"
import { StyleSheet, View, Dimensions, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-elements';
import Dialog, { DialogContent, DialogTitle, DialogFooter, DialogButton, ScaleAnimation } from 'react-native-popup-dialog';
import Swipeable from 'react-native-swipeable';
import { TextInput } from "react-native-gesture-handler";
import { updateMainDeckInfo, retrieveDeckInfo, deleteDeck, hostDuel, joinDuel } from "../../Firebase/FireMethods"
import { AsyncStorage } from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native'


export default class SettingsPopup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            musicEnabled: false,
            soundEffectsEnabled: false,
            dragAndDropEnabled: false
        }
    }
    _storeData = async ({ musicEnabled, soundEffectsEnabled, dragAndDropEnabled }) => {
        try {
            const preferences = { musicEnabled, soundEffectsEnabled, dragAndDropEnabled }
            await AsyncStorage.setItem('sound-preferences', JSON.stringify(preferences));
            this.props.updatePreferences(preferences)
        } catch (error) {

        }
    };
    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('sound-preferences');
            if (value !== null) {
                // We have data!!
                return value
            }
        } catch (error) {

        }
    };
    updateMusicEnabled = async (isOn) => {
        this.setState({ musicEnabled: isOn })
        await this._storeData({ musicEnabled: isOn, soundEffectsEnabled: this.state.soundEffectsEnabled, dragAndDropEnabled: this.state.dragAndDropEnabled })
    }
    updateSoundEffectsEnabled = async (isOn) => {
        this.setState({ soundEffectsEnabled: isOn })
        await this._storeData({ musicEnabled: this.state.musicEnabled, soundEffectsEnabled: isOn, dragAndDropEnabled: this.state.dragAndDropEnabled })
    }
    updateDragAndDropEnabled = async (isOn) => {
        this.setState({ dragAndDropEnabled: isOn })
        await this._storeData({ musicEnabled: this.state.musicEnabled, soundEffectsEnabled: this.state.musicEnabled, dragAndDropEnabled: isOn })
    }


    async componentDidMount() {
        const presets = await this._retrieveData()

        const { musicEnabled, soundEffectsEnabled, dragAndDropEnabled } = JSON.parse(presets)
        this.setState({ musicEnabled, soundEffectsEnabled, dragAndDropEnabled })
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={{ fontSize: 30, alignSelf: "center" }}>Sound Preferences</Text>
                <View style={{ alignSelf: "center", flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", width: "80%" }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', position: "absolute", left: 20 }}>Music</Text>
                    <ToggleSwitch
                        isOn={this.state.musicEnabled}
                        onColor='green'
                        offColor='red'
                        size='small'

                        onToggle={(isOn) => this.updateMusicEnabled(isOn)}
                    />
                </View>

                <View style={{ alignSelf: "center", flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", width: "80%" }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', position: "absolute", left: 20 }}>Sound Effects</Text>
                    <ToggleSwitch
                        isOn={this.state.soundEffectsEnabled}
                        onColor='green'
                        offColor='red'
                        labelStyle={{ color: 'black', fontWeight: '900' }}
                        size='small'
                        onToggle={(isOn) => this.updateSoundEffectsEnabled(isOn)}
                    />
                </View>
                <View style={{ alignSelf: "center", flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", width: "80%" }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', position: "absolute", left: 20 }}>Drag and Drop</Text>
                    <ToggleSwitch
                        isOn={this.state.dragAndDropEnabled}
                        onColor='green'
                        offColor='red'
                        labelStyle={{ color: 'black', fontWeight: '900' }}
                        size='small'
                        onToggle={(isOn) => this.updateDragAndDropEnabled(isOn)}
                    />
                </View>
            </View>
        )
    }
}




const styles = StyleSheet.create({
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
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start"
    },
    listItem: {
        height: 75,
        alignItems: 'center',
        justifyContent: 'center',
        width: Dimensions.get("window").width
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

});