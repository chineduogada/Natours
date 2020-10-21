const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Tour',
  mongoose.Schema({
    name: {
      type: String,
      required: [true, `a tour must have a 'name'`],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [10, `'name' must be equal or more than '10'`],
      maxlength: [40, `'name' must be equal or less than '40'`],
    },
    difficulty: {
      type: String,
      required: [true, `a tour must have a 'difficulty'`],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: `'difficulty' must be either: 'easy', 'medium', or 'difficult'`,
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, `a tour must have a 'group size'`],
    },
    duration: {
      type: Number,
      required: [true, `a tour must have a 'duration'`],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, `'ratingsAverage' must be equal or more than '1.0'`],
      max: [5, `'ratingsAverage' must be equal or less than '5.0'`],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: { type: Number, required: [true, `a tour must have a 'price'`] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `'priceDiscount':{VALUE} must be less than the regular 'price'`,
      },
    },
    summary: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, `a tour must have a 'summary'`],
    },
    description: {
      type: String,
      trim: true,
      lowercase: true,
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
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum:['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String, 
        description: String,
        day: Number
      }
    ]
  })
);







