const { Schema, model } = require("mongoose");

const appointmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  notes: {
    type: [String],
  },
  pro: {
    type: Schema.Types.ObjectId,
    ref: "Pro",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Appointments = model("Appointments", appointmentSchema);

module.exports = Appointments;
