const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  fullName: {
    type: String,
  },
  age: { type: Number },
  imageUrl: {
    type: String,
    default: "https://freesvg.org/img/abstract-user-flat-4.png",
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
  notes: {
    type: [String],
  },
  appointments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
});

const User = model("User", userSchema);

module.exports = User;
