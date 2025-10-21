const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")
const users = require("./users")

const postSchema = mongoose.Schema({
  postText: {
     type: String,
     required: true
  },
  image: {
     type: String,
     required: true
  },
  createdAt: {
     type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  likes: {
     type: Array,
     default: []
  }
})

module.exports = mongoose.model("Post",postSchema)
