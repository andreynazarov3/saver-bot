const Telegraf = require('telegraf')
const app = new Telegraf(process.env.BOT_TOKEN)

// Set telegram webhook
app.telegram.setWebhook(process.env.WEBHOOK_URL).then(function (result) {
    console.log('set webhook success: ' + result)
})
    .catch(function (err) {
        console.log('set webhook error: ' + err)
    })
app.startWebhook(process.env.WEBHOOK_URL, null, process.env.port || 5000)

app.on('message', (ctx) => {
    ctx.reply('i listen to you!')
})