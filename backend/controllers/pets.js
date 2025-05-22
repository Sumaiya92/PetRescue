const express = require('express');
const router = express.Router();
const Shelter = require('../models/shelter'); // Adjust path if needed
const Pet = require('../models/pet'); // Adjust path if needed
const AdoptionRequest = require('../models/adoptionRequest'); // Adjust path if needed
const { 
  sendAdoptionConfirmation,
  sendShelterNotification
} = require('../utils/emailService');
const multer =require("multer");
// Add these at the top of your pet router file
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/adoption';

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

// GET all pets
router.get('/all', async (req, res) => {
  try {
    // Support filtering by query parameters
    const filters = {};
    
    // Handle potential filter parameters
    if (req.query.type) filters.type = req.query.type;
    if (req.query.breed) filters.breed = req.query.breed;
    if (req.query.urgent === 'true') filters.urgent = true;
    if (req.query.shelter) filters.shelter = req.query.shelter;
    if (req.query.availableForAdoption === 'true') filters.availableForAdoption = true;
    
    const pets = await Pet.find(filters).populate('shelter', 'name location contactInfo');
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET pet by ID
  router.get('/:id', async (req, res) => {
    try {
      const pet = await Pet.findById(req.params.id).populate('shelter', 'name location contactInfo');
      
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }
      
      res.status(200).json(pet);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// CREATE new pet
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const petData = req.body;
    console.log("Received Pet Data:", petData);

    let imageUrl = '';
    if (req.file) {
      console.log("Image Uploaded:", req.file);
      // Construct the correct URL for the image
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/adoption/${req.file.filename}`;
      console.log("Image URL created:", imageUrl);
    }

    const newPet = new Pet({
      ...petData,
      // Either use image field or imageUrls array based on your schema
      image: imageUrl,         // If your schema has an 'image' field
      imageUrls: imageUrl ? [imageUrl] : []  // If your schema uses 'imageUrls' array
    });

    await newPet.save();
    console.log("Saved pet with image:", newPet);

    res.status(201).json({ message: 'Pet Added Successfully', pet: newPet });
  } catch (err) {
    console.error("Error saving pet:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// UPDATE pet by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    res.status(200).json(updatedPet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE pet by ID
router.delete('/:id', async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Additional useful routes

// GET pets by shelter ID
router.get('/shelter/:shelterId', async (req, res) => {
  try {
    const pets = await Pet.find({ shelter: req.params.shelterId });
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET urgent pets
router.get('/urgent/list', async (req, res) => {
  try {
    const urgentPets = await Pet.find({ urgent: true, availableForAdoption: true })
      .populate('shelter', 'name location contactInfo');
    res.status(200).json(urgentPets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH to update adoption status
router.put('/:id/adoption-status', async (req, res) => {
  try {
    if (req.body.availableForAdoption === undefined) {
      return res.status(400).json({ message: 'availableForAdoption status is required' });
    }
    
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { availableForAdoption: req.body.availableForAdoption },
      { new: true }
    );
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    res.status(200).json(pet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post('/adoption-request', async (req, res) => {
  try {
    const { petId, email, name, phone, message } = req.body;

    // Validate required fields
    if (!petId || !email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Pet ID and email are required'
      });
    }

    // Fetch the pet details to get the name
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Pet not found'
      });
    }

    // Create adoption request in database
    const adoptionRequest = new AdoptionRequest({
      pet: petId,
      adopterEmail: email,
      adopterName: name || '',
      adopterPhone: phone || '',
      message: message || '',
      status: 'Pending'
    });

    await adoptionRequest.save();

    // Send confirmation email with pet name
    try {
      await sendAdoptionConfirmation(
        email, 
        pet.name, // Using the actual pet name from database
        name || 'Pet Lover' // Fallback if name not provided
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the whole request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Adoption request submitted successfully',
      requestId: adoptionRequest._id,
      petName: pet.name // Optionally return pet name in response
    });

  } catch (error) {
    console.error('Adoption request error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Add this endpoint with your other routes, before module.exports
router.post('/find', async (req, res) => {
  try {
    const { filters } = req.body;

    // Always filter by adoptable status
    const baseQuery = {
      availableForAdoption: true
    };

    // Fetch all potentially relevant pets
    const potentialPets = await Pet.find(baseQuery)
      .populate('shelter', 'name location contactInfo imageUrls');

    // Score each pet based on how many filters match
    const scoredPets = potentialPets.map(pet => {
      let matchCount = 0;

      for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null) continue;

        const petValue = pet[key];

        switch (key) {
          case 'age':
            if (typeof value === 'object' && value.$regex) {
              if (new RegExp(value.$regex, value.$options || '').test(petValue)) {
                matchCount++;
              }
            } else if (petValue === value) {
              matchCount++;
            }
            break;

          case 'temperament':
          case 'vaccinationStatus':
            if (Array.isArray(petValue) && value.$in) {
              if (petValue.some(val => value.$in.includes(val))) {
                matchCount++;
              }
            }
            break;

          case 'spayedNeutered':
            if (petValue === value) {
              matchCount++;
            }
            break;

          default:
            if (petValue === value) {
              matchCount++;
            }
        }
      }

      return { pet, matchCount };
    });

    // Sort by match count descending
    scoredPets.sort((a, b) => b.matchCount - a.matchCount);

    // Limit to top 4 results
    const topPets = scoredPets.slice(0, 5).map(entry => entry.pet);

    res.status(200).json(topPets);
  } catch (error) {
    console.error('Error in /api/pet/find:', error);
    res.status(500).json({
      message: 'Error finding matching pets',
      error: error.message
    });
  }
});



module.exports = router;