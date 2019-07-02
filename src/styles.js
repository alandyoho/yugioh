import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 2,
        borderColor: "#000000",
        marginBottom: 10,
    },
    scrollViewContainer: {
        backgroundColor: "#fff",
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30
    },
    safeAreaViewContainer: {
        flex: 1
    },
    userGreetingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
        paddingTop: 30
    },
    userGreetingContainerText: {
        fontSize: 30,
        fontFamily: "Hiragino-Lighter"
    },
    userAvatarContainer: {
        flex: 3 / 10,
        alignItems: "center"
    },
    tabContainer: {
        flex: 7 / 10,
        paddingLeft: 20
    },
    tabContainerTouchableOpacity: {
        borderWidth: 2,
        borderColor: "#fff",
        padding: 20
    },
    tabContainerContents: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    tabContainerImage: {
        width: 25,
        height: 25
    },
    tabContainerText: {
        fontSize: 20,
        fontFamily: "Hiragino-Lighter"
    }


});

export default styles