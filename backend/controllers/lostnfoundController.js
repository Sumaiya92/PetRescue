// lostnfoundController.js
const express = require('express');
const router = express.Router();
const LostFoundPet = require('../models/LostAndFound');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/lostfound';

    // Check if directory exists, if not create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
// Get all lost/found pets
router.get('/', async (req, res) => {
  try {
    const pets = await LostFoundPet.find();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pets', error: error.message });
  }
});

// Get a specific lost/found pet by ID
router.get('/:id', async (req, res) => {
  try {
    const pet = await LostFoundPet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pet', error: error.message });
  }
});

// Report a lost or found pet
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const petData = req.body;
    if (req.file) {
      petData.image = `${req.protocol}://${req.get('host')}/uploads/lostfound/${req.file.filename}`;
    }
    

    const newPet = new LostFoundPet(petData);
    await newPet.save();

    res.status(201).json({ message: 'Pet Report Submitted', data: newPet });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Delete a lost/found pet report
router.delete('/:id', async (req, res) => {
  try {
    const deletedPet = await LostFoundPet.findByIdAndDelete(req.params.id);
    if (!deletedPet) return res.status(404).json({ message: 'Pet not found' });
    res.status(200).json({ message: 'Pet report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pet', error: error.message });
  }
});

// Update a lost/found pet report
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const pet = await LostFoundPet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    if (req.file) {
      // Delete old image if exists
      if (pet.image) {
        const oldImagePath = path.join(__dirname, '..', pet.image.replace(`${req.protocol}://${req.get('host')}/`, ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.body.image = `${req.protocol}://${req.get('host')}/uploads/lostfound/${req.file.filename}`;
    }

    const updatedPet = await LostFoundPet.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json({ message: 'Pet Report Updated', data: updatedPet });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/search-matches', async (req, res) => {
  try {
    const { description, type, breed, location, color, size, distinctive_features } = req.body;

    if (!description && !type && !breed) {
      return res.status(400).json({ 
        message: 'Pet description, type, or breed is required for searching' 
      });
    }

    // Clean and gather keywords
    let allKeywords = [];
    const commonWords = ['with', 'that', 'this', 'have', 'been', 'and', 'the', 'was', 'very', 'has'];

    const extractKeywords = text => (
      text?.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(
        word => word.length > 2 && !commonWords.includes(word)
      ) || []
    );

    allKeywords = [
      ...extractKeywords(description),
      ...extractKeywords(distinctive_features),
      ...(color ? color.toLowerCase().split(/\s+/) : [])
    ];

    allKeywords = [...new Set(allKeywords)];

    // Build the pipeline
    const pipeline = [
      {
        $match: {
          status: 'found',
          isClaimed: false,
          $or: []
        }
      }
    ];

    if (allKeywords.length > 0) {
      pipeline[0].$match.$or.push({
        description: { $regex: allKeywords.join('|'), $options: 'i' }
      });
    }

    if (type) {
      pipeline[0].$match.$or.push({ type: { $regex: `^${type}`, $options: 'i' } });
    }

    if (breed) {
      pipeline[0].$match.$or.push({ breed: { $regex: breed, $options: 'i' } });
    }

    if (location) {
      pipeline[0].$match.$or.push({ location: { $regex: location, $options: 'i' } });
    }

    if (size) {
      pipeline[0].$match.$or.push({ description: { $regex: `\\b${size}\\b`, $options: 'i' } });
    }

    pipeline.push({
      $addFields: {
        score: {
          $add: [
            1,
            {
              $cond: [
                { $regexMatch: { input: { $ifNull: ["$type", ""] }, regex: type || "", options: "i" } },
                10,
                0
              ]
            },
            {
              $cond: [
                { $regexMatch: { input: { $ifNull: ["$breed", ""] }, regex: breed || "", options: "i" } },
                5,
                0
              ]
            },
            {
              $cond: [
                { $regexMatch: { input: { $ifNull: ["$location", ""] }, regex: location || "", options: "i" } },
                3,
                0
              ]
            }
          ]
        }
      }
    });

    pipeline.push({ $sort: { score: -1, date: -1 } });
    pipeline.push({ $limit: 30 });

    const matchingPets = await LostFoundPet.aggregate(pipeline);

    return res.status(200).json({
      count: matchingPets.length,
      matches: matchingPets
    });

  } catch (error) {
    console.error('Error searching for matching pets:', error);
    return res.status(500).json({
      message: 'Server error while searching for matches',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;