var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create User Schema
var User = new Schema({
  authMethod  : String,    
  someID      : String,
  name        : String,
  avatar      : String,
  email       : String,
  barsGoing   : [],    
});


module.exports = mongoose.model('users', User);