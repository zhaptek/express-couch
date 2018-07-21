const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const AuthorizeMidware = {
  validateToken: function(req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers.authorization;

    // decode token
    if (token) {
      token = token.replace('Bearer ', '');
      // verifies secret and checks exp
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(403).json({
            error: 'Failed to authenticate token'
          });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      // if there is no token
      // return an error
      return res.status(401).json({
        errors: 'No token provided. '
      });
    }
  },
  isManager: function(req, res, next) {
    User.findOne(req.decoded.username)
      .then(user => {
        if (user.role === 'owner') return next();
        return res.status(401).json({
          error: 'You do not have permission to perform this action'
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(404).json({
          error: 'Account not found'
        });
      });
  },
  isAdmin: function(req, res, next) {
    User.findOne(req.decoded.username)
      .then(user => {
        if (user.role === 'admin' || user.role === 'owner') return next();
        return res.status(401).json({
          error: 'You do not have permission to perform this action'
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(404).json({
          error: 'Account not found'
        });
      });
  },
  isPOS: function(req, res, next) {
    User.findOne(req.decoded.username)
      .then(user => {
        if (user.role === 'pos') return next();
        return res.status(401).json({
          error: 'You do not have permission to perform this action'
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(404).json({
          error: 'Account not found'
        });
      });
  }
};

module.exports = AuthorizeMidware;
