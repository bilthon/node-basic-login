var express = require('express');
var router = express.Router();
var db = require('../db');
var hash = require('../pass').hash;

/* GET home page. */
router.get("/", function (req, res) {
    if (req.session.user) {
        res.render("welcome", {username: req.session.user.username});
    } else {
        res.render("welcome")
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
            res.render('login', { error: 'Authentication failed, please check your  username and password.'} );
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
    db.createUser(username, password, function(err, user){
        if(user){
            req.session.regenerate(function(){
                req.session.user = user;
                res.redirect('/');
            });
        }
    });
});

router.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

module.exports = router;
