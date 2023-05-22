const express = require('express');
const config = require('config');
const path = require('path')
const mongoose = require('mongoose')
const fs = require("fs");

const app = express()

app.use(express.json({ extended: true }))

app.use('/api/auth', require('./controllers/auth-controller'));
app.use('/api/booking', require('./controllers/booking-controller'));
app.use('/api/plane', require('./controllers/plane-controller'));
app.use('/static', require('./controllers/file-controller'));

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = config.get('port') || 8000

if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/');
}

async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
  } catch (e) {
    console.log('Server Error', e.message)
    process.exit(1)
  }
}

start()