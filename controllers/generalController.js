/**
 * Get index page
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns {VIEW} render index page
 */
exports.getIndex = (req, res, next) => {
    return res.render('index', {title: "Accueil"});
}