import { firestore, firebaseApp, auth, functions, storage } from "./Fire"
import firebase from 'firebase';
import NumericInput from 'react-native-numeric-input'
import uuid from 'uuid';


const updateLifePointsField = (val) => {

}
const clean = (obj) => {
    for (var propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    return obj
}

const updateUserInfo = (obj) => {
    console.log("obj before", obj)
    obj = clean(obj)
    console.log("obj after", obj)

    firestore.collection("users").doc(obj.username).set({ hostedBy: "", hosting: false, decks: [], friends: [], friendRequests: [], ...obj }, { merge: true })
    var authUser = auth.currentUser;
    return authUser.updateProfile({
        displayName: obj.username,
        imageURL: obj.imageURL
    }).then(function () {
        return true
    }).catch(function (error) {
        return false
    });
}

const updateMainDeckInfo = async (obj) => {
    const { decks } = await retrieveDeckInfo(obj.username)
    if (decks && decks.includes(obj.deck)) {
        // //
        return false
    }
    firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).set({
        "mainDeck": [], "extraDeck": []
    })
    return firestore.collection("users").doc(obj.username).update({
        "decks": firebase.firestore.FieldValue.arrayUnion(obj.deck)
    })
}
const deleteDeck = async (obj) => {
    const { decks } = await retrieveDeckInfo(obj.username)
    const refinedDecks = decks.filter(function (ele) {
        return ele != obj.deck;
    });
    firestore.collection("users").doc(obj.username).update({
        "decks": refinedDecks
    })
    firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).delete()
}

const deleteCard = async (obj) => {
    const extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster", "Synchro Tuner Monster"]
    const { mainDeck, extraDeck } = await retrieveCardsFromDeck(obj)

    if (extraDeckTypes.includes(obj.card.type)) {
        const filteredCard = extraDeck.filter(card => card.id != obj.card.id)
        firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).set({
            "extraDeck": filteredCard
        }, { merge: true })
    } else {
        const filteredCard = mainDeck.filter(card => card.id != obj.card.id)
        firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).set({
            "mainDeck": filteredCard
        }, { merge: true })
    }
}
const removeCardsFromDeck = async (obj) => {
    //check quantity property.
    const extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster", "Synchro Tuner Monster"]
    const { mainDeck, extraDeck } = await retrieveCardsFromDeck(obj)
    if (extraDeckTypes.includes(obj.card.type)) {
        const filt = extraDeck.filter(card => card.id == obj.card.id)
        if (filt.length && obj.val == 0) {
            await deleteCard(obj)
        } else {
            firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "extraDeck": firebase.firestore.FieldValue.arrayRemove(filt[0])
            })
            filt[0].quantity = obj.val
            firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "extraDeck": firebase.firestore.FieldValue.arrayUnion(filt[0])
            })
        }
    } else {
        // //
        const filt = mainDeck.filter(card => card.id == obj.card.id)
        if (filt.length && obj.val == 0) {
            await deleteCard(obj)
        } else {
            firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "mainDeck": firebase.firestore.FieldValue.arrayRemove(filt[0])
            })
            filt[0].quantity = obj.val
            firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "mainDeck": firebase.firestore.FieldValue.arrayUnion(filt[0])
            })
        }
    }
    //if quantity property === 1
    //delete card from deck
    //else
    //decrement quantity property by 1
}

