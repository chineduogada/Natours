const router = require('express').Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// ALIASES
router.get('/top-cheap', tourController.topCheap, tourController.getAllTours);

// AGGREGATES
router.get('/stats', tourController.tourStats);
router.get('/monthly-plan/:year', tourController.monthlyPlan);

// API ROUTES
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect, tourController.createTour);

router.param('id', tourController.addIdToReq);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

