const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('../knexfile.js'));
const moment = require('moment');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'f9555b44c4b223960022e84055e11bfd2c07f7c6f13a5edee2b1d65a865ed4c05c02049672a4e4ff8e2a567b55f8a07b2357d661f482790c7947ad1e0be4db94', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: true, message: err.name === 'TokenExpiredError' ? 'Expired JWT token' : 'Invalid JWT token' });
    }
    req.user = decoded;
    next();
  });
};

// Validation function
const validateProfileData = ({ firstName, lastName, dob, address }) => {
  if (!/^[a-zA-Z]+$/.test(firstName) || !/^[a-zA-Z]+$/.test(lastName) || typeof address !== 'string') {
    return 'Request body invalid: firstName, lastName and address must be strings only.';
  }
  const dobMoment = moment(dob, 'YYYY-MM-DD', true);
  if (!dobMoment.isValid()) return 'Invalid input: dob must be a real date in format YYYY-MM-DD.';
  if (dobMoment.isAfter(moment())) return 'Invalid input: dob must be a date in the past.';
  return null;
};

// Route to get user profile
router.get('/user/:email/profile', verifyToken, (req, res) => {
  const email = req.params.email;
  const fields = req.user && req.user.email === email ? ['email', 'firstName', 'lastName', 'dob', 'address'] : ['email', 'firstName', 'lastName'];
  knex('users').where({ email }).select(fields)
    .then(userProfile => {
      if (userProfile.length > 0) {
        const profile = userProfile[0];
        if (profile.dob) profile.dob = moment(profile.dob).format('YYYY-MM-DD');
        res.json(profile);
      } else {
        res.status(404).json({ error: true, message: 'User not found' });
      }
    })
    .catch(() => res.status(500).json({ error: true, message: 'Database query failed.' }));
});

// Route to update user profile
router.put('/user/:email/profile', verifyToken, (req, res) => {
  if (!req.user) return res.status(401).json({ error: true, message: 'Authorization header ("Bearer token") not found' });

  const { email } = req.params;
  const { firstName, lastName, dob, address } = req.body;
  if (!firstName || !lastName || !dob || !address) return res.status(400).json({ error: true, message: 'Request body incomplete: firstName, lastName, dob and address are required.' });

  const validationError = validateProfileData({ firstName, lastName, dob, address });
  if (validationError) return res.status(400).json({ error: true, message: validationError });

  if (req.user.email !== email) return res.status(403).json({ error: true, message: 'Forbidden' });

  knex('users').where({ email }).update({ firstName, lastName, dob, address })
    .then(count => {
      if (!count) return res.status(404).json({ error: true, message: `Profile with email: ${email} not found.` });
      return knex('users').where({ email }).select('email', 'firstName', 'lastName', 'dob', 'address');
    })
    .then(userProfile => {
      if (userProfile.length > 0) {
        const profile = userProfile[0];
        profile.dob = moment(profile.dob).format('YYYY-MM-DD');
        res.json(profile);
      } else {
        res.status(404).json({ error: true, message: `Profile with email: ${email} not found.` });
      }
    })
    .catch(() => res.status(500).json({ error: true, message: 'Database update failed.' }));
});

module.exports = router;
