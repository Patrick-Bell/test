// register.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./models/user');

router.get('/', (req, res) => {
  res.render('register.ejs', { messages: req.flash('error') });
});

router.post('/', async (req, res) => {
  try {
    const existingUser = await User.findOne({
      $or: [
        { email: req.body.email.trim().toLowerCase() },
        { username: req.body.username.trim().toLowerCase() },
      ],
    });

    if (existingUser) {
      req.flash('error', 'User with this email or username already exists');
      console.log("User already exists")
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email.toLowerCase(),
    });

    await newUser.save();
    console.log(`User ${req.body.email} registered successfully.`);

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error during registration');
    res.redirect('/register');
  }
});

module.exports = router;
