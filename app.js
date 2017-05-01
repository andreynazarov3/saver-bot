const Telegraf = require('telegraf')
const app = new Telegraf(process.env.BOT_TOKEN)

// Set telegram webhook
app.telegram.setWebhook(process.env.WEBHOOK_URL).then(function (result) {
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

app.startWebhook("/", null, process.env.PORT || 5000)

