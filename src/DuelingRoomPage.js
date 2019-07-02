import React, { Component } from "react"
import moment from "moment"
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity, FlatList } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { hostDuel, returnAvailableDuels, joinDuel } from "../Firebase/FireMethods"

class DuelingRoomPage extends Component {
    constructor() {
        super()
        this.state = {
            rooms: [],
            hostedRoom: null
        }
    }
    async componentDidMount() {
        const rooms = await returnAvailableDuels(this.props.user.username)
        this.setState({ rooms })
    }

    renderItem = ({ item }) => {
        const { currentlyOpenSwipeable } = this.state;
        const onOpen = (event, gestureState, swipeable) => {
            if (currentlyOpenSwipeable && currentlyOpenSwipeable !== swipeable) {
                currentlyOpenSwipeable.recenter();
            }

            this.setState({ currentlyOpenSwipeable: swipeable });
        }
        const onClose = () => this.setState({ currentlyOpenSwipeable: null })

        return (
            <TouchableOpacity style={[styles.listItem, { alignSelf: "flex-start", backgroundColor: 'white' }]} onPress={() => joinDuel({ hostUsername: item, username: this.props.user.username })}>
                <Text style={{ fontSize: 20, alignSelf: "flex-start" }}>{`${item}`}</Text>
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
                    <Text style={{ fontSize: 30, alignSelf: "center" }}>Available Rooms</Text>
                    <FlatList
                        data={this.state.rooms}
                        renderItem={(item) => this.renderItem(item)}
                        keyExtractor={(item, index) => index.toString()}
                        ItemSeparatorComponent={this.FlatListItemSeparator}
                    />
                </View>
                <View style={{ flex: 1 / 4 }}>
                    <Text style={{ fontSize: 30, alignSelf: "center" }}>Hosted Room</Text>
                    {!this.state.hostedRoom ? <Button
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
                            width: Dimensions.get("window").width - 64,
                            height: 50,
                            alignSelf: "center"
                        }}
                        loading={false}
                        onPress={() => {
                            this.setState({ hostedRoom: true })
                            hostDuel(this.props.user.username)
                        }}
                    /> : <Text>{this.props.user.username}</Text>}
                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: '#FFF',
        // justifyContent: 'center',
        // alignItems: 'center'
    },
    listItem: {
        height: 75,
        alignItems: 'center',
        justifyContent: 'center',
        width: Dimensions.get("window").width
    },
})




const mapStateToProps = (state) => {
    const { user, cards } = state
    return { user, cards }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({

    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DuelingRoomPage);