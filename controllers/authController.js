const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { signJwt, verifyJwt } = require('../utils/jwt');

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  const jwt = signJwt(user.id);

  // Remove unnecessary stuff for client
  user.password = undefined;
  user.__v = undefined;

  res.status(201).json({
    status: 'success',
    jwt,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, countryCode, mobile, password } = req.body;

  if (!password || (!email && !mobile)) {
    return next(new AppError('Please provide all details', 401));
  }

  let userSearchObj = {};

  if (mobile && countryCode) {
    userSearchObj = { countryCode, mobile };
  } else if (email) {
    console.log(email);
    userSearchObj = { email };
  }

  if (Object.keys(userSearchObj).length === 0) return next(new AppError('Please provide all details', 401));

  const user = await User.findOne({ ...userSearchObj }).select('+password');

  if (!user || !(await user.isInputPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect details, please try again!', 401));
  }

  user.password = undefined;

  const jwt = signJwt(user.id);

  res.status(200).json({
    status: 'success',
    jwt,
    data: {
      user,
    },
  });
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
