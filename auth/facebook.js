var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');
var config = require('../config');
var init = require('./init');
//https://www.npmjs.com/package/passport-facebook
//http://passportjs.org/docs/
//https://scotch.io/tutorials/easy-node-authentication-facebook
passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL:config.facebook.callbackURL,
    profileFields: ['id', 'displayName', 'photos', 'email'],
    enableProof: true,
  },
  function(accessToken, refreshToken, profile, done) {
    
    var searchQuery = {
      someID     : profile.id,
      authMethod : "Facebook"        
    };

    var updates = {
      authMethod :  "Facebook",    
      someID     :  profile.id,
      name       :  profile.displayName,
      avatar     :  profile.photos[0].value, 
      email      :  profile.emails[0].value,
          
    };

    var options = {
      upsert: true,
      new   : true    
    };

    // update the user if s/he exists or add a new user //
    User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {//this is a mongoose function
      if(err) {
        return done(err);
      } else {
          console.log("user");
          console.log(user);
        return done(null, user);//if there is no error returned return the user
      }
    });
  }

));

// serialize user into the session
init();

module.exports = passport;