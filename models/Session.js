const mongoose = require('mongoose')

// Модель данных пользователя
const sessionSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  // expirationDate: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;