var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  req.db.from('data').distinct('country').orderBy('country', 'asc')
    .then((rows) => {
      const countries = rows.map(row => row.country);
      res.json(countries);
    })
    .catch((err) => {
      console.log(err);
      res.json({"Error" : true, "Message" : "Error in MySQL query"});
    });
});

module.exports = router;
