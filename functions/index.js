const functions = require('firebase-functions');
const axios = require("axios")
const { dummyData } = require("./dummyData")
const admin = require("firebase-admin");
const uuid = require("uuid")
global.XMLHttpRequest = require("xhr2")

admin.initializeApp({
    credential: admin.credential.cert(require("./admin-cert.json")),
    databaseURL: "https://yugioh-c720d.firebaseio.com",

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

const mkdirp = require('mkdirp-promise');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

// Max height and width of the thumbnail in pixels.
const THUMB_MAX_HEIGHT = 200;
const THUMB_MAX_WIDTH = 200;
// Thumbnail prefix added to file names.
const THUMB_PREFIX = 'thumb_';

/**
 * When an image is uploaded in the Storage bucket We generate a thumbnail automatically using
 * ImageMagick.
 * After the thumbnail has been generated and uploaded to Cloud Storage,
 * we write the public URL to the Firebase Realtime Database.
 */
exports.generateThumbnail = functions.storage.object().onFinalize(async (object) => {
    // File and directory paths.
    const filePath = object.name;
    const contentType = object.contentType; // This is the image MIME type
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const thumbFilePath = path.normalize(path.join(fileDir, `${THUMB_PREFIX}${fileName}`));
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);
    const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath);

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        return console.log('This is not an image.');
    }

    // Exit if the image is already a thumbnail.
    if (fileName.startsWith(THUMB_PREFIX)) {
        return console.log('Already a Thumbnail.');
    }

    // Cloud Storage files.
    const bucket = admin.storage().bucket(object.bucket);
    const file = bucket.file(filePath);
    const thumbFile = bucket.file(thumbFilePath);
    const metadata = {
        contentType: contentType,
        // To enable Client-side caching you can set the Cache-Control headers here. Uncomment below.
        // 'Cache-Control': 'public,max-age=3600',
    };

    // Create the temp directory where the storage file will be downloaded.
    await mkdirp(tempLocalDir)
    // Download file from bucket.
    await file.download({ destination: tempLocalFile });
    console.log('The file has been downloaded to', tempLocalFile);
    // Generate a thumbnail using ImageMagick.
    await spawn('convert', [tempLocalFile, '-thumbnail', `${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}>`, tempLocalThumbFile], { capture: ['stdout', 'stderr'] });
    console.log('Thumbnail created at', tempLocalThumbFile);
    // Uploading the Thumbnail.
    await bucket.upload(tempLocalThumbFile, { destination: thumbFilePath, metadata: metadata });
    console.log('Thumbnail uploaded to Storage at', thumbFilePath);
    // Once the image has been uploaded delete the local files to free up disk space.
    fs.unlinkSync(tempLocalFile);
    fs.unlinkSync(tempLocalThumbFile);
    // Get the Signed URLs for the thumbnail and original image.
    const config = {
        action: 'read',
        expires: '03-01-2500',
    };
    const results = await Promise.all([
        thumbFile.getSignedUrl(config),
        file.getSignedUrl(config),
    ]);
    console.log('Got Signed URLs.');
    const thumbResult = results[0];
    const originalResult = results[1];
    const thumbFileUrl = thumbResult[0];
    const fileUrl = originalResult[0];
    // Add the URLs to the Database
    // await admin.database().ref('images').push({ path: fileUrl, thumbnail: thumbFileUrl });
    return console.log('Thumbnail URLs saved to database.');
});
exports.observeCreate = functions.firestore.document('/cards/{id}').onCreate((snapshot, context) => {
    const uploadData = snapshot.data()
    const uri = uploadData.card_images[0].image_url
    console.log(context.params);
    console.log(context.params.id);

    storeImage(uri)

})
const storeImage = async (uri) => {
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
        xhr.open('GET', uri, true);
        xhr.send(null);
    });
    const bucket = admin.storage().bucket("yugioh-c720d.appspot.com");

    // const snapshot = await bucket.upload(blob);
    bucket.upload(uri, function (err, file, apiResponse) {
        // Your bucket now contains:
        // - "image.png" (with the contents of `/local/path/image.png')
        console.log("in the bucket")
        // `file` is an instance of a File object that refers to your new file.
    });
    // bucket.upload(blob, function (err, file, apiResponse) {
    //     // Your bucket now contains:
    //     // - "image.png" (with the contents of `/local/path/image.png')

    //     // `file` is an instance of a File object that refers to your new file.
    // });

    // bucket.upload(uri, function (err, file, apiResponse) {
    //     // Your bucket now contains:
    //     // - "image.png" (with the contents of `/local/path/image.png')
    //     console.log("in the bucket")
    //     // `file` is an instance of a File object that refers to your new file.
    // });

    // const downloadUrl = await snapshot.ref.getDownloadURL();
    // console.log("asdfasdf", downloadUrl)
}