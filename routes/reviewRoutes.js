const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true })

router.use(authController.protect);

router
  .route('/')
  .get(
    reviewController.setFilterOptions,
    reviewController.getAllReviews
  )
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.setTourUserIDsInReq,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.deleteReview
  );

module.exports = router























