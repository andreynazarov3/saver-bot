const Telegraf = require('telegraf')
const app = new Telegraf(process.env.BOT_TOKEN)
const admin = require("firebase-admin")
const serviceAccount = require("./saver-bot-firebase-adminsdk-8hra6-a7ca5b3db6.json")
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://saver-bot.firebaseio.com"
})

const db = admin.database()
const posts = db.ref("/posts")
const users = db.ref("/users")

const gcloud = require('google-cloud');

const storage = gcloud.storage({
    projectId: 'saver-bot',
    keyFilename: serviceAccount
});

const bucket = storage.bucket('saver-bot.appspot.com');

posts.on("value", function (snapshot) {
    console.log(snapshot.val())
})


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
            text: ctx.message.text,
            data: ctx.message.date
        })
            .then(() => {
                ctx.reply('saved!')
            })
            .catch((err) => {
                ctx.reply('ooops, something went wrong ;(')
            })
    }
    else if (ctx.updateSubType === "photo") {
        let lastPhoto = ctx.message.photo.length
        let file_id = ctx.message.photo[lastPhoto - 1].file_id
        console.log(file_id)
        ctx.getFileLink(file_id)
            .then((link) => {
                ctx.reply('saving photo...')
                // Upload a local file to a new file to be created in your bucket.
                bucket.upload(link, function(err, file) {
                    if (!err) {
                        console.log('file uploaded')
                        ctx.reply('photo saved!')
                    }
                });
            })
    } else {
        ctx.reply("sorry, i'm saving only text right now :(")
    }
})
app.startWebhook("/webhook", null, process.env.PORT || 5000)