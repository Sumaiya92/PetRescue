const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  shelter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter',
   
  },
  adopterName: {
    type: String,
   
  },
  adopterEmail: {
    type: String,
    required: true
  },
  adopterPhone: {
    type: String,
    
  },
  reason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
