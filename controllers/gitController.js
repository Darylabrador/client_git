const { validationResult } = require("express-validator");
const simpleGit            = require('simple-git');
const fs                   = require('fs');
const path                 = require('path');
const { exec }             = require('child_process');


/**
 * Git init Command
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
 exports.gitInit = async (req, res, next) => {
    const { folder, repoUrl } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        var filepath    = "README.md";
        var fileContent = "project initialisation";
        
        if(!fs.existsSync(path.join(folder, filepath))) {
            await fs.appendFileSync(path.join(folder, filepath), fileContent);
        }
        
        const git    = await simpleGit(folder);
        await git.init();
        await git.add('./*');
        await git.commit("first commit!");
        await git.branch(['-M', 'main']);
        await git.addRemote('origin', repoUrl);
        await git.push(['-u', 'origin', 'main']);
        await res.status(200).json({
            message: "Votre repo est initialisé"
        });

    } catch (error) {
        console.log(error)
        const err = new Error(error);
        err.httpStatusCode = 500;
        err.msg = "Une erreur est survenue";
        next(err);
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
        const err = new Error(error);
        err.httpStatusCode = 500;
        err.msg = "Une erreur est survenue";
        next(err);
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
        const err = new Error(error);
        err.httpStatusCode = 500;
        err.msg = "Vous devez commit et pull d'abord";
        next(err);
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
        const err = new Error(error);
        err.httpStatusCode = 500;
        err.msg = "Il y a un problème de merge à résoudre";
        next(err);
    }
}



/**
 * Git rev-list Command
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.gitRevList = async (req, res, next) => {
    const { folder } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        await exec(`cd ${folder} & git rev-list --remotes`, (err, stdout, stderr) => {
            let dataArray = stdout.split('\n');
            let dataArrayFormated = [];
            dataArray.forEach(element => {
                if(element != "") {
                    dataArrayFormated.push(element)
                }
            })
            return res.status(200).json({
                content: dataArrayFormated
            })
        });
    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        err.msg = "Aucun commit";
        next(err);
    }
}


/**
 * Git diff command
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.gitDiff = async (req, res, next) => {
    const { folder, filePath, commit } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            success: false,
            message: errors.array()[0].msg
        })
    }

    try {
        await exec(`cd ${folder} & git diff ${commit} ${filePath}`, (err, stdout, stderr) => {
            return res.status(200).json({
                content: stdout
            })
        });
    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        err.msg = "Aucun";
        next(err);
    }
}