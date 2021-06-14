const path          = require('path');
const express       = require('express');
const expressApp    = express();
const http          = require('http').Server(expressApp);
const database      = require('./config/database');
const session       = require('express-session');
const flash         = require('connect-flash');
const bcrypt        = require('bcryptjs');

// Get all models


// Routes handler
const GeneralRoutes = require('./routes/index');

/* variable initialisation's */
const router = {
    isStarted: false
};

/**
* Starting web server on port 3000
* 
* When we start we create tables in database if not exist
* @param {*} callback 
*/
function start(callback) {
    if (router.isStarted === false) {
        init(function () {
            loadRoutes(function () {
                // setup relations
                // database connection and sync

                // starting web server
                http.listen(3000, function () {
                    console.log('Application is running on port 3000');
                    router.isStarted = true;
                    if (typeof callback != 'undefined') {
                        callback();
                    }
                });
            });
        });
    } else {
        console.log("Application already started");
        if (typeof callback != 'undefined') {
            callback();
        }
    }
}


/**
* Initialisation of view engine and others parameters
* @param {*} callback 
*/
function init(callback) {
    /** view engine setup*/
    expressApp.set('views', path.join(__dirname, 'views'));
    expressApp.set('view engine', 'ejs');
    expressApp.use(express.json());
    expressApp.use(express.urlencoded({ extended: false }));
    expressApp.use(express.static(path.join(__dirname, 'public')));

    /* Keep server down */
    router.isStarted = false;
    if (typeof callback != 'undefined') {
        callback();
    }
}


/**
 * Route's management
 * @param {*} callback 
 */
function loadRoutes(callback) {

    // Defines routes
    expressApp.use('/', GeneralRoutes);

    if (typeof callback != 'undefined') {
        callback();
    }
}


module.exports = {
    start: start
};