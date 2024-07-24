var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  const { country, populatedWithin, ...rest } = req.query;

  // Check for invalid query parameters
  if (Object.keys(rest).length > 0) {
    return res.status(400).json({ error: true, message: 'Invalid query parameter(s).' });
  }

  if (!country) {
    return res.status(400).json({ error: true, message: 'Country is a required query parameter.' });
  }

  // Validate populatedWithin parameter
  const validPopulatedWithin = ['5km', '10km', '30km', '100km'];
  if (populatedWithin && !validPopulatedWithin.includes(populatedWithin)) {
    return res.status(400).json({
      error: true,
      message: 'Invalid populatedWithin query parameter. Valid values are 5, 10, 30, or 100.'
    });
  }

  let query = req.db.from('data').select('id', 'name', 'country', 'region', 'subregion').where('country', country);

  switch (populatedWithin) {
    case '5km':
      query = query.where('population_5km', '>', 0);
      break;
    case '10km':
      query = query.where('population_10km', '>', 0);
      break;
    case '30km':
      query = query.where('population_30km', '>', 0);
      break;
    case '100km':
      query = query.where('population_100km', '>', 0);
      break;
    default:
      break;
  }

  query.then((rows) => {
    if (rows.length === 0) {
      return res.status(200).json([]);
    }
    res.json(rows);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({ error: true, message: "Error in MySQL query" });
  });
});

module.exports = router;
