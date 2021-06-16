/** Views routes
 * @module router/history
 * @requires express express.Router()
 */


const express = require("express");
const router = express.Router();

const { body } = require('express-validator');

const historyController = require('../controllers/historyController');


/**
 * Get history
 * 
 * @name getHistory POST
 * @function
 * @memberof module:router/history
 * @param {string} '/history' - uri
 * @param {function} historyController.getHistory
 */
router.get("/history", historyController.getHistory);


/**
 * Save path history
 * 
 * @name postHistory POST
 * @function
 * @memberof module:router/history
 * @param {string} '/history/save' - uri
 * @param {function} historyController.postHistory
 */
router.post(
    "/history/save",
    [
        body('folderPath', "Path required")
            .not()
            .isEmpty()
    ],
    historyController.postHistory
);


module.exports = router;