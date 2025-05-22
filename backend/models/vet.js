const mongoose = require('mongoose');

const veterinarianNearSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere', // for geospatial queries
      required: true,
    },
  },
  contactNumber: {
    type: String,
    required: true,
  },
  openHours: {
    type: String, // Example: "Mon-Fri: 9AM - 6PM, Sat: 10AM - 2PM"
    required: true,
  },
  doctors: [
    {
      name: {
        type: String,
        required: true,
      },
      specialty: {
        type: String,
      },
    },
  ],
});

const VeterinarianNear = mongoose.model('Veterinarians', veterinarianNearSchema);

module.exports = VeterinarianNear;
