const crypto = require('crypto');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide your name'],
  },
  email: {
    type: String,
    match: [
      /([a-z0-9\-]+)@([a-z0-9]+)\.([a-z]{2,8})(\.[a-z]{2,8})?/i,
      'please provide a valid email address',
    ],
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
  if (!this.isModified('password')) return next();

  // subtract 1sec to ensure that the JWT is issued 1sec after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
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

