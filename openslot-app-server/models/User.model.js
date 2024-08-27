const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  age: { type: Number, required: true },
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
  notes: {
    type: [String],
  },
  appointments: {
    type: [Schema.Types.ObjectId],
    ref: "Appointment",
  },
});

const User = model("User", userSchema);

module.exports = User;
