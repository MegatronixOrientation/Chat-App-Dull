const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 5000;
const PythonShell = require('python-shell').PythonShell;

let timerID;

require('./src/db/connection');
const Message = require('./src/models/messagesSchema');


app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A new client has Connected');
    Message.find({})
        .then((messages) => {
            socket.emit('load messages', messages);
        });

    socket.on('username', async (username) => {
        console.log('the logged in user is ' + username);
        io.emit('user joined', username);
    });

    socket.on('chat message', (msg, imageSent, sender) => {
        clearTimeout(timerID);
        const message = new Message ({
            author:msg.author,
            content:msg.content,
            image:msg.image
        });
        message
            .save()
            .then(() => {
                io.emit('chat message', msg)
            })
            .catch((Error) => console.error(Error));

        if(imageSent) {
            fs.writeFile('base64.txt', msg.image, err => {
                if(err) {
                    console.error(err);
                } else {
                    console.log('File has been written successfully');
                }
            });

            PythonShell.run('caption_generator.py', null, function (err) {
                if (err) throw err;
                console.log('Caption has been generated successfully');
            });

            setTimeout( () => {
                fs.readFile('caption.txt', 'utf-8', (err, data) => {
                    try {
                        console.log('caption file is read successfully : ' + data);
                        io.emit('chat message', {
                            author: 'bot',
                            content: data,
                            image: null
                        });
                    } catch (err) {
                        console.error(err);
                    }
                })
            }, 15000);
        } else {
            fs.writeFile('message.txt', msg.content, err => {
                if(err) {
                    console.error(err);
                } else {
                    console.log('File has been written successfully');
                }
            });

            PythonShell.run('response_generator.py', null, function (err) {
                if (err) throw err;
                console.log('Response has been generated successfully');
            });

            timerID = setTimeout( () => {
                fs.readFile('reply.txt', 'utf-8', (err, data) => {
                    try {
                        console.log('response file is read successfully : ' + data);
                        io.emit('chat message', {
                            author: 'bot',
                            content: data,
                            image: null
                        });
                    } catch (err) {
                        console.error(err);
                    }
                })
            }, 5000);
        }
    });
});

server.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT}`);
});