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
        console.log(ctx.message.photo)
    } else {
        ctx.reply("sorry, i'm saving only text right now :(")
    }
})
app.on('photo', (ctx) => {
    console.log(ctx.message)
    console.log('uploading photo')
    // bucket.upload('/photos/zoo/zebra.jpg', function(err, file) {
    //     if (!err) {
    //         // "zebra.jpg" is now in your bucket.
    //     }
    // });
})
app.startWebhook("/webhook", null, process.env.PORT || 5000)