const { validationResult } = require("express-validator");
const simpleGit            = require('simple-git');


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
        const err = new Error(error);
        err.httpStatusCode = 500;
        err.msg = "Il y a un problème de merge à résoudre";
        next(err);
    }
}