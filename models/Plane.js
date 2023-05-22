const mongoose = require('mongoose')

// Модель данных самолета
const planeSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  modelName: { type: String, required: true },
  categoryName: { type: String, required: true },
  maxPassengers: { type: Number, required: true },
  manufactureYear: { type: Number, required: true },
  maxDistance: { type: Number, required: true },
  description: { type: String },
  facilities: [{ type: String }],
  photoFileUrl: { type: String, required: true },
  regCertificateFileUrl: { type: String, required: true },
  insuranceFileUrl: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  callbackRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CallbackRequest' }],
});

const Plane = mongoose.model('Plane', planeSchema);

module.exports = Plane;
