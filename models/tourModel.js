const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Tour',
  mongoose.Schema({
    name: {
      type: String,
      required: [true, 'a tour must have a "name"'],
      unique: true,
    },
    price: { type: Number, required: [true, 'a tour must have a "price"'] },
    rating: {
      type: Number,
      default: 4.5,
    },
  })
);
