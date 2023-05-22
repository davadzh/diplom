const {Router} = require('express')
const controller = Router()
const Plane = require("../models/Plane");
const Session = require("../models/Session");
const helpers = require("../lib/helpers");
const {CallbackRequest, CallbackRequestStatuses} = require("../models/CallbackRequest");


controller.get('/search-flights', async (req, res) => {
  const {airportFrom, airportTo, bookDate, pax} = req.query;

  const date = helpers.parseShortDateStringAsUTCDate(bookDate)

  if (!(date && airportFrom && airportTo && pax)) {
    res.status(200).json({isSuccess: false, errorMessage: "Ошибка запроса"});
    return;
  }

  if (date.getTime() <= helpers.parseStringAsUTCDate((new Date()).toISOString()).getTime()) {
    res.status(200).json({isSuccess: false, errorMessage: "Указана прошедшая дата"});
    return;
  }

  // Ищем доступные рейсы в базе данных
  const planes = await Plane.find({
    maxPassengers: {$gte: pax}
  }).populate('callbackRequests');

  const filteredPlanes = planes.filter(p => !p.callbackRequests.some(cr => {
    const crBookDate = cr.bookDate;
    return date.getTime() === crBookDate.getTime();
  }))

  // Отправляем ответ клиенту
  res.status(200).json({isSuccess: true, planes: filteredPlanes});
});


// Обработчик для проверки доступности самолета
controller.get('/flight-availability', async (req, res) => {
  const {airportFrom, airportTo, pax, bookDate, regNumber} = req.query;

  const date = helpers.parseShortDateStringAsUTCDate(bookDate)

  if (!(date && airportFrom && airportTo && pax)) {
    res.status(200).json({isSuccess: false, errorMessage: "Ошибка запроса"});
    return;
  }

  // Ищем доступные самолеты в базе данных
  const planeCandidate = await Plane.findOne({
    regNumber: regNumber,
  }).populate('user');

  if (!planeCandidate) {
    res.status(200).json({isSuccess: false, errorMessage: "Самолет не найден"});
    return;
  }

  const callbackRequests = await CallbackRequest.find({plane: planeCandidate});

  const callbackRequestCandidate = callbackRequests?.some(cr => {
    return cr.bookDate.getTime() === date.getTime() && cr.status === CallbackRequestStatuses.ACCEPTED
  })

  res.status(200).json({
    isSuccess: true, isBusy: !!callbackRequestCandidate, plane: planeCandidate
  });
});


// Обработчик для создания запроса на обратный звонок
controller.post('/request-callback', async (req, res) => {
  const {bookDate, fromAirport, toAirport, pax, fio, phone, regNumber} = req.body;
  const date = helpers.parseStringAsUTCDate(bookDate)

  if (!(date && fromAirport && toAirport && pax && fio && phone && regNumber)) {
    res.status(200).json({isSuccess: false, errorMessage: "Ошибка запроса"});
    return;
  }

  const planeCandidate = await Plane.findOne({regNumber}).populate('user');

  if (!planeCandidate) {
    res.status(200).json({isSuccess: false, errorMessage: "Самолет не найден"});
    return;
  }

  if (!planeCandidate.user) {
    res.status(200).json({isSuccess: false, errorMessage: "Не найден пользователь-владелец судна"});
    return;
  }

  // Создаем новый запрос на обратный звонок
  const callbackRequest = new CallbackRequest({
    bookDate: date,
    fromAirport,
    toAirport,
    pax,
    fio,
    phone,
    regNumber,
    // 1 waiting, 2 accepted, 3 rejected
    status: 1,
    plane: planeCandidate,
    user: planeCandidate.user,
  });

  // Сохраняем запрос в базу данных
  await callbackRequest.save();

  // Отправляем ответ клиенту
  res.status(200).json({isSuccess: true});
});


controller.get('/callback-requests', async (req, res) => {
  const {authorization} = req.headers;

  const session = await Session.findOne({accessToken: authorization})?.populate('user');
  if (!session) {
    res.status(401).json({isSuccess: false, errorMessage: "Доступ запрещен."});
    return
  }

  // Ищем все самолеты в базе данных
  const requests = await CallbackRequest.find({user: session.user}).populate('plane');

  // Отправляем ответ клиенту
  res.status(200).json({isSuccess: true, requests: requests});
});


// Обработчик для обновления статуса запроса на обратный звонок
controller.post('/change-request-status', async (req, res) => {
  const {id, status} = req.body;

  // Обновляем статус запроса на обратный звонок в базе данных
  await CallbackRequest.findByIdAndUpdate(id, {status});

  // Отправляем ответ клиенту
  res.status(200).json({isSuccess: true});
});


module.exports = controller;