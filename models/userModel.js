const crypto = require('crypto');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide your name'],
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'please provide a valid email address'],
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ['admin', 'guide', 'lead-guide', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: [8, 'password must be 8 chars or more'],
    select: false,
  },
  passwordCheck: {
    type: String,
    required: [true, 'please provide a passwordCheck'],

    // This will work on model<query>.SAVE()!!
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'password must match passwordCheck',
    },
  },
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpiresIn: Date,
});

// MIDDLEWARES

// `between` the moment `data` is `received` and `saved` to the DB.
// `between` `getting` the `data` is `saving` it to the DB.
userSchema.pre('save', async function (next) {
  // Only run if Password was actually modified
  if (!this.isModified('password')) return next();

  // hash the Password with cost of 12
  const salt = await bcryptjs.genSalt(10);
  const passwordHash = await bcryptjs.hash(this.password, salt);
  this.password = passwordHash;

  // delete the PasswordCheck field
  this.passwordCheck = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // subtract 1sec to ensure that the JWT is issued 1sec after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // `this` points to the current `query`
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHODS
userSchema.methods.isPasswordCorrect = async (
  plainPassword,
  hashedPassword
) => {
  const isCorrect = await bcryptjs.compare(plainPassword, hashedPassword);

  return isCorrect;
};

userSchema.methods.changedPasswordAfterJWTWasIssued = function (JTWIssuedAt) {
  if (this.passwordChangedAt) {
    const passwordChangedAt = parseInt(this.passwordChangedAt.getTime() / 1000);

    return passwordChangedAt > JTWIssuedAt;
  }

  // False means not Change
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetToken = resetTokenHash;
  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;

  console.log({ resetToken }, { resetTokenHash });

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

