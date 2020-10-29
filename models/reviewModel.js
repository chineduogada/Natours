const mongoose = require("mongoose");
const Tour = require("./tourModel");
const AppError = require("../utils/AppError");
const { any } = require("joi");

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
    required: [true, '`Review` can\'t be empty'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, '`Review` must belong to a `User`. Please provide the `Id`'],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, '`Review` must belong to a `Tour`. Please provide the `Id`'],
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: "name"
  // }).populate({
  //   path: 'user',
  //   select: "name photo"
  // })

  this.populate({
    path: 'user',
    select: "name photo"
  })

  next()
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: null,
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);

  if (stats.length) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
}

reviewSchema.post("save", async function () {
  const review = this;

  await review.constructor.calcAverageRatings(review.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  /// We can use `this.findOne`:(returns the doc), here in `pre`
  // And we don't need the `doc` here because is hasn't been persisted to the DB just yet!
  // we need the `doc` no matter what in this `post middleware`
  // set it on the `this` to pass to the `post middleware`

  this.review = await this.findOne(); // `this.review` will be available in the `post middleware`;
  
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  //   // We can't use `this.findOne`:(returns thw doc): deprecation warning
  //   // And we need the `doc` no matter what in this `post middleware`
  //   // Because we are dealing with `static` method (for constructors):(doc.constructor && doc.tour)
  
  const { review } = this;

  await review.constructor.calcAverageRatings(review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

























































