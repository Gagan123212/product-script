const mongoose = require("mongoose");

const UsersSchema = mongoose.Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
});

const User = mongoose.model("User", UsersSchema);

module.exports = { User };

