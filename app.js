//===========================
//
// APP CONFIG
//
//===========================

// require standard libraries
const https = require('https')
const fs = require("fs")

// telegraf framework initialize
const Telegraf = require('telegraf')
const app = new Telegraf(process.env.BOT_TOKEN)

// import database and storage
const {bucket} = require('./storage.js')
const {users, posts} = require('./firebase.js')

// set telegram webhook
app.telegram.setWebhook(process.env.WEBHOOK_URL)
    .then(function (result) {
        console.log('set webhook success: ' + result)
    })
    .catch(function (err) {
        console.log('set webhook error: ' + err)
    })

//===========================
//
// BOT LOGIC
//
//===========================

app.on('message', (ctx) => {
    if (ctx.updateSubType === "text") {
        ctx.reply('saving this text...')
            .then(() =>
                users.child(ctx.message.from.id).push({
                    username: ctx.message.from.username
                    type: 'text',
                    text: ctx.message.text,
                    createdAt: ctx.message.date
                }))
            .then(() =>
                posts.push({
                    user_id: ctx.message.from.id,
                    type: 'text',
                    text: ctx.message.text,
                    createdAt: ctx.message.date
                }))
            .then(() => ctx.reply('saved!'))
            .catch((err) => ctx.reply('ooops, something went wrong ;('));
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
                let fileName = file_id + ".jpg"
                let file = fs.createWriteStream(fileName)
                let request = https.get(link, function (response) {
                    response.pipe(file)
                })
                file.on('finish', () => {
                    console.error('All writes are now complete.')
                    // Upload a local file to a new file to be created in your bucket.
                    bucket.upload(fileName, {destination: ctx.message.from.id + '/' + fileName}, function (err, file) {
                        if (!err) {
                            fs.unlink(fileName, () => console.log('file deleted'))
                            users.child(ctx.message.from.id).push({
                                type: 'photo',
                                fileName: fileName,
                                createdAt: ctx.message.date
                            })
                                .then(() => {
                                    return posts.push({
                                        user_id: ctx.message.from.id,
                                        type: 'photo',
                                        fileName: fileName,
                                        createdAt: ctx.message.date
                                    })
                                })
                            ctx.reply('file saved!')
                            return console.log('upload finish')
                        } else {
                            ctx.reply("Ooops, error!")
                            return console.log(err)
                        }
                    })
                })
            })
            .catch((err) => {
                console.log(err)
                ctx.reply("oops, something went wrong, please try again :(")
            })
    } else {
        ctx.reply("sorry, i'm saving only text right now :(")
    }
})

//===========================
//
// BOT START!
//
//===========================

app.startWebhook("/webhook", null, process.env.PORT || 5000)