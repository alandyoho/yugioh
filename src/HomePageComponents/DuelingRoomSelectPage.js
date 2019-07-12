import React, { Component } from "react"
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Button } from 'react-native-elements';
import { hostDuel, returnAvailableDuels, joinDuel } from "../../Firebase/FireMethods"

export default class DuelingRoomSelectPage extends Component {
    constructor() {
        super()
        this.state = {
            rooms: [],
        }
    }
    async componentDidMount() {
        const rooms = await returnAvailableDuels(this.props.user.username)
        this.setState({ rooms })
    }
    hostDuel = () => {
        hostDuel(this.props.user.username)
        this.props.fadeOutDuelingRoomSelectPage()
    }
    joinDuel = (obj) => {
        joinDuel(obj)
        this.props.fadeOutDuelingRoomSelectPage()
    }

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={[styles.listItem, { alignSelf: "flex-start", backgroundColor: 'white' }]} onPress={() => this.joinDuel({ hostUsername: item, username: this.props.user.username })}>
                <Text style={{ fontSize: 20, alignSelf: "flex-start" }}>{item}</Text>
            </TouchableOpacity>
        )
    }
    FlatListItemSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: "100%",
                    backgroundColor: "#607D8B",
                }}
            />
        );
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 3 / 4 }}>
                    {this.state.rooms.length ?
                        <React.Fragment>
                            <Text style={{ fontSize: 30, alignSelf: "center" }}>Join Room</Text>
                            <FlatList
                                data={this.state.rooms}
                                renderItem={(item) => this.renderItem(item)}
                                keyExtractor={(item, index) => index.toString()}
                                ItemSeparatorComponent={this.FlatListItemSeparator}
                            />
                        </React.Fragment>
                        : <Text style={{ fontSize: 30, alignSelf: "center" }}>No Available Rooms</Text>}
                </View>
                <View style={{ flex: 1 / 4 }}>
                    <Text style={{ fontSize: 15, alignSelf: "center" }}>—or—</Text>
                    <Button
                        title="Create Room"
                        titleStyle={{
                            color: 'white',
                            fontWeight: '800',
                            fontSize: 18
                        }}
                        buttonStyle={{
                            backgroundColor: 'rgb(130, 69, 91)',
                            marginTop: 10,
                            borderRadius: 10,
                            height: 50,
                            alignSelf: "center"
                        }}
                        loading={false}
                        onPress={this.hostDuel}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
    listItem: {
        height: 75,
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%"
    },
})
