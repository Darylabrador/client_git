const path   = require('path');
const fs     = require('fs');

const { validationResult } = require("express-validator");

const simpleGit = require('simple-git');
const git = simpleGit();

/**
 * Show Content File
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.showFileContent = async (req, res, next) => {
    const { filePath } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if(err) {
                console.log(err)
                return;
            }
            return res.status(200).json({
                content: data
            })
        })
    } catch (error) {
        console.log(error);
    }
}



/**
 * SAve Content File
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.saveContent = async (req, res, next) => {
    const { filePath, fileContent } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        fs.writeFile(filePath, fileContent, (err) => {
            if(err) {
                console.log(err)
                return;
            }
        })
    } catch (error) {
        console.log(error);
    }
}