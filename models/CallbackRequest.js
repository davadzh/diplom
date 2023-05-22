const mongoose = require('mongoose')

const CallbackRequestStatuses = {
  WAITING_FOR_ANSWER: 1,
  ACCEPTED: 2,
  REJECTED: 3,
}

// Модель данных запроса на обратный звонок
const callbackRequestSchema = new mongoose.Schema({
  bookDate: { type: Date, required: true },
  fromAirport: { type: String, required: true },
  toAirport: { type: String, required: true },
  pax: { type: Number, required: true },
  fio: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: Number, required: true, default: CallbackRequestStatuses.WAITING_FOR_ANSWER },
  plane: { type: mongoose.Schema.Types.ObjectId, ref: 'Plane' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const CallbackRequest = mongoose.model('CallbackRequest', callbackRequestSchema);

module.exports = {
  CallbackRequest,
  CallbackRequestStatuses
};
