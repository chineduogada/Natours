const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.patch(
  '/change-my-password',
  authController.protect,
  authController.updatePassword
);

router.patch(
  '/update-me',
  authController.protect,
  userController.updateMe
);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  // .patch(userController.updateM)
  .delete(userController.deleteUser);

module.exports = router;






