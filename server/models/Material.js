const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  key:           { type: String, required: true, unique: true },
  num:           { type: String, required: true },          // '01', '02', …
  title:         { type: String, required: true },
  group:         { type: String, default: '' },             // '' | 'Trainer\'s Slides'
  tagline:       { type: String, default: '' },
  desc:          { type: String, default: '' },
  accessGranted: { type: Boolean, default: false },
  url:           { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
