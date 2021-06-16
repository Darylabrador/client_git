const path = require('path');
const express = require('express');
const expressApp = express();
const http = require('http').Server(expressApp);
const database = require('./config/database');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');


// Get all models
const Repository = require('./models/Repository');

// Routes handler
const GeneralRoutes = require('./routes/index');
const GitRoutes     = require("./routes/gitRoutes");
const FileRoutes    = require("./routes/fileRoutes");
const HistoryRoutes = require("./routes/historyRoutes");


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
                database.sync()
                    .then(result => {
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
    expressApp.use('/utils', express.static(path.join(__dirname, 'utils')));

    /** middleware setup */
    expressApp.use(
        session({
            name: 'gitClientCookie',
            secret: 'H9PDdYSllyYrSmX8Ag1fAodE2HRuyTfWb8SwYwjhEfUbGgB6Q2Po2iPZxLj9',
            resave: false,
            saveUninitialized: false,
            cookie: {
                sameSite: true,
                maxAge: 3600 * 1000 * 3
            }
        })
    );

    /** flash message middleware */
    expressApp.use(flash());

    /** flash message datas */
    expressApp.use((req, res, next) => {
        res.locals.success_message = req.flash('success');
        res.locals.error_message = req.flash('error');
        next();
    });


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
    expressApp.use(FileRoutes);
    expressApp.use(GitRoutes);
    expressApp.use(HistoryRoutes);

    expressApp.use((error, req, res, next) => {
        res.status(error.httpStatusCode).json({
            statusCode: error.httpStatusCode,
            message: error.msg
        })
    })
    
    if (typeof callback != 'undefined') {
        callback();
    }
}


module.exports = {
    start: start
};