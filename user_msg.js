const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    msg: { type: String, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dateSendingTime: { type: String,},
    readStatus: { type: Number, default: 0 } ,// 0 = Unread, 1 = Read
    day:{type:String}

},);

module.exports = mongoose.model("Message", messageSchema);
