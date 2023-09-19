const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    author:String,
    content:String,
    image:String,
});

const Message = new mongoose.model('Message', messageSchema);
module.exports = Message;