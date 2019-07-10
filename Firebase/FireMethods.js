import { firestore, firebaseApp, auth, functions } from "./Fire"
import firebase from 'firebase';
import NumericInput from 'react-native-numeric-input'


const updateUserInfo = (obj) => {
    firestore.collection("users").doc(obj.username).set({ name: obj.name, email: obj.email, username: obj.username, hostedBy: "" }, { merge: true })
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
const addCardToBoard = async (obj) => {

}
const addCardsToDeck = async (obj) => {
    //check if card exists in "deck" model
    //if exists, increase quantity property by one 
    //else add card to deck model and set quantity property to 1
    const { cards } = await retrieveCardsFromDeck(obj)
    console.log("asdf", cards)
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
    console.log("retrieving the cards...")
    console.log("username", obj.username, "deck", obj.deck)
    return firestore.collection("decks").doc(`${obj.username}-${obj.deck}`).get().then(info => info.data())
}




//user navigates to dueling room
//user can either: 
//(a) host a duel
//create cloud function that creates a new document in rooms collection
//document name is host username
//document data is: {host: hostUsername, guest: guestUsername}
//)(b) join a duel
//create cloud function that returns all document id's in rooms collection 
//create cloud function that updates "guest" property in document to username


const hostDuel = (obj) => {
    firestore.collection("rooms").doc(obj).set({ opponent: "", hostBoard: { hand: 0, st: [], m1: [], m2: [], }, guestBoard: { hand: 0, st: [], m1: [], m2: [], } })
    firestore.collection("users").doc(obj).set({ hosting: true }, { merge: true })
}

const returnAvailableDuels = async (requestId) => {
    const snapshot = await firebase.firestore().collection('rooms').get()
    return snapshot.docs.map(doc => doc.id).filter(id => id != requestId)
}
const joinDuel = (obj) => {
    firestore.collection("rooms").doc(obj.hostUsername).set({ opponent: obj.username }, { merge: true })
    firestore.collection("users").doc(obj.username).set({ hostedBy: obj.hostUsername }, { merge: true })
}

const leaveDuel = async (obj) => {
    console.log("function triggered")
    firestore.collection("users").doc(obj).set({ hostedBy: "", hosting: false }, { merge: true })
    //find out if is primary host
    const { opponent } = await firestore.collection("rooms").doc(obj).get().then(function (doc) {
        if (doc.exists) {
            return doc.data()
        } else {
            return { opponent: "doc doesn't exists" }
        }
    }
    )

    if (obj == opponent) {
        console.log("not hosting the room")

    } else {
        console.log("hosting the room")
        firestore.collection("rooms").doc(obj).delete()
    }

    //if so, delete room entry from firebase as well
}

const listenForBoardUpdates = (obj) => {
    return firestore.collection("rooms").doc(obj).onSnapshot(function (doc) { return doc.data() })
}

export { updateUserInfo, updateDeckInfo, retrieveDeckInfo, retrieveCardsFromDeck, addCardsToDeck, deleteDeck, deleteCard, removeCardsFromDeck, hostDuel, returnAvailableDuels, joinDuel, listenForBoardUpdates, leaveDuel, addCardToBoard }
