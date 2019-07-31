import { firestore, firebaseApp, auth, functions } from "./Fire"
import firebase from 'firebase';
import NumericInput from 'react-native-numeric-input'

const updateLifePointsField = (val) => {

}

const updateUserInfo = (obj) => {
    firestore.collection("users").doc(obj.username).set({ name: obj.name, email: obj.email, username: obj.username, hostedBy: "", hosting: false, decks: [] }, { merge: true })
    var authUser = auth.currentUser;
    authUser.updateProfile({
        displayName: obj.username
    }).then(function () {
        //
    }).catch(function (error) {
        // An error happened.
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
    const extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster"]
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
    const extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster"]
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
    //
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

const addCardsToDeck = async (obj) => {
    //check if card exists in "deck" model
    //if exists, increase quantity property by one 
    //else add card to deck model and set quantity property to 1
    const extraDeckTypes = ["XYZ Monster", "Synchro Monster", "Fusion Monster", "Link Monster"]

    if (extraDeckTypes.includes(obj.card.type)) {
        const { extraDeck } = await retrieveCardsFromDeck(obj)
        const filt = extraDeck.filter(card => card.id == obj.card.id)
        //check if card exists in "deck" model
        //if exists, increase quantity property by one 
        console.log('obj.card', obj.card)
        let maxQuant = 3
        if ('banlist_info' in obj.card) {
            if (obj.card["banlist_info"]["ban_tcg"] == "Limited") {
                maxQuant = 1
            } else if (obj.card["banlist_info"]["ban_tcg"] == "Semi-Limited") {
                maxQuant = 2
            }
        }
        if (filt.length && filt[0].quantity <= maxQuant) {
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
            return firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "extraDeck": firebase.firestore.FieldValue.arrayUnion(obj.card)
            })
        }

    } else {
        const { mainDeck } = await retrieveCardsFromDeck(obj)
        const filt = mainDeck.filter(card => card.id == obj.card.id)
        console.log('obj.card', obj.card)
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
            return firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
                "mainDeck": firebase.firestore.FieldValue.arrayUnion(obj.card)
            })
        }
    }
}

const retrieveDeckInfo = (username) => {
    return firestore.collection("users").doc(username).get().then(info => info.data())
}
const retrieveCardsFromDeck = (obj) => {
    //

    return firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).get().then(info => info.data())
}

const hostDuel = (obj) => {
    firestore.collection("rooms").doc(obj).set({ host: obj, opponent: "", linkZones: [{ card: { exists: false, defensePosition: false, user: "" } }, { card: { exists: false, defensePosition: false, user: "" } }], hostBoard: { requestingAccessToGraveyard: { popupVisible: false, approved: false }, hand: [], link: [{ card: { exists: false } }, { card: { exists: false } }], st: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m1: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m2: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], graveyard: [], extraDeck: [], banishedZone: [] }, guestBoard: { requestingAccessToGraveyard: { popupVisible: false, approved: false }, hand: [], link: [{ card: { exists: false } }, { card: { exists: false } }], st: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m1: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m2: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], graveyard: [], extraDeck: [], banishedZone: [] } })
    firestore.collection("users").doc(obj).set({ hosting: true }, { merge: true })
}

const returnAvailableDuels = async (requestId) => {
    const snapshot = await firebase.firestore().collection('rooms').get()
    const docsWithRequestIdFiltered = snapshot.docs.filter(doc => doc.id != requestId).map(d => d.data()).filter(c => c.opponent === "").map(d => d.host)
    // filter(d => d.data().opponent === "")
    //
    return docsWithRequestIdFiltered
}
const joinDuel = (obj) => {
    firestore.collection("rooms").doc(obj.hostUsername).update({ opponent: obj.username })
    firestore.collection("users").doc(obj.username).update({ hostedBy: obj.hostUsername })
}

const leaveDuel = async (obj) => {
    const username = obj[0]
    const hostedBy = obj[1]
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

export { updateUserInfo, updateMainDeckInfo, retrieveDeckInfo, retrieveCardsFromDeck, addCardsToDeck, deleteDeck, deleteCard, removeCardsFromDeck, hostDuel, returnAvailableDuels, joinDuel, listenForBoardUpdates, leaveDuel, alterBoard, doubleAlterBoard, requestAccessToGraveyard, approveAccessToGraveyard, dismissRequestAccessToGraveyard, updateLifePointsField, alterLinkZone }
