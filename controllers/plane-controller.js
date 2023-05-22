// Обработчик для получения списка самолетов
const Plane = require("../models/Plane");
const {Router} = require('express')
const {check} = require('express-validator')
const controller = Router()
const fs = require('fs');
const multer = require("multer");
const User = require("../models/User");
const Session = require("../models/Session");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

controller.get('/list', async (req, res) => {
  const {authorization} = req.headers;

  const {user: userCandidate} = await Session.findOne({accessToken: authorization})?.populate('user');
  if (!userCandidate) {
    res.status(401).json({ isSuccess: false, errorMessage: "Доступ запрещен." });
    return
  }
  // Ищем все самолеты в базе данных
  const planes = await Plane.find({user: userCandidate});

  // Отправляем ответ клиенту
  res.status(200).json({isSuccess: true, planes: planes});
});

// Обработчик для создания нового самолета
controller.post('/create', upload.fields([{name: 'photoFile'}, {name: 'regCertificateFile'}, {name: 'insuranceFile'}]), async (req, res) => {
  const {
    regNumber,
    modelName,
    categoryName,
    maxPassengers,
    manufactureYear,
    maxDistance,
    description,
    facilities,
  } = req.body;
  const {photoFile, regCertificateFile, insuranceFile} = req.files;

  const {authorization} = req.headers;

  const {user: userCandidate} = await Session.findOne({accessToken: authorization})?.populate('user');
  if (!userCandidate) {
    res.status(401).json({ isSuccess: false, errorMessage: "Доступ запрещен." });
    return
  }

  const planeCandidate = await Plane.findOne({regNumber});
  if (planeCandidate) {
    res.status(200).json({ isSuccess: false, errorMessage: "Судно с таким регистрационным номером уже существует." });
    return
  }

  // // Создаем новый самолет
  const plane = new Plane({
    regNumber,
    modelName,
    categoryName,
    maxPassengers,
    manufactureYear,
    maxDistance,
    description,
    facilities: facilities.split(";"),
    photoFileUrl: photoFile[0].filename,
    regCertificateFileUrl: regCertificateFile[0].filename,
    insuranceFileUrl: insuranceFile[0].filename,
    user: userCandidate,
  });

  // Сохраняем самолет в базу данных
  await plane.save();

  // Отправляем ответ клиенту
  res.status(200).json({ isSuccess: true });
});


module.exports = controller;