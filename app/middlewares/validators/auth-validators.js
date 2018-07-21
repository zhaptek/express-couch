const { check } = require('express-validator/check');

module.exports = {
  password: [
    // Validate Password
    check('newPassword', 'Weak password')
      .isLength({
        min: 6
      })
      .matches(/^[A-Z]+[a-z]+\d+[!.]$/)
  ],
  resetPassword: [
    // Validate Password
    check('password', 'Weak password')
      .isLength({
        min: 6
      })
      .matches(/^[A-Z]+[a-z]+\d+[!.]$/)
  ],
  signup: [
    // Validate Names
    check(['firstName', 'lastName'], 'Invalid Name')
      .isLength({
        min: 3
      })
      .matches(/^[A-Za-z]+$/),

    // Validate Gender
    check('gender', 'Invalid Gender')
      // .optional({
      //     nullable: true
      // })
      .matches(/^male$|^female$/),

    // Validate username
    check('username', 'Invalid Username')
      .isLength({
        min: 3
      })
      .matches(/^[A-Za-z.]+$/),

    // Validate role
    check('role', 'Invalid role').matches(/^pos$|^admin$/),

    // Validate Password
    check('password', 'Weak password')
      .optional({
        nullable: true
      })
      .isLength({
        min: 6
      })
      .matches(/^[A-Z]+[a-z]+\d+[!.]*$/)
  ],

  role: [check('role', 'Invalid role').matches(/^pos$|^admin$/)]
};
