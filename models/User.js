const mongoose = require('mongoose')

// Модель данных пользователя
const userSchema = new mongoose.Schema({
  fio: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String },
  password: { type: String, required: true },
  licenseFileUrl: { type: String },
  planes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plane' }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
