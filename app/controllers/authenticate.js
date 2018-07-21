const { validationResult } = require('express-validator/check');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../../config/config.js');

const helper = require('../helpers/helper');

const db = require('../../config/database');

function regenerateToken(oldToken) {
  const decoded = jwt.decode(oldToken);
  delete decoded.iat;
  delete decoded.exp;
  const newToken = jwt.sign(decoded, config.secret, {
    expiresIn: 12 * 60 * 60 // expires in 12 hours
  });
  return newToken;
}

// Password Hash
function hashPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// checking if password is valid
function comparePasswords(saved_password, entered_password) {
  return bcrypt.compareSync(entered_password, saved_password);
}

module.exports = {
  verifyToken: function(req, res) {
    jwt.verify(req.body.token, config.secret, (err, decoded) => {
      if (err)
        return res.status(401).send({
          msg: 'You are not logged in'
        });

      return res.send({
        msg: 'You are logged in',
        data: {
          token: regenerateToken(req.body.token)
        }
      });
    });
  },
  signup: function(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.mapped()
      });
    }

    req.body.password = req.body.password || helper.randomString(6);
    const user = {
      _id: req.body.username,
      type: 'users',
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      role: req.body.role,
      storeId: process.env.STORE_ID,
      key: hashPassword(req.body.password),
      dateCreated: new Date().getTime(),
      dateModified: new Date().getTime()
    };

    db
      .put(user)
      .then(response => {
        if (!response.ok)
          throw {
            status: 500,
            message: 'System failure'
          };

        return res.send({
          msg: 'Account created successfully',
          data: {
            username: req.body.username,
            password: req.body.password
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(err.status).json({
          error: err.error
        });
      });
  },
  signin: function(req, res) {
    // find the user
    db
      .get(req.body.username)
      .then(user => {
        console.log(user);
        if (!user) {
          return res.status(404).json({
            error: 'Account not found'
          });
        }

        if (user.isDeleted) {
          return res.status(404).json({
            error: 'Account not found'
          });
        }

        // check if password matches
        if (!comparePasswords(user.key, req.body.password)) {
          return res.status(403).json({
            error: 'username or password is incorrect'
          });
        }

        const payload = {
          username: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender
        };

        const token = jwt.sign(payload, config.secret, {
          expiresIn: 12 * 60 * 60 // expires in 12 hours
        });

        const daysCount =
          (new Date().getTime() - user.dateModified) / (1000 * 60 * 60 * 24);

        let msg = 'Login successful';

        if (daysCount >= 90) {
          msg = 'Kindly change your password';
        }

        return res.send({
          msg: msg,
          data: {
            token: token,
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              gender: user.gender,
              role: user.role,
              username: user._id
            }
          }
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(403).json({
          error: 'username or password is incorrect'
        });
      });
  },

  reset: function(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.mapped()
      });
    }

    db
      .get(req.body.username)
      .then(user => {
        console.log(user);
        if (!user) {
          return res.status(404).json({
            error: 'Account not found'
          });
        }

        // Validate password
        const password = req.body.password || helper.randomPassword(6);
        user.key = hashPassword(password);
        user.dateModified = new Date().getTime();

        db
          .put(user)
          .then(user => {
            if (user)
              return res.json({
                msg: 'Password reset successful',
                data: {
                  username: req.body.username,
                  password: password
                }
              });
          })
          .catch(err => {
            console.log(err);
            if (err)
              return res.status(500).json({
                error: 'Server error'
              });
          });
      })
      .catch(err => {
        console.log(err);
        return res.status(404).json({
          error: 'Account not found'
        });
      });
  },

  listAccounts: function(req, res) {
    db
      .find({
        selector: {
          type: 'users',
          isDeleted: {
            $exists: false
          }
        },
        limit: 999999999999
      })
      .then(result => {
        result.docs.sort((a, b) => {
          return helper.compareStrings(a.firstName, b.firstName);
        });
        result.docs.forEach(doc => {
          delete doc.key;
          delete doc._rev;
        });
        return res.send({
          msg: 'Successful',
          data: result.docs
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(err.status || 500).send({
          error: err.message || 'System failure'
        });
      });
  },

  updatePassword: function(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.mapped()
      });
    }

    db
      .get(req.decoded.username)
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: 'Account not found'
          });
        }
        // check if password matches
        if (!comparePasswords(user.key, req.body.password)) {
          return res.status(401).json({
            error: 'Password is incorrect'
          });
        }

        user.key = hashPassword(req.body.newPassword);
        user.dateModified = new Date().getTime();

        db
          .put(user)
          .then(user => {
            if (user)
              return res.json({
                msg: 'Password update successful'
              });
          })
          .catch(err => {
            console.log(err);
            if (err)
              return res.status(500).json({
                error: 'Server error'
              });
          });
      })
      .catch(err => {
        console.log(err);
        return res.status(404).json({
          error: 'Account not found'
        });
      });
  },

  updateRole: function(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.mapped()
      });
    }

    db
      .get(req.body.username)
      .then(user => {
        console.log(user);
        if (!user) {
          return res.status(404).json({
            error: 'Account not found'
          });
        }

        user.role = req.body.role;

        db
          .put(user)
          .then(user => {
            if (user)
              return res.json({
                msg: 'Role update successful',
                data: {
                  username: req.body.username,
                  role: user.role
                }
              });
          })
          .catch(err => {
            console.log(err);
            if (err)
              return res.status(500).json({
                error: 'Server error'
              });
          });
      })
      .catch(err => {
        console.log(err);
        return res.status(404).json({
          error: 'Account not found'
        });
      });
  },

  deleteAccount: function(req, res) {
    db
      .get(req.params.username)
      .then(doc => {
        if (!doc)
          throw {
            status: 404,
            message: 'Account not found'
          };

        doc.isDeleted = true;

        return db.put(doc);
      })
      .then(status => {
        if (status)
          return res.json({
            msg: 'Account disabled successful'
          });
      })
      .catch(err => {
        console.log(err);
        return res.status(err.status || 500).send({
          error: err.message || 'System failure'
        });
      });
  }
};
