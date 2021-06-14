const path = require('path');
const fs = require('fs');

const { validationResult } = require("express-validator");

const simpleGit = require('simple-git');
const git = simpleGit(path.join(__dirname, '..', 'repos'), { binary: 'git' });

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
        console.log(errors.array()[0].msg);
    }

    const dir = path.join(__dirname, "..", "repos");
    
    try {
        if(fs.existsSync(dir)){
            await fs.rmdirSync(dir, {recursive: true});
            await fs.mkdirSync(dir)
        }
        await git.init().addRemote("origin", gitUrl);
        await git.pull('origin', 'main');
    } catch (error) {
        console.log(error);
    }
}


/**
 * Display git project structure
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.displayStructure = async (req, res, next) => {
    const { gitUrl } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array()[0].msg);
    }

    try {
        console.log(gitUrl)
    } catch (error) {
        console.log(error);
    }
}