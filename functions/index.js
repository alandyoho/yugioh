const functions = require('firebase-functions');
const axios = require("axios")
const { dummyData } = require("./dummyData")
const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(require("./admin-cert.json")),
    databaseURL: "https://yugioh-b9744.firebaseio.com",
});

exports.searchResults = functions.https.onRequest(async (request, response) => {
    const cardType = request.body.data.type
    console.log("card type pre-parse", cardType)
    const cardParser = (cardType) => {
        if (cardType == 'Open') {
            return `type=effect%20monster`
        } else if (cardType == 'In Progress') {
            return `type=spell%20card`
        } else if (cardType == "Complete") {
            return `type=trap%20card`
        }
    }
    const card = cardParser(cardType)
    // console.log("here's the card type", card)
    const cardName = request.body.data.name
    const arrayToObject = (arr) =>
        arr.reduce((obj, item) => {
            obj[item.id] = item
            return obj
        }, {})

    try {
        const data = await axios.get(`https://db.ygoprodeck.com/api/v5/cardinfo.php?&fname=${cardName}&${card}&sort=name&num=10`)
        console.log("(1)", data.data)
        const dataAsArr = arrayToObject(data.data)
        console.log("2", dataAsArr)
        response.send({ data: dataAsArr })
    } catch (err) {
        console.error(err)
    }
});




