const express = require('express');
const router = express.Router();
const Shelter = require('../models/shelter');

// Create a new shelter
router.post('/', async (req, res) => {
  try {
    const newShelter = new Shelter(req.body);
    const saved = await newShelter.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all shelters
router.get('/', async (req, res) => {
  try {
    const shelters = await Shelter.find();
    res.json(shelters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific shelter by ID
router.get('/:id', async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ error: 'Shelter not found' });
    res.json(shelter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a shelter
router.put('/:id', async (req, res) => {
  try {
    const updated = await Shelter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Shelter not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a shelter
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Shelter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Shelter not found' });
    res.json({ message: 'Shelter deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
