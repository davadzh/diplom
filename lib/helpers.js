// Вспомогательные функции
const jwt = require('jsonwebtoken')
const CallbackRequest = require('../models/CallbackRequest');

function createAccessToken(user) {
  // Создаем токен доступа с помощью библиотеки jsonwebtoken
  const accessToken = jwt.sign(
    {email: user.email, companyName: user.companyName},
    'secretkey',
    {expiresIn: '1h'}
  );

  return accessToken;
}

function createRefreshToken(user) {
  // Создаем токен обновления с помощью библиотеки jsonwebtoken
  const refreshToken = jwt.sign(
    {email: user.email, companyName: user.companyName},
    'secretkey'
  );

  return refreshToken;
}

function getDistanceBetweenAirports(airportFrom, airportTo) {
// Возвращает расстояние между двух аэропортами с помощью API или базы данных
}

async function isPlaneAvailable(planeId, bookDate) {
  // Проверяет, свободен ли самолет в указанную дату

  // Ищем запросы на обратный звонок, связанные с указанным самолетом
  const callbackRequests = await CallbackRequest.find({
    bookDate,
    status: {$in: [1, 2]},
  }).populate('plane');

  // Если запросов на обратный звонок нет, самолет свободен
  if (callbackRequests.length === 0) {
    return true;
  }

  // Если есть запросы на обратный звонок, проверяем, связаны ли они с указанным самолетом
  for (const callbackRequest of callbackRequests) {
    if (callbackRequest.plane._id.toString() === planeId.toString()) {
      return false;
    }
  }

  // Если запросы на обратный звонок не связаны с указанным самолетом, самолет свободен
  return true;
}


const parseShortDateStringAsUTCDate = (dateString) => {
  try {
    //for safari support
    const formattedDateTimeString = dateString + "T00:00:00.000Z";
    return new Date(Date.parse(formattedDateTimeString));
  } catch (e) {
    console.log("ERROR - [parseShortDateStringAsUTCDate]");
    return null;
  }
}

const parseStringAsUTCDate = (dateString) => {
  try {
    //for safari support
    const dateAndTime = dateString.split('T');
    const formattedDateTimeString = dateAndTime[0] + "T00:00:00.000Z";
    return new Date(Date.parse(formattedDateTimeString));
  } catch (e) {
    console.log("ERROR - [parseStringAsUTCDate]");
    return null;
  }

}


module.exports = {
  createAccessToken,
  createRefreshToken,
  getDistanceBetweenAirports,
  isPlaneAvailable,
  parseShortDateStringAsUTCDate,
  parseStringAsUTCDate
}