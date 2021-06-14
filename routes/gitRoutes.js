/** Views routes
 * @module router/git
 * @requires express express.Router()
 */


const express = require("express");
const router = express.Router();

const { body } = require('express-validator');

const gitController = require('../controllers/gitController');


/**
 * Open git project
 * 
 * @name openProject POST
 * @function
 * @memberof module:router/git
 * @param {string} '/open/project' - uri
 * @param {function} gitController.openProject
 */
router.post(
    "/open/project", 
    [
        body('gitUrl', 'URL Obligatoire')
        .not()
        .isEmpty()
    ],
    gitController.openProject
);

module.exports = router;