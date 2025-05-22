const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const Shelter = require('../models/shelter');
const AdoptionRequest = require('../models/adoptionRequest');
const LostFoundPet = require('../models/LostAndFound');
const Post = require('../models/post');
const Comment = require('../models/Comment');
const VeterinarianNear = require('../models/vet');

// GET /search?query=yourSearchTerm
router.get('/search', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const regex = new RegExp(query, 'i'); // Case-insensitive search

  try {
    const [
      pets,
      shelters,
      adoptionRequests,
      lostFoundPets,
      posts,
      comments,
      veterinarians
    ] = await Promise.all([
      Pet.find({ $or: [{ name: regex }, { breed: regex }, { type: regex }] }),
      Shelter.find({ $or: [{ name: regex }, { 'location.city': regex }, { description: regex }] }),
      AdoptionRequest.find({ $or: [{ adopterName: regex }, { adopterEmail: regex }] }),
      LostFoundPet.find({ $or: [{ name: regex }, { location: regex }, { description: regex }] }),
      Post.find({ $or: [{ username: regex }, { caption: regex }] }),
      Comment.find({ $or: [{ username: regex }, { content: regex }] }),
      VeterinarianNear.find({ $or: [{ hospitalName: regex }, { 'location.address': regex }] })
    ]);

    res.json({
      pets,
      shelters,
      adoptionRequests,
      lostFoundPets,
      posts,
      comments,
      veterinarians
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error during search' });
  }
});

module.exports = router;
