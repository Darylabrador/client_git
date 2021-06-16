const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const dateFormat = require("dateformat");

const { validationResult } = require("express-validator");

const Repository = require('../models/Repository');


/**
 * Get path history
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getHistory = async (req, res, next) => {
    try {
        let history = await Repository.findAll({
            attributes: ['path'],
            limit: 5,
            order: [
                ['openedAt', "desc"]
            ],
        })
        return res.status(200).json({ history })
    } catch (error) {
        console.log(error);
    }
}



/**
 * Save path history
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.postHistory = async (req, res, next) => {
    const { folderPath } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        var now     = new Date();
        var datenow = await dateFormat(now, "yyyy-mm-dd hh:MM:ss");

        const historyExist = await Repository.findOne({ where: { path: folderPath } });

        if (!historyExist) {
            const historyPath = new Repository({ path: folderPath, openedAt: datenow});
            await historyPath.save();
        } else {
            historyExist.openedAt = datenow;
            await historyExist.save();
        }

        return res.status(200).json({
            message: "Saved folder path"
        })
    } catch (error) {
        console.log(error);
    }
}