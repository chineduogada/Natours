const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Tour',
  mongoose.Schema({
    name: {
      type: String,
      required: [true, `a tour must have a 'name'`],
      unique: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, `a tour must have a 'difficulty'`],
      enum: ['easy', 'medium', 'hard', 'difficult'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, `a tour must have a 'group size'`],
    },
    duration: {
      type: Number,
      required: [true, `a tour must have a 'duration'`],
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: { type: Number, required: [true, `a tour must have a 'price'`] },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, `a tour must have a 'summary'`],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, `a tour must have a 'cover image'`],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
  })
);