const alterBoard = async (obj) => {
    // 
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.location[0]}.${obj.location[1]}`]: obj.zone });
}
const alterLinkZone = async (obj) => {
    //
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.location[0]}`]: obj.updates })
}
const requestAccessToGraveyard = async (obj) => {
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.board}.requestingAccessToGraveyard`]: { popupVisible: true, approved: false } });
}
const dismissRequestAccessToGraveyard = async (obj) => {
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.board1}.requestingAccessToGraveyard`]: { popupVisible: false, approved: false } });
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.board2}.requestingAccessToGraveyard`]: { popupVisible: false, approved: false } });
}
const approveAccessToGraveyard = (obj) => {
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.board1}.requestingAccessToGraveyard`]: { popupVisible: false, approved: false } });
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.board2}.requestingAccessToGraveyard`]: { popupVisible: false, approved: true } });
}

const doubleAlterBoard = async (obj) => {
    // await doubleAlterBoard({ location: cardInfo, zoneOne: boardCopy["graveyard"], zoneTwo: boardCopy[cardZone], hostUsername: this.state.hostedBy })

    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.location[0]}.${obj.location[1]}`]: obj.zoneTwo });
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.location[0]}.graveyard`]: obj.zoneOne });

}
// const manageCardOnBoard = async (obj) => {
//     firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.cardInfo[0]}.${obj.cardInfo[1]}`]: obj.zone })
// }
const uploadImageAsync = async (imageUrl, id) => {
    console.log("uploadURL, beans", imageUrl, id)

    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', imageUrl, true);
        xhr.send(null);
    });
    const ref = storage
        .ref()
        .child(id);
    const snapshot = await ref.put(blob);
    blob.close();
    return await snapshot.ref.getDownloadURL();
}
const addCardsToDeck = async (obj) => {
    //check if card exists in "deck" model
    //if exists, increase quantity property by one 
    //else add card to deck model and set quantity property to 1
    console.log("beans, toast", obj)
    const cardRef = firestore.collection('cards').doc(obj.card.id)
    let oldImgs = obj.card.card_images[0]
    let cardImgUrlSmall;
    let cardImgUrl;
    await cardRef.get().then(async (docSnapshot) => {
        if (!docSnapshot.exists) {
            console.log("card doesn't exist")

            const uploadURL = await uploadImageAsync(oldImgs['image_url'], oldImgs.id)
            const uploadURLSmall = await uploadImageAsync(oldImgs['image_url_small'], `${oldImgs.id}_small`)
            obj.card.card_images[0].image_url = uploadURL
            obj.card.card_images[0].image_url_small = uploadURLSmall
            cardImgUrl = uploadURL
            cardImgUrlSmall = uploadURLSmall

            cardRef.set(obj.card)
        } else {
            let storedCard = docSnapshot.data()

            cardImgUrlSmall = storedCard.card_images[0].image_url_small
            cardImgUrl = storedCard.card_images[0].image_url
        }
    });






    const extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster", "Synchro Tuner Monster"]

    if (extraDeckTypes.includes(obj.card.type)) {
        const { extraDeck } = await retrieveCardsFromDeck(obj)
        const filt = extraDeck.filter(card => card.id == obj.card.id)
        //check if card exists in "deck" model
        //if exists, increase quantity property by one 

        let maxQuant = 3
        if ('banlist_info' in obj.card) {
            if (obj.card["banlist_info"]["ban_tcg"] == "Limited") {
                maxQuant = 1
            } else if (obj.card["banlist_info"]["ban_tcg"] == "Semi-Limited") {
                maxQuant = 2
            }
        }
        if (filt.length && filt[0].quantity <= maxQuant) {
            console.log("old card", filt[0])

            if (filt[0].quantity === maxQuant) return "max quantity reached"
            // const quant = filt[0].quantity
            firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "extraDeck": firebase.firestore.FieldValue.arrayRemove(filt[0])
            })
            filt[0].quantity = obj.val
            firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "extraDeck": firebase.firestore.FieldValue.arrayUnion(filt[0])
            })
        } else {
            obj.card.set = false
            obj.card.quantity = 1
            obj.card.card_images[0].image_url_small = cardImgUrlSmall
            obj.card.card_images[0].image_url = cardImgUrl
            console.log("new card", obj.card)
            return firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "extraDeck": firebase.firestore.FieldValue.arrayUnion(obj.card)
            })
        }

    } else {
        const { mainDeck } = await retrieveCardsFromDeck(obj)
        const filt = mainDeck.filter(card => card.id == obj.card.id)

        let maxQuant = 3
        if ('banlist_info' in obj.card) {
            if (obj.card["banlist_info"]["ban_tcg"] == "Limited") {
                maxQuant = 1
            } else if (obj.card["banlist_info"]["ban_tcg"] == "Semi-Limited") {
                maxQuant = 2
            }
        }
        //check if card exists in "deck" model
        //if exists, increase quantity property by one 
        if (filt.length && filt[0].quantity <= maxQuant) {
            if (filt[0].quantity === maxQuant) return "max quantity reached"
            // const quant = filt[0].quantity
            firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "mainDeck": firebase.firestore.FieldValue.arrayRemove(filt[0])
            })
            filt[0].quantity = obj.val
            firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "mainDeck": firebase.firestore.FieldValue.arrayUnion(filt[0])
            })
        } else {
            obj.card.set = false
            obj.card.quantity = 1
            obj.card.card_images[0].image_url_small = cardImgUrlSmall
            obj.card.card_images[0].image_url = cardImgUrl
            console.log("card!!!", obj.card)
            return firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "mainDeck": firebase.firestore.FieldValue.arrayUnion(obj.card)
            })
        }
    }
}


const retrieveDeckInfo = (username) => {
    return firestore.collection("users").doc(username).get().then(info => info.data())
}
const retrieveCardsFromDeck = async (obj) => {
    return firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).get().then(info => info.data())
}

