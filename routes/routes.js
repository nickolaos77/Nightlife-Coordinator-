var express          = require('express'),
    router           = express.Router(),
    User             = require('../models/user'),
    City             = require('../models/city'),
    passportFacebook = require('../auth/facebook'),
    request          = require('request');

var middleware = {
    isLoggedIn:function(req,res,next){
        if (req.isAuthenticated()){
            return next();          
        }
        else {res.redirect('/auth/facebook')}
    },
    vote:function(req,res,next){
       City.findOneAndUpdate(
            {cityName : req.params.city,"bars.id":req.params.id}, //querry
            {$inc : { "bars.$.going" : 1 } },
            {upsert   : true,
             new      : true },
            function(err,city){
                if(err) {console.log(err);}
                else {
                    console.log(req.user);
                    res.redirect('/' + req.params.city);
                }
            }     
        );  
    }
}

var cityBars = function(req,body){
        var businesses = JSON.parse(body).businesses;
        var newBusinesses = businesses.map(function(bar){
            var rObj = {};
            rObj["id"]       =   bar.id;
            rObj["image"]    =   bar.image_url;
            rObj["name"]     =   bar.name;
            rObj["address"]  =   bar.location.address1;
            rObj["city"]     =   req.params.city;
            rObj["going"]    =   0;
            return rObj;
        });
            return newBusinesses;
        }

//authenticate with facebook
router.get('/auth/facebook', passportFacebook.authenticate('facebook', { scope : "email" } ));

router.get('/auth/facebook/callback',
  passportFacebook.authenticate('facebook', { failureRedirect: '/fail' }),                 
  function(req, res) {
    User.find({_id:req.user._id}, function(err,user){
        console.log('lastBarCity');
        var bars = user[0].barsGoing;
        if (bars.length>0){ res.redirect('/' + bars[bars.length-1].city )}
        
        else{ res.redirect('/'); }
    }); 
  });
//Attention when the logout route was the last route it didn't work because it was caught from the /:city route
router.get('/logout', function(req,res){
    console.log('User Logged out');
    req.logout();
    res.redirect('back');
});

router.get('/',function(req,res){
            if (req.isAuthenticated()){
            res.render('home',{logoutMenu:true});          
        } else { res.render('home'); }
})


router.get('/:city', function(req,res){ 
    //check if city is already in the database
    City.find({cityName : req.params.city},function(err,city){
        if (err) {console.log(err)
                    
                 res.render("home", {nobars:true, acity:req.params.city});}
        else {
            if (city.length >= 1 && req.isAuthenticated()){ 
                res.render("cityBars", {bars:city[0].bars,logoutMenu:true});
            }
            else if(city.length >= 1 && !req.isAuthenticated()){
                res.render("cityBars", {bars:city[0].bars});
            }
            else {//see https://github.com/request/request#custom-http-headers
             request({url:'https://api.yelp.com/v3/businesses/search?location=' + req.params.city +'&categories=bars&limit=50', 
            headers:{ 'Authorization' : 'Bearer ZkPmz1xpyGY_Jz0_b38SwDwqL_7EvmOLH6kGZm8K0BU2kjPLowJdF-Vi8ld5YU7KWHZYMb6u78JGXAAvCl_LnZ5r2krQCVJ-prrpKotkJp2zdl91heManY0XmpoPWHYx'}}, function (error, response, body) {
    if (error){console.log(error)}    
    else if (!error && response.statusCode == 200) {     
        //If the city with its bars is not in the collection it creates it, if it already is it grabs it from the database 
        City.findOneAndUpdate(
            {cityName : req.params.city}, //querry
            {cityName : req.params.city,  //update
             bars     : cityBars(req,body)},
            {upsert   : true,
             new      : true },
            function(err,city){
                if(err) {return done(err);}
                else {
                    res.render("cityBars", {bars:city.bars})
                }
            }     
        );
    }

    else if (response.statusCode == 400){
        res.render("home", {nobars:true, acity:req.params.city});
    }    
        
})
            }
        }
    });
});

router.post('/:city/:id',middleware.isLoggedIn,
    //if user is logged in he can vote if he hasn't already, if he has already voted he will be removed from the bar
    function(req,res){
        User.find({_id:req.user._id},function(err,user){
            if (err){console.log(err)}
            else{//if the user isn't already going in the bar update him now
        var bar = user[0].barsGoing.filter(function( bar ) {return bar.barId == req.params.id ;});
                
                console.log('bar');
                console.log(bar);
    if (bar.length==0){ 
        User.update({_id:req.user._id}, {$push:{barsGoing:{barId:req.params.id, city:req.params.city}}}, function (err, user){
            if (err) {console.log(err)}
            else{
       City.findOneAndUpdate(
            {cityName : req.params.city,"bars.id":req.params.id}, //querry
            {$inc : { "bars.$.going" : 1 } },
            {upsert   : true,
             new      : true },
            function(err,city){
                if(err) {console.log(err);}
                else {
                    console.log(req.user);
                    res.redirect('/' + req.params.city);
                }
            }     
        ); 
            }
        });
                }
        else{//if the user is voting for the second time remove him from the bar
              User.update({_id:req.user._id}, {$pull:{barsGoing:{barId:req.params.id, city:req.params.city}}}, function (err, user){
            if (err) {console.log(err)}
            else{
       City.findOneAndUpdate(
            {cityName : req.params.city,"bars.id":req.params.id}, //querry
            {$inc : { "bars.$.going" : -1 } },
            {upsert   : true,
             new      : true },
            function(err,city){
                if(err) {console.log(err);}
                else {
                    console.log(req.user);
                    res.redirect('/' + req.params.city);
                }
            }     
        ); 
            }
        });   
            
        }               
            }
        })    
    });


module.exports = router;