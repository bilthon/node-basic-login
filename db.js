var mongoose = require('mongoose');
var hash = require('./pass').hash;

/*
Database and Models
*/
var connection = mongoose.createConnection('mongodb://localhost/myapp')

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String
});

var User = connection.model('users', UserSchema);

/*
Helper Functions
*/
function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);

    User.findOne({
        username: name
    },

    function (err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));
            hash(pass, user.salt, function (err, hash) {
                if (err) return fn(err);
                if (hash == user.hash) return fn(null, user);
                fn(new Error('invalid password'));
            });
        } else {
            return fn(new Error('cannot find user'));
        }
    });

}

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

function userExist(req, res, next) {
    console.log('userExist. User: '+User);
    User.count({
        username: req.body.username
    }, function (err, count) {
        console.log('user exist result. count: '+count);
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.render("signup", { error : req.session.error });
        }
    });
}

module.exports = {
    authenticate: authenticate,
    requiredAuthentication: requiredAuthentication,
    userExist: userExist,
    User: User,
    connection: connection
}