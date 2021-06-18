/** Views routes
 * @module router/git
 * @requires express express.Router()
 */


const express = require("express");
const router = express.Router();

const { body } = require('express-validator');

const gitController = require('../controllers/gitController');



/**
 * Git init command
 * 
 * @name gitInit POST
 * @function
 * @memberof module:router/git
 * @param {string} '/init' - uri
 * @param {function} gitController.gitInit
 */
router.post(
    "/init",
    [
        body('folder', 'Chemin du fichier obligatoire')
            .not()
            .isEmpty(),
        body('repoUrl', 'URL du repo obligatoire')
            .not()
            .isEmpty()
    ],
    gitController.gitInit
);



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
    gitController.gitPull
);



/**
 * Git rev-list command
 * 
 * @name gitRevList POST
 * @function
 * @memberof module:router/git
 * @param {string} '/commit/list' - uri
 * @param {function} gitController.gitRevList
 */
 router.post(
    "/commit/list",
    [
        body('folder', 'Chemin du fichier obligatoire')
            .not()
            .isEmpty()
    ],
    gitController.gitRevList
);


/**
 * Git dif command
 * 
 * @name gitDiff POST
 * @function
 * @memberof module:router/git
 * @param {string} '/commit/diff' - uri
 * @param {function} gitController.gitDiff
 */
 router.post(
    "/commit/diff",
    [
        body('folder', 'Chemin du fichier obligatoire')
            .not()
            .isEmpty(),
        body('filePath', 'Chemin du fichier obligatoire')
            .not()
            .isEmpty(),
        body('commit', 'Information du commit obligatoire')
            .not()
            .isEmpty()
    ],
    gitController.gitDiff
);



module.exports = router;