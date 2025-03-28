const mongoose = require("mongoose");

const RecentChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true }, // Each user has 1 record
    chatList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Stores last 10 users
});

module.exports = mongoose.model("RecentChat", RecentChatSchema);
