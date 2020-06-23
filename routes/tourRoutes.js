const router = require('express').Router();
const tourController = require('../controllers/tourController');

// related routes
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);

// related routes
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router.param('id', tourController.addIdToReq);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
