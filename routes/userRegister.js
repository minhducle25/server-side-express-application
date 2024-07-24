// userRegister.js
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

/* POST /userRegister */
router.post('/', function(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      "error": true,
      "message": "Request body incomplete, both email and password are required"
    });
  }

  req.db.from('users')
    .select('*')
    .where('email', email)
    .then((users) => {
      if (users.length > 0) {
        return res.status(409).json({
          "error": true,
          "message": "User already exists"
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      req.db.from('users')
        .insert({email: email, password: hashedPassword})
        .then(() => {
          return res.status(201).json({
            "message": "User created"
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({"Error" : true, "Message" : "Error in MySQL query"});
    });
});

module.exports = router;