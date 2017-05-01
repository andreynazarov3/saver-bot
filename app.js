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

app.on('text', (ctx) => {
    console.log(ctx)
    ctx.reply('saving this text...')
        .then((ctx) => {
            users.child(ctx.from.id).push({
                text: ctx.message.text
            })
        })
})

app.startWebhook("/webhook", null, process.env.PORT || 5000)