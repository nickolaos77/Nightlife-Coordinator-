var passport = require('passport');
var User = require('../models/user');


module.exports = function() {
    console.log("from init");
  passport.serializeUser(function(user, done) {
    done(null, user.id);
    console.log(user.id);  
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
       // console.log(user);
    });
  });

};