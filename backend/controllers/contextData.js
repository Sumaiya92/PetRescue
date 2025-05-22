// utils/contextData.js
const LostFoundPet = require('../models/LostAndFound');
const Pet = require('../models/pet');
const Post = require('../models/post');
const Veterinarian = require('../models/vet');

const fetchContextData = async () => {
  try {
    const [lostFoundPets, pets, posts, vets] = await Promise.all([
      LostFoundPet.find(),
      Pet.find().populate('shelter', 'name location contactInfo'),
      Post.find().populate('comments'),
      Veterinarian.find()
    ]);

    return {
      lostFoundPets,
      pets,
      posts,
      vets,
    };
  } catch (error) {
    console.error('Error fetching context data:', error);
    return {};
  }
};

module.exports = fetchContextData;
