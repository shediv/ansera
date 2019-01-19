var express = require('express');
var router = express();

var accountController = require('../controllers/account');
//var userController = require('../controller/userController');

/* route for account */
router.get('/:userId', accountController.getUserAccountDetails);
//router.post('/login', userController.login);

module.exports = router;
