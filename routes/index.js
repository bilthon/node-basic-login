var express = require('express');
var router = express.Router();
var db = require('../db');
var hash = require('../pass').hash;

/* GET home page. */
router.get("/", function (req, res) {
    if (req.session.user) {
        console.log('session: '+JSON.stringify(req.session));
        res.send("Welcome " + req.session.user.username + "<br>" + "<a href='/logout'>logout</a>");
    } else {
        res.send("<a href='/login'> Login</a>" + "<br>" + "<a href='/signup'> Sign Up</a>");
    }
});

router.get("/login", function (req, res) {
    res.render("login");
});

router.post("/login", function (req, res) {
    db.authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {
            req.session.regenerate(function () {
                req.session.user = user;
                res.redirect('/');
            });
        } else {
            // req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            res.redirect('/login');
        }
    });
});

router.get("/signup", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signup");
    }
});

router.post("/signup", db.userExist, function (req, res) {
    var password = req.body.password;
    var username = req.body.username;
    console.log('username: '+username+', password: '+password);
    hash(password, function (err, salt, hash) {
        console.log('hashing password: '+password);
        if (err) throw err;
        var user = new db.User({
            username: username,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
            db.authenticate(newUser.username, password, function(err, user){
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user;
                        res.redirect('/');
                    });
                }
            });
        });
    });
});

router.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

router.get('/profile', db.requiredAuthentication, function (req, res) {
    res.send('Profile page of '+ req.session.user.username +'<br>'+' click to <a href="/logout">logout</a>');
});

module.exports = router;
