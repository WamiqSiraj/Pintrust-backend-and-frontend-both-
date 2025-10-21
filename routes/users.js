const mongoose = require("mongoose")
const posts = require("./posts")
const plm = require("passport-local-mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/threesep")
const userSchema = mongoose.Schema({
  username: {
     type: String,
     required: true,
     unique: true
  },
  fullname: {
     type: String,
     required: true
  },
  email: {
     type: String,
     required: true
  },
  dp:{
    type: String
  },
  bio:{
    type: String
  },
  posts:[{
     type: mongoose.Schema.Types.ObjectId,
     ref:"Post"
  }]
})
userSchema.plugin(plm);
module.exports = mongoose.model("User",userSchema)
