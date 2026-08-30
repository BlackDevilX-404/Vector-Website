const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  // Legacy fields (preserved)
  name: { type: String, required: true },
  email: { type: String, default: '' },
  role: { type: String, default: 'student' },
  institution: { type: String, default: '' },
  attended: { type: Boolean, default: false },
  registrationDate: { type: Date, default: Date.now },

  // New fields from Excel upload
  sNo: { type: Number },
  clubName: { type: String, default: '' },
  group: { type: String, enum: ['Group 1', 'Group 2', 'Group 3', 'Group 4'], default: 'Group 1' },
  portfolio: { type: String, default: '' },
  participantId: { type: String, unique: true, sparse: true },

  // Check-in fields
  morningAttendance: { type: Boolean, default: false },
  afternoonAttendance: { type: Boolean, default: false },
  morningRefreshments: { type: Boolean, default: false },
  afternoonRefreshments: { type: Boolean, default: false },
  lunch: { type: Boolean, default: false },
  kitReceived: { type: Boolean, default: false },
});

module.exports = mongoose.model('Participant', participantSchema);
