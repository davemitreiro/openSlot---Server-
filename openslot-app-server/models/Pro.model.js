const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const proSchema = new Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  business: {
    type: String,

    business_id: {
      type: String,
      required: true,
      unique: true,
    },
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required."],
  },
});

const Pro = model("Pro", proSchema);

module.exports = Pro;
