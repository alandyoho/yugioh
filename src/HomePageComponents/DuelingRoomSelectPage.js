import React, { Component } from "react"
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Button } from 'react-native-elements';
import { hostDuel, returnAvailableDuels, joinDuel } from "../../Firebase/FireMethods"
import FriendRow from "./FriendRow"

export default class DuelingRoomSelectPage extends Component {
    constructor() {
        super()
        this.state = {
            rooms: [],
            refreshing: false

        }
    }
    async componentDidMount() {
        await this.retrieveInfo()
    }

    retrieveInfo = async () => {
        const rooms = await returnAvailableDuels(this.props.user.username)
        this.setState({ rooms, refreshing: false })
    }
    hostDuel = () => {
        // hostDuel(this.props.user.username)
        this.props.fadeOutDuelingRoomSelectPage("Host")
    }
    joinDuel = (obj) => {
        // joinDuel(obj)
        this.props.fadeOutDuelingRoomSelectPage(obj)
    }

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={{ flex: 1 }} onPress={() => this.joinDuel({ hostUsername: item.username, username: this.props.user.username })}>
                <FriendRow item={item} />
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
    handleRefresh = () => {
        this.setState({
            refreshing: true,
        }, () => {
            this.retrieveInfo()
        })
    }
    render() {
        return (
            <View style={{ ...styles.container, borderRadius: 5, backgroundColor: "#FFF" }}>
                <View style={{ flex: 11 / 16 }}>
                    <React.Fragment>
                        {this.state.rooms.length ? <Text style={{ fontSize: 30, alignSelf: "center" }}>Join Room</Text> : <Text style={{ fontSize: 30, alignSelf: "center" }}>No Available Rooms</Text>}
                        <FlatList
                            data={this.state.rooms}
                            refreshing={this.state.refreshing}
                            onRefresh={this.handleRefresh}
                            renderItem={(item) => this.renderItem(item)}
                            keyExtractor={(item, index) => index.toString()}
                            ItemSeparatorComponent={this.FlatListItemSeparator}
                            style={{ paddingVertical: 25 }}
                        />
                    </React.Fragment>

                </View>
                <View style={{ flex: 5 / 16, flexDirection: "column", justifyContent: "flex-start" }}>
                    <Text style={{ fontSize: 15, alignSelf: "center" }}>—or—</Text>
                    <Button
                        title="Create Room"
                        titleStyle={{
                            color: 'white',
                            fontWeight: '800',
                            fontSize: 18,

                        }}
                        buttonStyle={{
                            backgroundColor: 'rgb(130, 69, 91)',
                            marginTop: 10,
                            borderRadius: 10,
                            height: 50,
                            alignSelf: "center",
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
        borderRadius: 5,
        backgroundColor: "#FFF"
    },
    listItem: {
        height: 75,
        alignItems: 'center',
        justifyContent: 'center',
        width: Dimensions.get("window").width
    },
})
