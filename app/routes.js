// load all the things we need
var Notification = require('./models/notification');
var User         = require('./models/user');
var Schedule     = require('../config/schedule.js');

// routes
module.exports = function(app, passport) {
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        // find all notifications for this user to send along
        User.findOne({'local.email' : req.user.local.email}, function(err, user){
            if(err){
                throw err;
            }
            if(!user){
                console.log("user:" + user);
            }
            else{ // success
                Notification.find({'userId' : user.id}, function(err, notification){
                    if(!notification){
                        return;
                    }
                    res.render('profile.ejs', {
                        user : req.user, // get the user out of session and pass to template
                        notifications : notification
                    });
                });
            }
            // 
        });
    });

    //add a notification for the current user
    app.post('/add', isLoggedIn, function(req, res){

        // set notification details
        User.findOne({'local.email' : req.user.local.email}, function(err, user){
            if(err){
                throw err;
            }
            if (!user){
                console.log("Couldn't find user to add notification for");
                req.flash('errorMessage', 'Couldn\'t find user to add notification for');
                return;
            }
            else {
                // user exists
                var newNotification = new Notification();
                newNotification.userId = user.id
                newNotification.name = req.body.name;
                newNotification.contactInfo = req.body.contactInfo;
                newNotification.notes = req.body.notes;
                newNotification.type = Schedule[req.body.schedule].type;
                newNotification.frequency = Schedule[req.body.schedule].frequency;

                // set next send day/time
                if(newNotification.type === "recurring"){
                    var next = new Date();
                    newNotification.nextSend = next.setDate(next.getDate() 
                                               + newNotification.frequency);
                }else{
                    newNotification.nextSend = null;
                }

                // save the notification
                newNotification.save(function(err) {
                    if (err) throw err;
                    res.redirect('/profile');
                });
            }
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}