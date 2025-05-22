const mongoose = require('mongoose');

const LostFoundPetSchema = new mongoose.Schema({
  name: { type: String, default: null }, // Null for found pets without a known name
  type: { type: String, enum: ['Dog', 'Cat', 'Other'] },
  breed: { type: String },
  location: { type: String },
  date: { type: Date, default: Date.now },
  // New fields for lost pets
  lastSeenLocation: { type: String }, // More specific than general location
  lastSeenDate: { type: Date }, // Specific date when pet was last seen
  age: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Unknown'] },
  // Existing fields
  image: String,
  status: { type: String, enum: ['lost', 'found'] },
  findercontactInfo: { type: String }, // For found pets
  OwnercontactInfo: { type: String },  // For lost pets
  description: { type: String },
  isClaimed: { type: Boolean, default: false },
  isFound: { type: Boolean, default: false },
});

module.exports = mongoose.model('LostFoundPet', LostFoundPetSchema);