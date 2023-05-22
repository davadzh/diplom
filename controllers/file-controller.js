const {Router} = require('express')
const path = require('path')
const fs = require('fs')
const controller = Router()

controller.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', 'uploads', filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});


module.exports = controller
