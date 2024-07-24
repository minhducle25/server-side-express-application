var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json({ name: 'Duc Minh Le', student_number: 'n11479116' });
});

module.exports = router;
