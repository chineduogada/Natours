const mongoose = require('mongoose');

const slugify = require("../utils/slugify");

const tourSchema = mongoose.Schema(
  {
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
      set: val => (Math.round(val * 10) / 10)
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
      trim: true,
      lowercase: true,
      required: [true, `a tour must have a 'summary'`],
    },
    slug: {
      type: String,
      default: function () {
        return slugify(this.name);
      }
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
        enum: ['Point']
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
    ],
    guides: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 })
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })

// Middlewares:
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   const guides = await Promise.all(guidesPromises)

//   this.guides = guides;

//   next()
// })

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -passwordResetToken -passwordResetTokenExpiresIn'
  });

  next()
})

// Virtuals
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
})

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: "tour",
  localField: "_id"
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;









































