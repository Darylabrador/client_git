const path = require('path');
const fs = require('fs');

const { exec } = require('child_process');

const { validationResult } = require("express-validator");

const simpleGit = require('simple-git');

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
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
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
 * Save Content File
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
            if (err) {
                console.log(err)
                return;
            }
        })
    } catch (error) {
        console.log(error);
    }
}


/**
 * Git Commit Command
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.gitCommit = async (req, res, next) => {
    const { message, folder } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        const git    = await simpleGit(folder);
        await git.add('./*')
        await git.commit(message);
        await res.status(200).json({
            message: "Vous êtes prêt à push"
        });

    } catch (error) {
        console.log(error)
    }
}


/**
* Git Push Command
* 
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
exports.gitPush = async (req, res, next) => {
    const { folder } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        const git  = await simpleGit(folder);
        await git.push();
        await res.status(200).json({
            message: "Votre répo git a été mise à jour"
        });
    } catch (error) {
        console.log(error)
    }
}


/**
 * Git Pull Command
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.gitPull = async (req, res, next) => {
    const { folder } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        const git  = await simpleGit(folder);
        await git.pull();
        await res.status(200).json({
            message: "Votre branch local a été mise à jour"
        });
    } catch (error) {
        console.log(error)
    }
}