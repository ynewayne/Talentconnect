const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../../config/keys');
const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../../models/User'); // Make sure this path is correct
const jwt = require('jsonwebtoken');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => done(err, null));
});

// Google authentication
passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/api/authgoogle/callback',
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => {
    let data = profile._json;
    User.findOne({ googleId: profile.id })
      .then((existingUser) => {
        if (existingUser) {
          // We have a user record
          return done(null, existingUser);
        } else {
          // This is a new user
          const email = data.emails[0].value;
          const name = data.displayName;
          const avatar = data.picture;

          const newUser = new User({
            googleId: profile.id,
            name: name,
            email: email,
            avatar: avatar,
            password: profile.id  // Note: it's better to handle password more securely
          });

          newUser.save()
            .then(user => done(null, user))
            .catch(err => done(err, null));
        }
      })
      .catch(err => done(err, null));
  }
));

module.exports = passport;
