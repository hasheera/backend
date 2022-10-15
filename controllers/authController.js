const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { filterObj } = require('../utils/filterObject');
const { signJwt, verifyJwt } = require('../utils/jwt');

const filterUserSignupObject = reqBody =>
  filterObj(reqBody, 'name', 'email', 'mobileNumber', 'password', 'passwordConfirm');

const createAndSendToken = (user, statusCode, res) => {
  const jwt = signJwt(user.id);

  // Remove unnecessary stuff for client
  user.password = undefined;
  user.__v = undefined;

  res.status(statusCode).json({
    status: 'success',
    jwt,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const userDetails = filterUserSignupObject(req.body);

  const user = await User.create(userDetails);

  createAndSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, mobile, password } = req.body;

  if (!password || (!email && !mobile)) {
    return next(new AppError('Please provide all details', 401));
  }

  let userSearchObj = {};

  if (mobile) userSearchObj = { mobile };
  else if (email) userSearchObj = { email };

  const user = await User.findOne({ ...userSearchObj }).select('+password');

  if (!user || !(await user.isInputPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect details, please try again!', 401));
  }

  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;

  let token = '';
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please login to get access', 401));
  }

  // validate token
  const { id, iat: jwtIssuedAt } = await verifyJwt(token);

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('User belonging to this token does not exist', 401));
  }

  // check if user changed password after jwt was issued
  if (user.changedPasswordAfterJwtIssued(jwtIssuedAt)) {
    return next(new AppError('User recently changed password! Please login again', 401));
  }

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
