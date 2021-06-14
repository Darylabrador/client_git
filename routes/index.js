var express = require('express');
var router = express.Router();

var generalController = require('../controllers/generalController');

/* GET home page. */
router.get('/', generalController.getIndex);

module.exports = router;