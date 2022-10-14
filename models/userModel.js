const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email!'],
    unique: true,
    validate: {
      validator: email => validator.isEmail(email),
      message: 'Please provide a valid email',
    },
  },
  mobileNumber: {
    type: String,
    required: [true, 'Please tell us your mobile number!'],
    unique: true,
    validate: {
      validator: mobileNumber => validator.isMobilePhone(mobileNumber + ''),
      message: 'Please provide a valid mobile number',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator(passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  role: {
    type: String,
    enum: ['user', 'doctor'],
    default: 'user',
  },
  passwordChangedAt: Date,
});

// -------------------------------
// Methods
userSchema.methods.isInputPasswordCorrect = async (inputPassword, password) =>
  await bcrypt.compare(inputPassword, password);

userSchema.changedPasswordAfterJwtIssued = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return jwtTimeStamp < passwordChangedTimestamp;
  }

  // False means not changed
  return false;
};

// -------------------------------
// Query Middlewares
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // This ensures that time of jwt creation is greater than passwordChangedAt
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
