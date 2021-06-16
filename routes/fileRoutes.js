/** Views routes
 * @module router/file
 * @requires express express.Router()
 */


const express = require("express");
const router = express.Router();

const { body } = require('express-validator');

const fileController = require('../controllers/fileController');


/**
 * Show File Content
 * 
 * @name showFileContent POST
 * @function
 * @memberof module:router/file
 * @param {string} '/show/content' - uri
 * @param {function} fileController.showFileContent
 */
router.post(
    "/show/content",
    [
        body('filePath', 'Chemin du fichier obligatoire')
            .not()
            .isEmpty()
    ],
    fileController.showFileContent
);


/**
 * Show File Content
 * 
 * @name saveContent POST
 * @function
 * @memberof module:router/file
 * @param {string} '/save' - uri
 * @param {function} fileController.saveContent
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
    fileController.saveContent
);


module.exports = router;