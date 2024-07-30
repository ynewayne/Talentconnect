var express = require('express');
var router = express.Router();
var gravatar = require('gravatar');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var keys = require('../../config/keys');
var passport = require('passport');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const emailConfirm = require('../../config/keys').emailConfirm;
const passwordConfirm = require('../../config/keys').passwordConfirm;

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load the User Model
var User = require('../../models/User');

// Google OAuth2 Client setup
const client = new OAuth2Client(keys.googleClientID);

// @route GET api/users/test
// @desc Tests users route
// @access Public
router.get('/test', (req, res) => res.json({ msg: "Users works" }));

// @route POST api/users/register
// @desc Register user
// @access Public
var rand, mailOptions, host, link;  // Initialized the variables
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
            } else {
                var avatar = gravatar.url(req.body.email, {
                    s: '200', // Size
                    r: 'pg',  // Rating
                    d: 'mm'  // Default
                });

                var newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar: avatar,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                // Send a email to verify
                                nodemailer.createTestAccount((err, account) => {
                                    // create reusable transporter object using the default SMTP transport
                                    let transporter = nodemailer.createTransport({
                                        service: 'Gmail',
                                        auth: {
                                            user: emailConfirm,
                                            pass: passwordConfirm
                                        }
                                    });

                                    rand = newUser.email;
                                    host = req.get('host');
                                    link = "http://" + req.get('host') + "/api/users/verify?id=" + rand;

                                    mailOptions = {
                                        from: emailConfirm, // sender address
                                        to: newUser.email, // list of receivers
                                        subject: 'Thanks for registration!', // Subject line
                                        text: 'Please confirm your email identification', // plain text body
                                        html: `Please click this email to confirm your email: <a href="${link}">${link}</a>` // html body
                                    };

                                    transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            return console.log(error);
                                        }
                                        console.log('Message sent: %s', info.messageId);
                                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                    });
                                });
                                res.json(user);
                            })
                            .catch(err => console.log(err))
                    });
                });
            }
        });
});

// @route POST api/users/login
// @desc Login user / Returning JWT Token
// @access Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    var email = req.body.email;
    var password = req.body.password;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }

            // Check whether the user has confirmed the link or not
            if (!user.confirm) {
                errors.confirm = "Please confirm your email before login";
                return res.status(400).json(errors);
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        // User Matched
                        const payload = { id: user.id, name: user.name, avatar: user.avatar };

                        // Sign Token
                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            }
                        );
                    } else {
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors);
                    }
                });
        });
});

// Check for the click on the verification link
router.get('/verify', (req, res) => {
    if (req.query.id == rand) {
        User.findOne({ email: mailOptions.to })
            .then(user => {
                if (!user) {
                    return res.status(400).json({ invalid: "The link you clicked is invalid" });
                }
                User.findOneAndUpdate(
                    { email: mailOptions.to },
                    { $set: { confirm: true } },
                    { new: true }
                ).then(() => res.end("<h1>Email " + mailOptions.to + " has been Successfully verified"))
                    .catch(err => res.status(400).json({ error: "Error verifying email" }));
            });
    } else {
        res.end("<h1>Bad Request</h1>");
    }
});

// @route GET api/users/current
// @desc Return current user
// @access Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

// @route POST api/users/registerGoogle
// @desc Register or login using Google
// @access Public
router.post('/registerGoogle', async (req, res) => {
    const token = req.body.token;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: keys.googleClientID
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    User.findOne({ email })
        .then(user => {
            if (user) {
                const userPayload = { id: user.id, name: user.name, avatar: user.avatar, confirm: user.confirm };

                // Sign Token
                jwt.sign(
                    userPayload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    }
                );
            } else {
                var avatar = gravatar.url(email, {
                    s: '200', // Size
                    r: 'pg',  // Rating
                    d: 'mm'  // Default
                });

                var newUser = new User({
                    name: payload.name,
                    email: email,
                    avatar: avatar,
                    password: "123456789",
                    confirm: true
                });

                newUser.save()
                    .then(user => res.json(user))
                    .catch(err => console.log("Error is: ", err));
            }
        })
        .catch(err => console.log(err));
});

router.post('/loginGoogle', (req, res) => {
    const token = req.body.token;

    client.verifyIdToken({
        idToken: token,
        audience: keys.googleClientID
    }).then(ticket => {
        const payload = ticket.getPayload();
        const email = payload.email;

        User.findOne({ email })
            .then(user => {
                if (!user) {
                    errors.email = 'User not found';
                    return res.status(404).json(errors);
                }

                const userPayload = { id: user.id, name: user.name, avatar: user.avatar };

                // Sign Token
                jwt.sign(
                    userPayload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    }
                );
            })
            .catch(err => console.log(err));
    }).catch(err => res.status(400).json({ error: "Invalid token" }));
});

module.exports = router;
