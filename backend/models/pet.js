const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']
  },
  breed: {
    type: String,
    default: 'Unknown'
  },
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown'],
    default: 'Unknown'
  },
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large'],
    default: 'Medium'
  },
  vaccinationStatus: {
    type: String,
    enum: ['Not Vaccinated', 'Partially Vaccinated', 'Fully Vaccinated'],
    default: 'Not Vaccinated'
  },
  medicalStatus: {
    type: String,
    default: 'Healthy'
  },
  microchip: {
    type: String,
    default: 'Not Microchipped'
  },
  spayedNeutered: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
  },
  history: {
    type: String
  },
  medicalInfo: {
    type: String
  },
  behavior: {
    type: String
  },
  temperament: {
    type: [String], // e.g., ['Friendly', 'Playful', 'Shy']
    default: []
  },
  trainingLevel: {
    type: String,
    enum: ['Untrained', 'Basic', 'Intermediate', 'Advanced'],
    default: 'Untrained'
  },
  imageUrls: {
    type: [String],
    default: []
  },
  urgent: {
    type: Boolean,
    default: false
  },
  shelter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true
  },
  availableForAdoption: {
    type: Boolean,
    default: true
  },
  adopted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update updatedAt on save
petSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Pet = mongoose.model('Pet', petSchema, 'pets');
module.exports = Pet;
