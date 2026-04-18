const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  num: Number,
  question: String,
  options: [String],
  correct: String,
  sectionName: String,
  sectionIdx: Number,
  sectionTag: String,
});

module.exports = mongoose.model('Question', questionSchema);
