const functions = require('firebase-functions');
const axios = require("axios")
const { dummyData } = require("./dummyData")
const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(require("./admin-cert.json")),
    databaseURL: "https://yugioh-c720d.firebaseio.com"
});

exports.searchResults = functions.https.onRequest(async (request, response) => {
    const cardType = request.body.data.type

    const cardParser = (cardType) => {
        if (cardType == 'Open') {
            return ``
        } else if (cardType == 'In Progress') {
            return `type=spell%20card`
        } else if (cardType == "Complete") {
            return `type=trap%20card`
        }
    }
    const card = cardParser(cardType)
    // //
    const cardName = request.body.data.name
    const arrayToObject = (arr) =>
        arr.reduce((obj, item) => {
            obj[item.id] = item
            return obj
        }, {})

    try {
        const data = await axios.get(`https://db.ygoprodeck.com/api/v5/cardinfo.php?&fname=${cardName}&${card}&sort=name&num=10`)
        //
        const dataAsArr = arrayToObject(data.data)
        //
        response.send({ data: dataAsArr })
    } catch (err) {
        response.send({ data: false })
        // console.error(err)
    }
});




