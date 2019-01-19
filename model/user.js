var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    userId : Number,
    accountId : Number,
    firstName: String,
    lastName: String,
    displayName: String,
    createdAt: String,
    updatedAt: String,
    profileUrl: String,
    isActive: Boolean,
    badges: Object,
    tags: Object,
    reputation: Number
});

var user = mongoose.model('User', userSchema);

module.exports = { User: user };