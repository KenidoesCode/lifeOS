const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    pushToken: String,
}, {timestamps: true});

module.exports = mongoose.model("User", UserSchema);