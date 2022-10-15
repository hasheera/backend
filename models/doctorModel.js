const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userRef: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  photo: {
    type: String,
    default: '',
  },
  qualifications: {
    type: {},
    required: [true, 'Please provide your qualifications'],
  },
  totalExperience: Number,
  allCurrentUsers: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    select: false,
  },
  sessionsConducted: {},
  allCreatedReports: {
    type: mongoose.Schema.ObjectId,
    ref: 'Report',
  },
});

const Doctor = mongoose.Model('Doctor', doctorSchema);
module.exports = Doctor;
