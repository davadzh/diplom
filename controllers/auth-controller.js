const multer = require('multer');
const {Router} = require('express')
const User = require("../models/User");
const Session = require("../models/Session");
const License = require("../models/License");
const helpers = require("../lib/helpers");
const controller = Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

controller.post('/login', async (req, res) => {
  const { email, password, refreshToken } = req.body;

  if (refreshToken) {
    const session = await Session.findOne({ refreshToken }).populate('user');
    if (session && session.user) {
      const {user} = session;
      const newAccessToken = helpers.createAccessToken(user);
      const newRefreshToken = helpers.createRefreshToken(user);

      session.accessToken = newAccessToken;
      session.refreshToken = newRefreshToken;
      session.save();

      res.status(200).json({
        isSuccess: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        fio: user.fio,
        email: user.email,
        companyName: user.companyName,
      });
    } else {
      res.status(200).json({ isSuccess: false, errorMessage: 'Не удалось восстановить авторизацию' });
    }

    return;
  }

  // Ищем пользователя в базе данных по email и password
  const user = await User.findOne({ email, password });

  // Если пользователь найден, создаем токен доступа и токен обновления
  if (user) {
    const newAccessToken = helpers.createAccessToken(user);
    const newRefreshToken = helpers.createRefreshToken(user);

    await Session.findOneAndDelete({ user });
    const newSession = new Session({accessToken: newAccessToken, refreshToken: newRefreshToken, user})
    await newSession.save();

    res.status(200).json({
      isSuccess: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      fio: user.fio,
      email: user.email,
      companyName: user.companyName,
    });
  } else {
    // Если пользователь не найден, отправляем ошибку аутентификации
    res.status(200).json({ isSuccess: false, errorMessage: 'Неверный email или пароль' });
  }
});


// Обработчик для регистрации пользователя
controller.post('/register',  upload.single('file'), async (req, res) => {
  const { fio, email, companyName, password } = req.body;
  const file = req.file;

  const userWithSameEmail = await User.findOne({email});

  if (userWithSameEmail) {
    res.status(200).json({ isSuccess: false, errorMessage: "Пользователь с таким email уже существует" });
    return
  }

  // Создаем нового пользователя
  const user = new User({ fio, email, companyName, password });

  // Сохраняем пользователя в базу данных
  await user.save();

  const license = new License({
    userId: user._id,
    filename: file.filename
  });

  await license.save();

  // Отправляем ответ клиенту
  res.status(200).json({ isSuccess: true });
});


module.exports = controller