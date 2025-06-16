// backend/models/Hotel.js
const mongoose = require('mongoose');

const AccomodationSchema = new mongoose.Schema({
  hotelname: String,
  image_url: String,
});

// Force use of the correct collection name: 'accomodation' (with single 'm')
const Accomodation = mongoose.model('Accomodation', AccomodationSchema, 'accomodation');
module.exports = Accomodation;
