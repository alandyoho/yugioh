import * as firebase from 'firebase';
import "firebase/firestore"
import "firebase/functions"

// Initialize Firebase

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCaSCAddSpn2JYdtRGL1MAQicpkPjie7X4",
    authDomain: "yugioh-b9744.firebaseapp.com",
    databaseURL: "https://yugioh-b9744.firebaseio.com",
    projectId: "yugioh-b9744",
    storageBucket: "yugioh-b9744.appspot.com",
    messagingSenderId: "940783355469",
    appId: "1:940783355469:web:8ada4a75f0ac57b1"
})
// Initialize Firebase

const firestore = firebaseApp.firestore()
const auth = firebaseApp.auth()
const functions = firebaseApp.functions()
const storage = firebaseApp.storage()

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)

export { firestore, auth, functions, storage, firebaseApp }


