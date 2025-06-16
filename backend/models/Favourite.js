const mongoose = require('mongoose');

const favSchema = new mongoose.Schema({
  name: String,
  image: String,
  type: String,
});

const Favourite = mongoose.model('Favourite', favSchema);

module.exports = Favourite;