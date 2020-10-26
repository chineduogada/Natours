const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.use(authController.protect);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch('/change-my-password', authController.updatePassword);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.use(authController.restrictTo("admin"));

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

























