const express = require('express');
const mongoose = require('mongoose');
const Tracking = require('./models/Tracking'); // Import the Tracking model
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

// Route to track email open events
app.get('/track/open', async (req, res) => {
  const { emailId } = req.query;
  const ipAddress = req.headers['x-forwarded-for'] || req.ip; // Capture the IP address

  try {
    // Update or insert a new tracking entry atomically
    await Tracking.findOneAndUpdate(
      { emailId }, // Find by emailId
      {
        $push: {
          openEvents: { timestamp: new Date(), ipAddress },
        },
      },
      { upsert: true, new: true } // Create a new entry if it doesn't exist
    );

    console.log(`Email opened: ${emailId}, IP: ${ipAddress}`);
    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from([0, 0, 0, 0])); // Send a 1x1 transparent pixel
  } catch (error) {
    console.error('Error tracking email open:', error);
    res.status(500).send('Internal server error');
  }
});



// Route to retrieve tracking data
app.get('/tracking-data', async (req, res) => {
  const { emailId } = req.query;

  try {
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
