import React, { Component } from "react"
import { View, Text, StyleSheet, Dimensions, Image, SectionList, TextInput, Animated } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import FadeScaleImage from "../ComplexComponents/FadeScaleImage"
import FriendRow from "./FriendRow"
import FriendRequestRow from "./FriendRequestRow"
import FriendSearchRow from "./FriendSearchRow"
import { addFriend, retrieveFriendInfo, deleteFriendRequest, retrieveUsers, sendFriendRequest } from "../../Firebase/FireMethods"

export default class FriendsComponent extends Component {
    constructor() {
        super()
        this.state = { friends: [], requests: [], height: new Animated.Value(0), searchResults: [], expanded: false, refreshing: false }
    }
    expanded = false
    addFriend = async (user) => {
        await addFriend({ name: user.username, username: this.props.user.username })
        this.setState({ requests: [...this.state.requests].filter(friend => friend.username !== user.username), friends: [...this.state.friends, user] })
    }
    deleteFriendRequest = async (user) => {
        await deleteFriendRequest({ name: user.username, username: this.props.user.username })
        this.setState({ requests: [...this.state.requests].filter(friend => friend.username !== user.username) })
    }
    async componentDidMount() {
        await this.retrieveInfo()
    }
    retrieveInfo = async () => {
        let { friends, requests } = await retrieveFriendInfo(this.props.user.username)
        this.setState({ friends: friends, requests: requests, refreshing: false })
    }

    renderItem = (item, index, section) => {
        if (section.title === "Friends") {
            return (
                <FriendRow item={item} />
            )
        } else {
            return (
                <FriendRequestRow item={item} addFriend={this.addFriend} deleteFriendRequest={this.deleteFriendRequest} />
            )
        }
    }
    retrieveUsers = async (search) => {
        console.log("search", search)
        if (search.length === 0) {
            this.contractSearchView()
        } else {
            if (!this.expanded) {
                this.expandSearchView()
            }
        }
        let result = await retrieveUsers(search)
        let friends = this.state.friends.map((friend) => friend.username)
        result = result.filter(friend => !friends.includes(friend.username))
        this.setState({ searchResults: result })

    }
    expandSearchView = () => {
        let height = Dimensions.get("window").height * 0.60
        Animated.timing(this.state.height, {
            toValue: height,
            duration: 500,
        }).start();
        this.expanded = true
    }
    contractSearchView = () => {
        Animated.timing(this.state.height, {
            toValue: 0,
            duration: 500,
        }).start();
        this.expanded = false

    }
    sendFriendRequest = async (item) => {
        //trigger a function in firemethods
        console.log("in send friend request")
        this.contractSearchView()
        await sendFriendRequest({ item, username: this.props.user.username })
        //add the current user's username to the passed in item's friend request array in db
    }
    handleRefresh = () => {
        this.setState({
            refreshing: true,
        }, () => {
            this.retrieveInfo()
        })
    }
    render() {
        const { friends, requests, searchResults } = this.state
        return (
            <View style={{ flex: 1 }}>
                <View style={{ ...styles.deckSearchContainer, zIndex: 6 }}>
                    <TextInput placeholderTextColor={"black"} placeholder={"Search for a new friend..."} style={styles.deckSearchTextInput} onChangeText={(search) => this.retrieveUsers(search)} onFocus={this.expandSearchView} returnKeyType={"search"} autoCorrect={false} autoCapitalize={"none"} />
                    <FadeScaleImage source={require("../../assets/searchIcon.png")} style={styles.searchIcon} />
                </View>
                <Animated.View style={{ height: this.state.height, width: "100%", position: "absolute", zIndex: 5, top: 0, left: 0, right: 0, backgroundColor: "#FFF", borderRadius: 5 }}>
                    <FlatList
                        refreshing={this.state.refreshing}
                        onRefresh={this.handleRefresh}
                        renderItem={({ item, index }) => <FriendSearchRow item={item} sendFriendRequest={this.sendFriendRequest} />}
                        data={searchResults}
                        keyExtractor={(item, index) => item + index}
                        style={{ top: 50 }}
                    />
                </Animated.View>
                <SectionList
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                    renderItem={({ item, index, section }) => this.renderItem(item, index, section)}
                    stickySectionHeadersEnabled={false}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            fontWeight: "800",
                            fontSize: 20
                        }}>{title}</Text>
                    )}
                    sections={[
                        { title: 'Friends', data: friends },
                        { title: 'Friend Requests', data: requests },
                    ]}
                    keyExtractor={(item, index) => item + index}
                />
            </View>
        )
    }
}




const styles = StyleSheet.create({
    deckSearchTextInput: {
        alignItems: "center",
        left: 6,
        color: "#6F8FA9"
    },
    deckSearchContainer: {
        shadowColor: 'black',
        backgroundColor: "#FFF",
        shadowOffset: { height: 5, width: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        borderRadius: 5,
        width: "100%",
        height: 41,
        alignSelf: "center",
        // top: 94,
        justifyContent: "center",
        // zIndex: 10,
    },
    searchIcon: {
        position: "absolute",
        height: 13,
        width: 13,
        right: 10,
    },
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
        height: 80,
        // paddingVertical: 10,
        // paddingHorizontal: 20,
        // justifyContent: 'space-between',
        flexDirection: 'column',
        flex: 1,
        // borderRadius: 10,
        // shadowColor: 'grey',
        backgroundColor: "#FFF",
        // shadowOffset: { height: 0.25, width: 0.25 },
        // shadowOpacity: 0.8,
        // shadowRadius: 2.5,
        // borderRadius: 2.5,
        width: "100%",
        // height: 41,
        // alignSelf: "center",
        // top: 94,
        // justifyContent: "center",
        // zIndex: 10,
    },
    rectButtonContainer: {
        width: "100%",
        flex: 1,
        height: 120,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        flexDirection: 'row',
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