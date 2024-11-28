const mongoose = require('mongoose');

// Define the schema for tracking emails
const trackingSchema = new mongoose.Schema({
  emailId: { type: String, required: true, unique: true },
  openEvents: [
    {
      timestamp: { type: Date, default: Date.now },
      ipAddress: { type: String },
    },
  ],
  // clickEvents: [
  //   {
  //     timestamp: { type: Date, default: Date.now },
  //     ipAddress: { type: String },
  //   },
  // ],
});

module.exports = mongoose.model('Tracking', trackingSchema);
