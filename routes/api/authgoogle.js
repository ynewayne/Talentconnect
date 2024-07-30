const express = require('express');
const router = express.Router();
const passport = require('passport');

// @route   GET auth/google
// @desc    Auth with Google
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home or dashboard
    res.redirect('/dashboard');
  }
);

module.exports = router;
