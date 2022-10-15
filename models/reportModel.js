const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Please add a user to the report'],
    },
    doctor: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    details: {
      problems: {
        type: [String],
      },
      userState: Boolean,
      response: [String],
    },
  },
  { timestamps: true }
);

const Report = mongoose.Model('Report', reportSchema);

module.exports = Report;
