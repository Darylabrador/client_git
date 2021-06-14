const path   = require('path');
const fs     = require('fs');

const { validationResult } = require("express-validator");

const simpleGit = require('simple-git');
const git = simpleGit();

/**
 * Open existing git project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.openProject = async (req, res, next) => {
    const { gitUrl } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        let directoryPath = path.dirname(gitUrl);
        fs.readdir(directoryPath, (err, dir) => {
            if(err) {
                return console.log(err)
            }
            res.status(200).json({
                success: true,
                content: dir
            })
        });

        console.log(directoryPath);
    } catch (error) {
        console.log(error);
    }
}