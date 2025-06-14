const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  name: String,
  type: String,
  line: String,
  image: String
});

const Transport = mongoose.model('Transport', transportSchema);

module.exports = Transport;