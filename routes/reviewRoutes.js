const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const unsetFields = require("../utils/unsetFields")

const router = express.Router({ mergeParams: true })

router.use(authController.protect);

router
  .route('/')
  .get(
    reviewController.setFilterOptions,
    reviewController.getAllReviews
    )
  .post(
    authController.restrictTo("user"),
    reviewController.setTourUserIDsInReq,
    reviewController.createReview
  );

router.get("/:id", reviewController.getReview);

router.use(authController.restrictTo('admin', 'user'));

router
  .route('/:id')
  .patch(
    unsetFields("tour", "user"),
    reviewController.updateReview
  )
  .delete(reviewController.deleteReview);

module.exports = router



































