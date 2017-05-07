// firebase storage things, connects by google cloud storage

const serviceAccount = require("./saver-bot-firebase-adminsdk-8hra6-1a6c4ef97d.json");
const gcloud = require('google-cloud');

const storage = gcloud.storage({
    projectId: 'saver-bot',
    credentials: serviceAccount
});

// export bucket
module.exports.bucket = storage.bucket('saver-bot.appspot.com');