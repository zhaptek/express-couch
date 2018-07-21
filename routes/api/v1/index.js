const express = require('express');
const router = express.Router();

const authenticateController = require('../app/controllers/authenticate');

const authorizationMidware = require('../app/middlewares/authorization');
const authValidator = require('../app/middlewares/validators/auth-validators');

const Q = require('q');
const deferred = Q.defer();

// Your routes go here

/* POST SIGNUP. */
router.post(
  '/signup',
  [
    authorizationMidware.validateToken,
    authorizationMidware.isAdmin,
    authValidator.signup
  ],
  authenticateController.signup
);

/* POST SIGNIN. */
router.post('/signin', authenticateController.signin);

router.post('/signin/verify', authenticateController.verifyToken);

// // Update Password
router.delete(
  '/:username',
  [authorizationMidware.validateToken, authorizationMidware.isAdmin],
  authenticateController.deleteAccount
);

// /* POST PasswordReset. */
router.post(
  '/password/reset',
  [authorizationMidware.validateToken, authorizationMidware.isAdmin],
  authenticateController.reset
);

// Update Role
router.post(
  '/role',
  [
    authorizationMidware.validateToken,
    authorizationMidware.isAdmin,
    authValidator.role
  ],
  authenticateController.updateRole
);

// Get  Users
router.get(
  '/users',
  [authorizationMidware.validateToken, authorizationMidware.isAdmin],
  authenticateController.listAccounts
);

// Update Password
router.post(
  '/password/update',
  [authorizationMidware.validateToken, authValidator.password],
  authenticateController.updatePassword
);

module.exports = router;
