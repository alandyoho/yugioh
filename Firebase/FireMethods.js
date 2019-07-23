import { firestore, firebaseApp, auth, functions } from "./Fire"
import firebase from 'firebase';
import NumericInput from 'react-native-numeric-input'


const updateUserInfo = (obj) => {
    firestore.collection("users").doc(obj.username).set({ name: obj.name, email: obj.email, username: obj.username, hostedBy: "", hosting: false }, { merge: true })
    var authUser = auth.currentUser;
    authUser.updateProfile({
        displayName: obj.username
    }).then(function () {
        console.log("update successful")
    }).catch(function (error) {
        // An error happened.
    });
}
const updateDeckInfo = async (obj) => {
    const { decks } = await retrieveDeckInfo(obj.username)
    if (decks && decks.includes(obj.deck)) {
        // console.log("deck already exists")
        return false
    }
    firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).set({
        "cards": []
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
    const { cards } = await retrieveCardsFromDeck(obj)
    const filteredCard = cards.filter(card => card.name != obj.card)
    firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).set({
        "cards": filteredCard
    })
}
const removeCardsFromDeck = async (obj) => {
    //check quantity property.
    const { cards } = await retrieveCardsFromDeck(obj)
    console.log("cards from deck", cards)
    const filt = cards.filter(card => card.id == obj.card.id)
    if (filt.length && obj.val == 0) {
        await deleteCard(obj)
    } else {
        firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
            "cards": firebase.firestore.FieldValue.arrayRemove(filt[0])
        })
        filt[0].quantity = obj.val
        firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
            "cards": firebase.firestore.FieldValue.arrayUnion(filt[0])
        })
    }
    //if quantity property === 1
    //delete card from deck
    //else
    //decrement quantity property by 1
}

const alterBoard = async (obj) => {
    // console.log("should contain graveyard cards", obj.zone)
    firestore.collection("rooms").doc(obj.hostUsername).update({ [`${obj.location[0]}.${obj.location[1]}`]: obj.zone });
}
const requestAccessToGraveyard = async (obj) => {
    console.log("requesting access (2)", obj)
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
    const { cards } = await retrieveCardsFromDeck(obj)

    const filt = cards.filter(card => card.id == obj.card.id)
    //check if card exists in "deck" model
    //if exists, increase quantity property by one 
    if (filt.length && filt[0].quantity <= 3) {
        if (filt[0].quantity === 3) return "max quantity reached"
        // const quant = filt[0].quantity
        firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
            "cards": firebase.firestore.FieldValue.arrayRemove(filt[0])
        })
        filt[0].quantity = obj.val
        firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
            "cards": firebase.firestore.FieldValue.arrayUnion(filt[0])
        })
    } else {
        obj.card.set = false
        obj.card.quantity = 1
        return firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).update({
            "cards": firebase.firestore.FieldValue.arrayUnion(obj.card)
        })
    }
}

const retrieveDeckInfo = (username) => {
    return firestore.collection("users").doc(username).get().then(info => info.data())
}
const retrieveCardsFromDeck = (obj) => {
    return firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).get().then(info => info.data())
}

const hostDuel = (obj) => {
    firestore.collection("rooms").doc(obj).set({ opponent: "", hostBoard: { requestingAccessToGraveyard: { popupVisible: false, approved: false }, hand: 0, st: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m1: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m2: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], graveyard: [] }, guestBoard: { requestingAccessToGraveyard: { popupVisible: false, approved: false }, hand: 0, st: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m1: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], m2: [{ card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }, { card: { exists: false, defenseMode: false } }], graveyard: [] } })
    firestore.collection("users").doc(obj).set({ hosting: true }, { merge: true })
}

const returnAvailableDuels = async (requestId) => {
    const snapshot = await firebase.firestore().collection('rooms').get()
    return snapshot.docs.map(doc => doc.id).filter(id => id != requestId)
}
const joinDuel = (obj) => {
    firestore.collection("rooms").doc(obj.hostUsername).update({ opponent: obj.username })
    firestore.collection("users").doc(obj.username).update({ hostedBy: obj.hostUsername })
}

const leaveDuel = async (obj) => {
    firestore.collection("users").doc(obj).set({ hostedBy: "", hosting: false }, { merge: true })
    //find out if is primary host
    const { opponent } = await firestore.collection("rooms").doc(obj).get().then(function (doc) {
        if (doc.exists) {
            return doc.data()
        } else {
            return { opponent: "doc doesn't exists" }
        }
    })
    if (obj == opponent) {

    } else {

        firestore.collection("rooms").doc(obj).delete()
    }




    //if so, delete room entry from firebase as well
}

const listenForBoardUpdates = (obj) => {
    return firestore.collection("rooms").doc(obj).onSnapshot(function (doc) { return doc.data() })
}

export { updateUserInfo, updateDeckInfo, retrieveDeckInfo, retrieveCardsFromDeck, addCardsToDeck, deleteDeck, deleteCard, removeCardsFromDeck, hostDuel, returnAvailableDuels, joinDuel, listenForBoardUpdates, leaveDuel, alterBoard, doubleAlterBoard, requestAccessToGraveyard, approveAccessToGraveyard, dismissRequestAccessToGraveyard }
