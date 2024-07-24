var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

router.post('/', function(req, res) {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: 'Request body incomplete, both email and password are required'
    });
  }

  req.db.from('users')
    .select('*')
    .where('email', email)
    .then((users) => {
      if (users.length === 0) {
        return res.status(401).json({
          error: true,
          message: 'Incorrect email or password'
        });
      }

      const user = users[0];

      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({
          error: true,
          message: 'Incorrect email or password'
        });
      }

      const expiresIn = 86400;

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'f9555b44c4b223960022e84055e11bfd2c07f7c6f13a5edee2b1d65a865ed4c05c02049672a4e4ff8e2a567b55f8a07b2357d661f482790c7947ad1e0be4db94', { expiresIn: expiresIn });

      return res.status(200).json({
        token: token,
        token_type: 'Bearer',
        expires_in: expiresIn
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: true, message: 'Error in MySQL query' });
    });
});

module.exports = router;
