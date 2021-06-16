const fs  = require('fs');

const { validationResult } = require("express-validator");

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
                const error = new Error(err);
                error.httpStatusCode = 500;
                error.msg = 'Impossible de lire le fichier';
                throw error;
            }
            return res.status(200).json({
                content: data
            })
        })
    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        err.msg = "Une erreur est survenue";
        next(err);
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
                const error = new Error(err);
                error.httpStatusCode = 500;
                error.msg = "Impossible d'écrire dans le fichier";
                throw error;
            }
        })
    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        err.msg = "Une erreur est survenue";
        next(err);
    }
}
