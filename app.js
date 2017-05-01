const Telegraf = require('telegraf')
const app = new Telegraf(process.env.BOT_TOKEN)
const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
        privateKey: process.env.PRIVATE_KEY
    }),
    databaseURL: process.env.DATABASE_URL
})

const db = admin.database();
const ref = db.ref("/");

ref.on("value", function(snapshot) {
    console.log(snapshot.val());
});


// Set telegram webhook
app.telegram.setWebhook(process.env.WEBHOOK_URL)
    .then(function (result) {
        console.log('set webhook success: ' + result)
    })
    .catch(function (err) {
        console.log('set webhook error: ' + err)
    })

app.on('message', (ctx) => {
    console.log(
        'recieved message'
    )
    ctx.reply('i listen to you!')
})

app.startWebhook("/webhook", null, process.env.PORT || 5000)