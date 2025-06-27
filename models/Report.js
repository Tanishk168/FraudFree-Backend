const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reportedBy: {
    type: String,
    default: 'Anonymous',
  },
  dateReported: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', reportSchema);
