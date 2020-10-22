const router = require("express").Router()

const authController = require("../controllers/authController")
const reviewController = require("../controllers/reviewController");

router.route('/')
  .get(reviewController.getAllReviews)
  .post(authController.protect, authController.restrictTo("user"), reviewController.createReview);

router.get("/:id", reviewController.getReview);

module.exports = router






