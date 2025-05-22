const express = require('express');
const router = express.Router();
const Veterinarian = require('../models/vet');

// Get all veterinarians
router.get('/', async (req, res) => {
  try {
    const vets = await Veterinarian.find();
    res.json(vets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get nearby veterinarians based on location
// This route must be defined BEFORE the /:id route to avoid conflicts
router.get('/nearby', async (req, res) => {
  try {
    // Get latitude and longitude from query parameters
    const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km
    
    // Validate location data
    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lng are required' 
      });
    }

    // Convert string parameters to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radius = parseFloat(maxDistance);

    // Validate the values
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
      return res.status(400).json({ 
        error: 'Invalid parameters: lat, lng and maxDistance must be valid numbers' 
      });
    }

    // Find veterinarians within the specified radius
    const nearbyVets = await Veterinarian.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // MongoDB uses [longitude, latitude] order
          },
          $maxDistance: radius
        }
      }
    });

    res.json(nearbyVets);
  } catch (err) {
    console.error('Error finding nearby veterinarians:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a single veterinarian by ID
router.get('/:id', async (req, res) => {
  try {
    const vet = await Veterinarian.findById(req.params.id);
    if (!vet) return res.status(404).json({ message: 'Vet not found' });
    res.json(vet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;