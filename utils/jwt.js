const { promisify } = require('util');
const jwt = require('jsonwebtoken');

exports.signJwt = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.verifyJwt = async token => await promisify(jwt.verify)(token, process.env.JWT_SECRET);
