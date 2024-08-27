const { Schema, model } = require("mongoose");

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
  appointment: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

const Pro = model("Pro", proSchema);

module.exports = Pro;
