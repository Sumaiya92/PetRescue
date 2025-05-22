const mongoose = require('mongoose');
const Pet = require('../models/pet');

const shelterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true // Create a geospatial index
    }
    
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  description: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    min: 0
  },
  imageUrl: {
    type: String
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  requirements: {
    type: String
  },
  services: {
    type: [String],
    enum: ['Adoption', 'Fostering', 'Veterinary', 'Grooming', 'Training', 'Boarding', 'Other']
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for getting current pet count
shelterSchema.virtual('petCount', {
  ref: 'Pet',
  localField: '_id',
  foreignField: 'shelter',
  count: true
});

const Shelter = mongoose.model('Shelter', shelterSchema,'shelters');
module.exports = Shelter;