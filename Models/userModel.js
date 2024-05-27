const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  Username: {
    type: String,
    required: true,
    min: 5,
  },
  Firstname: {
    type: String,
    required: true,
  },
  Lastname: {
    type: String,
    required: true,
  },
  EmailAddress: {
    type: String,
    required: true,
    max: 8,
  },
  Password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },
  Created_At: {
    type: Date,
    default: Date.now(),
  },
  Updated_At: {
    Type: Date,
  },
});

const Users = mongoose.model("Users", userSchema);
module.exports = Users;