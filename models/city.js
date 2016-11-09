var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create City Schema
var City = new Schema({
  cityName              : String,    
  bars                  : {},     //bar ID 
});


module.exports = mongoose.model('cityBars', City);

//
//            rObj["id"]       =   bar.id;
//            rObj["image"]    =   bar.image_url;
//            rObj["name"]     =   bar.name;
//            rObj["address"]  =   bar.location.address1;
//            rObj["city"]     =   req.params.city;
//            rObj["going"]    =   req.params.city;