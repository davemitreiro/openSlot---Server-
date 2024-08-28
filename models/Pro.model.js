const { Schema, model } = require("mongoose");

const proSchema = new Schema({
  fullname: {
    type: String,
    required: true,
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
  appointments: {
    type: [Schema.Types.ObjectId],
    ref: "Appointment",
  },
});

const Pro = model("Pro", proSchema);

module.exports = Pro;
