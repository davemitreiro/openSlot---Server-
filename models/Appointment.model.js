const { Schema, model } = require("mongoose");

const appointmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true, // This represents both the date and start time
    },
    endTime: {
      type: Date,
      required: true, // This represents both the date and end time
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Add validation to ensure endTime is after startTime
appointmentSchema.pre("save", function (next) {
  if (this.endTime <= this.startTime) {
    return next(new Error("End time must be after start time"));
  }
  next();
});

const Appointment = model("Appointment", appointmentSchema);

module.exports = Appointment;
