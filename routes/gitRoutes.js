/** Views routes
 * @module router/git
 * @requires express express.Router()
 */


const express = require("express");
const router = express.Router();

const { body } = require('express-validator');

const gitController = require('../controllers/gitController');


/**
 * Git commit command
 * 
 * @name gitCommit POST
 * @function
 * @memberof module:router/git
 * @param {string} '/commit' - uri
 * @param {function} gitController.gitCommit
 */
router.post(
    "/commit",
    [
        body('message', 'message obligatoire')
            .not()
            .isEmpty(),
        body('folder', 'Chemin du fichier obligatoire')
            .not()
            .isEmpty(),
    ],
    gitController.gitCommit
);



/**
 * Git push command
 * 
 * @name gitPush POST
 * @function
 * @memberof module:router/git
 * @param {string} '/push' - uri
 * @param {function} gitController.gitPush
 */
router.post(
    "/push",
    [
        body('folder', 'Chemin du fichier obligatoire')
            .not()
            .isEmpty()
    ], gitController.gitPush
);



/**
 * Git pull command
 * 
 * @name gitPull POST
 * @function
 * @memberof module:router/git
 * @param {string} '/pull' - uri
 * @param {function} gitController.gitPull
 */
router.post(
    "/pull",
    [
        body('folder', 'Chemin du fichier obligatoire')
            .not()
            .isEmpty()
    ],
    gitController.gitPush
);


module.exports = router;