const hostDuel = (obj) => {
    firestore.collection("rooms").doc(obj).set({ host: obj, opponent: "", linkZones: [{ card: { exists: false, defensePosition: false, user: "" } }, { card: { exists: false, defensePosition: false, user: "" } }], hostBoard: { lifePoints: 8000, requestingAccessToGraveyard: { popupVisible: false, approved: false }, hand: [], link: [{ card: { exists: false } }, { card: { exists: false } }], st: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m1: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m2: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], graveyard: [], extraDeck: [], banishedZone: [] }, guestBoard: { lifePoints: 8000, requestingAccessToGraveyard: { popupVisible: false, approved: false }, hand: [], link: [{ card: { exists: false } }, { card: { exists: false } }], st: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m1: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m2: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], graveyard: [], extraDeck: [], banishedZone: [] } })
    firestore.collection("users").doc(obj).set({ hosting: true }, { merge: true })
}


const updateLifePoints = (obj) => {
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.location[0]}.${obj.location[1]}`]: obj.lifePoints });

}


const joinDuel = (obj) => {
    firestore.collection("rooms").doc(obj.hostUsername).update({ opponent: obj.username })
    firestore.collection("users").doc(obj.username).update({ hostedBy: obj.hostUsername })
}

const leaveDuel = async (obj) => {
    const username = obj[0]
    const hostedBy = obj[1]
    if (obj.length > 2) {
        return firestore.collection("users").doc(username).set({ hostedBy: "", hosting: false }, { merge: true })
    }
    if (username == hostedBy) {
        //request is being made by room host
        //delete room from database
        firestore.collection("rooms").doc(hostedBy).delete()
        //
    } else {
        //request is being made by room guest
        //delete opponent property on room
        firestore.collection("rooms").doc(hostedBy).set({ opponent: "" }, { merge: true })
        //
    }
    firestore.collection("users").doc(username).set({ hostedBy: "", hosting: false }, { merge: true })
}

const listenForBoardUpdates = (obj) => {
    return firestore.collection("rooms").doc(obj).onSnapshot(function (doc) { return doc.data() })
}
const addFriend = async (obj) => {
    await firestore.collection("users").doc(obj.username).update({
        "friends": firebase.firestore.FieldValue.arrayUnion(obj.name)
    })
    await firestore.collection("users").doc(obj.name).update({
        "friends": firebase.firestore.FieldValue.arrayUnion(obj.username)
    })
    await firestore.collection("users").doc(obj.username).update({
        "friendRequests": firebase.firestore.FieldValue.arrayRemove(obj.name)
    })
}
const deleteFriendRequest = async (obj) => {
    await firestore.collection("users").doc(obj.username).update({
        "friendRequests": firebase.firestore.FieldValue.arrayRemove(obj.name)
    })
}


const retrieveUsers = (user) => {
    return firestore.collection("users").where("username", ">=", user).get().then(function (querySnapshot) {
        let data = []
        querySnapshot.forEach(function (doc) {
            data.push(doc.data())
        });
        return data
    })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}
const returnAvailableDuels = async (requestId) => {
    const snapshot = await firebase.firestore().collection('rooms').get()
    const docsWithRequestIdFiltered = snapshot.docs.filter(doc => doc.id != requestId).map(d => d.data()).filter(c => c.opponent === "").map(d => d.host)
    console.log("docs", docsWithRequestIdFiltered)
    let requests = []
    for (friend of docsWithRequestIdFiltered) {
        console.log("friend", friend)
        let info = await retrieveDeckInfo(friend)
        requests.push(info)
    }
    return requests
}
const retrieveFriendInfo = async (user) => {
    let r = []
    let f = []
    let { friendRequests, friends } = await firestore.collection("users").doc(user).get().then(info => info.data())
    for (request of friendRequests) {
        let info = await retrieveDeckInfo(request)
        r.push(info)
    }
    for (friend of friends) {
        let info = await retrieveDeckInfo(friend)
        f.push(info)
    }
    return { requests: r, friends: f }

}

const sendFriendRequest = async (obj) => {
    await firestore.collection("users").doc(obj.item.username).update({
        "friendRequests": firebase.firestore.FieldValue.arrayUnion(obj.username)
    })

    //add the current user's username to the passed in item's friend request array in db

}

const updateUser = (username, obj) => {
    firestore.collection("users").doc(username).update(obj)
        .then(function () {
            return true
        }).catch(function (error) {
            return false
        });
}

export { updateUser, updateUserInfo, updateMainDeckInfo, retrieveDeckInfo, retrieveCardsFromDeck, addCardsToDeck, deleteDeck, deleteCard, removeCardsFromDeck, hostDuel, returnAvailableDuels, joinDuel, listenForBoardUpdates, leaveDuel, alterBoard, doubleAlterBoard, requestAccessToGraveyard, approveAccessToGraveyard, dismissRequestAccessToGraveyard, updateLifePointsField, alterLinkZone, addFriend, retrieveFriendInfo, deleteFriendRequest, retrieveUsers, sendFriendRequest, updateLifePoints }
