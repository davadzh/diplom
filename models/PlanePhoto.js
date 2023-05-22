const mongoose = require('mongoose');

const planePhotoSchema = new mongoose.Schema({
  planeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plane',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlanePhoto', planePhotoSchema);
