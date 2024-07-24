var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.get('/:id', function(req, res, next) {
  const id = req.params.id;
  const authHeader = req.headers['authorization'];

  // Validate query parameters
  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({ error: true, message: "Invalid query parameters. Query parameters are not permitted." });
  }

  if (authHeader) {
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: true, message: 'Authorization header is malformed' });
  }
}

  let query = req.db.from('data').select('id', 'name', 'country', 'region', 'subregion', 'last_eruption', 'summit', 'elevation', 'latitude', 'longitude').where('id', id);

  const verifyToken = new Promise((resolve, reject) => {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET || 'f9555b44c4b223960022e84055e11bfd2c07f7c6f13a5edee2b1d65a865ed4c05c02049672a4e4ff8e2a567b55f8a07b2357d661f482790c7947ad1e0be4db94', function(err, decoded) {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            reject({ status: 401, error: true, message: 'Expired JWT token' });
          } else {
            reject({ status: 401, error: true, message: 'Invalid JWT token' });
          }
        } else {
          query = query.select('population_5km', 'population_10km', 'population_30km', 'population_100km');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });

  verifyToken
    .then(() => {
      return query.then((rows) => {
        if (rows.length > 0) {
          res.json(rows[0]);
        } else {
          res.status(404).json({ error: true, message: `Volcano with ID: ${id} not found.` });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      if (typeof err === 'object') {
        res.status(err.status).json(err);
      } else {
        res.status(500).json({ error: true, message: "Error in MySQL query" });
      }
    });
});

module.exports = router;
