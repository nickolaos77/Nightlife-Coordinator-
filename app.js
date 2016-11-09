var express      = require('express'),
    app          = express(),
    request      = require('request'),
    mongoose     = require('mongoose'),
    passport     = require('passport'),    
    session      = require('express-session'),
    MongoStore   = require('connect-mongo')(session)
    routes       = require('./routes/routes.js'),
    init         = require('./auth/init');    
var PORT         = process.env.PORT || 3000,    
 //   url          = 'mongodb://localhost:27017/nigthy';
  url          = process.env.MONGOLAB_URI;
var handlebars      = require('express-handlebars').create({
        defaultLayout: 'main',
        helpers:{
            section:function(name,options){
                if(!this._sections) this._sections ={};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
//http://stackoverflow.com/questions/38138445/node3341-deprecationwarning-mongoose-mpromise
mongoose.Promise = global.Promise;
mongoose.connect(url);
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+ '/public'));
app.use(session({
  secret: 'The sun is cloudy',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ url: url /*process.env.MONGOLAB_URI*/ })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

app.listen(PORT, function(){
    console.log('Express listening on port '+ PORT + '!');
});
