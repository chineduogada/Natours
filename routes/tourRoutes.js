const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require("../routes/reviewRoutes")

const router = express.Router();

// Nested routes
router.use('/:tourId/reviews', reviewRouter);

// ALIASES
router.get('/top-cheap', tourController.topCheap, tourController.getAllTours);

// AGGREGATES
router.get('/stats', tourController.tourStats);
router.get(
  '/monthly-plan/:year',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.monthlyPlan
);

// API ROUTES
router.get('/', tourController.getAllTours)
router.get('/:id', tourController.getTour)

// Protected routes
router.use(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
)

router.post('/', tourController.createTour);

router
  .route('/:id')
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;




















