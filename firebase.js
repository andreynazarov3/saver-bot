// firebase admin things

const admin = require("firebase-admin");
const serviceAccount = require("./saver-bot-firebase-adminsdk-8hra6-1a6c4ef97d.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://saver-bot.firebaseio.com"
});

const db = admin.database();

// export database references
module.exports.posts = db.ref("/posts");
module.exports.users = db.ref("/users");