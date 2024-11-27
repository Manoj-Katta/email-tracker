// server.js
const express = require('express');
const mongoose = require('mongoose');
const Tracking = require('./models/Tracking'); // Import the tracking model
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON requests

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Route to add email tracking information
app.post('/add-email', async (req, res) => {
  const { emailId, userId } = req.body;

  try {
    // Create a new tracking entry if it doesn't exist
    let trackingEntry = await Tracking.findOne({ emailId });

    if (!trackingEntry) {
      trackingEntry = new Tracking({
        emailId,
      });
      await trackingEntry.save();
      console.log('Email tracking initialized');
    }

    res.status(200).send('Email tracking initialized');
  } catch (error) {
    console.error('Error adding email to database:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to track email open events
// Route to track email open events
app.get('/track/open', async (req, res) => {
  const { emailId } = req.query;
  const ipAddress = req.headers['x-forwarded-for'] || req.ip; // Capture IP address

  try {
    // Find the tracking entry for the email ID
    let trackingEntry = await Tracking.findOne({ emailId });

    if (!trackingEntry) {
      console.log(`Email not found, initializing tracking: ${emailId}`);
      // Create a new tracking entry
      trackingEntry = new Tracking({
        emailId,
        openEvents: [
          {
            timestamp: new Date(),
            ipAddress,
          },
        ],
      });

      // Save the new tracking entry to the database
      await trackingEntry.save();

      console.log(`New tracking entry created for emailId: ${emailId}`);
    } else {
      // If emailId exists, add the open event
      trackingEntry.openEvents.push({
        timestamp: new Date(),
        ipAddress,
      });

      // Save the updated tracking entry
      await trackingEntry.save();
      console.log(`Email opened: ${emailId}`);
    }

    // Send the tracking entry as the response
    res.status(200).json(trackingEntry);
  } catch (error) {
    console.error('Error tracking email open:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to retrieve tracking data for an email
app.get('/tracking-data', async (req, res) => {
  const { emailId } = req.query;

  try {
    // Find the email tracking entry and populate the open events and click events
    const trackingData = await Tracking.findOne({ emailId });

    if (!trackingData) {
      return res.status(404).send('Email not found');
    }

    res.status(200).json(trackingData);
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).send('Internal server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
