const Telegraf = require('telegraf')
const https = require('https')
const app = new Telegraf(process.env.BOT_TOKEN)
const admin = require("firebase-admin")
const serviceAccount = require("./saver-bot-firebase-adminsdk-8hra6-1a6c4ef97d.json")
const fs = require("fs")
const gcloud = require('google-cloud');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://saver-bot.firebaseio.com"
})
const db = admin.database()
const posts = db.ref("/posts")
const users = db.ref("/users")
const storage = gcloud.storage({
    projectId: 'saver-bot',
    keyFilename: serviceAccount
});
const bucket = storage.bucket('saver-bot.appspot.com');


// Set telegram webhook
app.telegram.setWebhook(process.env.WEBHOOK_URL)
    .then(function (result) {
        console.log('set webhook success: ' + result)
    })
    .catch(function (err) {
        console.log('set webhook error: ' + err)
    })

app.on('message', (ctx) => {
    if (ctx.updateSubType === "text") {
        ctx.reply('saving this text...')
        users.child(ctx.message.from.id).push({
            type: 'text',
            text: ctx.message.text,
            createdAt: ctx.message.date
        })
            .then(() => {
                return ctx.reply('saved!')
            })
            .catch((err) => {
                return ctx.reply('ooops, something went wrong ;(')
            })
    }
    else if (ctx.updateSubType === "photo") {
        let lastPhoto = ctx.message.photo.length
        let file_id = ctx.message.photo[lastPhoto - 1].file_id
        app.telegram.getFileLink(file_id)
            .then((link) => {
                ctx.reply('saving photo...')
                return link
            })
            .then((link) => {
                let fileName = file_id + ".jpg";
                let file = fs.createWriteStream(fileName);
                let request = https.get(link, function (response) {
                    response.pipe(file)
                })
                file.on('finish', () => {
                    console.error('All writes are now complete.');
                    // Upload a local file to a new file to be created in your bucket.
                    bucket.upload(ctx.message.from.id + '/' + fileName, function(err, file) {
                        if (!err) {
                            fs.unlink(fileName,()=>console.log('file deleted'))
                            users.child(ctx.message.from.id).push({
                                type: 'photo',
                                fileName: fileName,
                                createdAt: ctx.message.date
                            })
                            return console.log('upload finish')
                        } else {
                            return console.log('upload error')
                        }
                    });
                });
            })
            .then(() => ctx.reply('file saved!'))
            .catch((err) => {
                console.log(err)
                ctx.reply("oops, something went wrong, please try again :(")
            })
    } else {
        ctx.reply("sorry, i'm saving only text right now :(")
    }
})
app.startWebhook("/webhook", null, process.env.PORT || 5000)