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
    // bot action on plain text event
    if (ctx.updateSubType === "text") {
        ctx.reply('saving this text...')
            .then(() =>
                // saving message to user id folder
                users.child(ctx.message.from.id).push({
                    username: ctx.message.from.username,
                    type: 'text',
                    text: ctx.message.text,
                    created_at: ctx.message.date
                }))
            .then(() =>
                posts.push({
                    // saving message to posts folder
                    username: ctx.message.from.username,
                    user_id: ctx.message.from.id,
                    type: 'text',
                    text: ctx.message.text,
                    created_at: ctx.message.date
                }))
            .then(() => ctx.reply('saved!'))
            .catch((err) => ctx.reply('Ooops, something went wrong ;('))
    }
    // bot action on photo/image event
    else if (ctx.updateSubType === "photo") {
        // take biggest resolution of image from telegram
        let lastPhoto = ctx.message.photo.length
        let file_id = ctx.message.photo[lastPhoto - 1].file_id
        let fileName = file_id + ".jpg"
        let link // link placeholder

        // get downloadable link
        app.telegram.getFileLink(file_id)
            .then((file_link) => link = file_link)
            .then(() => ctx.reply('saving photo...'))
            .then(() => new Promise((resolve, reject) => {
                // create stream to write file on disk
                let file = fs.createWriteStream(fileName)
                // send request for file and save file by pipe
                let request = https.get(link, function (response) {
                    response.pipe(file)
                })
                file.on('finish', () => {
                    resolve(fileName)
                })
                file.on('error', (err) => {
                    reject(err)
                })
            }))
            // save file to firebase storage
            .then(() => bucket.upload(
                // file name
                fileName,
                // user folder on firebase storage
                {destination: ctx.message.from.id + '/' + fileName}
            ))
            // delete file from disk
            .then(() => new Promise((resolve, reject) =>
                    fs.unlink(fileName, (err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(console.log('file deleted success'))
                        }
                    })
                )
            )
            // save file data to user folder
            .then(() => users.child(ctx.message.from.id).push({
                username: ctx.message.from.username,
                type: 'photo',
                fileName: fileName,
                created_at: ctx.message.date
            }))
            // save file data to global folder
            .then(() => posts.push({
                    username: ctx.message.from.username,
                    user_id: ctx.message.from.id,
                    type: 'photo',
                    fileName: fileName,
                    created_at: ctx.message.date
                })
            )
            .then(() => ctx.reply('file saved!'))
            .catch((err) => {
                console.log(err);
                ctx.reply("oops, something went wrong, please try again :(");
            })
    } else {
        ctx.reply("sorry, i'm saving only text and images right now :(");
    }
})

//===========================
//
// BOT START!
//
//===========================

app.startWebhook("/webhook", null, process.env.PORT || 5000);