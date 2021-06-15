/** Views routes
 * @module router/git
 * @requires express express.Router()
 */


const express = require("express");
const router = express.Router();

const { body } = require('express-validator');

const gitController = require('../controllers/gitController');

/**
 * Show File Content
 * 
 * @name showFileContent POST
 * @function
 * @memberof module:router/git
 * @param {string} '/show/content' - uri
 * @param {function} gitController.showFileContent
 */
router.post(
    "/show/content", 
    [
        body('filePath', 'Chemin du fichier obligatoire')
        .not()
        .isEmpty()
    ],
    gitController.showFileContent
);


/**
 * Show File Content
 * 
 * @name saveContent POST
 * @function
 * @memberof module:router/git
 * @param {string} '/save' - uri
 * @param {function} gitController.saveContent
 */
 router.post(
    "/save", 
    [
        body('filePath', 'Chemin du fichier obligatoire')
        .not()
        .isEmpty(),
        body('fileContent', 'Contenue obligatoire')
        .not()
        .isEmpty()
    ],
    gitController.saveContent
);


module.exports = router;