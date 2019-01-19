/**
 * Module Dependencies.
 */
var express = require('express'),
    passport = require('passport'),
    StackExchangeStrategy = require('./lib').Strategy,
    morgan = require('morgan'), // logger
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');
const request = require('request-promise');
const zlib = require('zlib');

var mongoose = require('mongoose');
var envConfig = require('./config/config.env.js');

var User = require('./model/user').User;


/**
 * Configurations.
 */
var STACK_EXCHANGE_APP_ID = '13021', // '*** YOUR APP ID (CLIENT ID) ***',
    STACK_EXCHANGE_APP_SECRET = 'MJY3DZowYEiuKYFJ4HJePA((', //'*** YOUR APP SECRET (CLIENT SECRET) ***',
    STACK_EXCHANGE_APP_KEY = 'gUtsEyt6yj5O)MX*)Xs1Gw((';

//Route File
var routes = require('./routes/index');

/**
 * Passport session setup
 */
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});



/**
 * Use the StackExchangeStrategy within Passport
 */
passport.use(new StackExchangeStrategy({
        clientID: STACK_EXCHANGE_APP_ID,
        clientSecret: STACK_EXCHANGE_APP_SECRET,
        callbackURL: 'http://13.250.77.198/auth/stack-exchange/callback',
        stackAppsKey: STACK_EXCHANGE_APP_KEY,
        site: 'stackoverflow'
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Facebook profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Facebook account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));


/*MongoDb Connection */
mongoose.connect(envConfig.mongoUrl, function(err){
    if(err) mongooseLog('Mongoose error: ' + err);
});

//MONGODB CONNECTION EVENTS.
mongoose.connection
    .on('connected', function () {
        mongooseLog('Connection open to ' + envConfig.mongoUrl);
    })
    .on('error',function (err) {
        mongooseLog('Connection error: ' + err);
    })
    .on('disconnected', function () {
        mongooseLog('Connection disconnected');
    });

function mongooseLog(data) {
    return console.log(data);
}


/**
 * Configure Express
 */
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan());
app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: 'keyboard cat'}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
app.use(function(request, response, next){
    console.log(  "\033[34m \033[1m" + request.method , 
                  "\033[36m \033[1m REQUEST URL: " + "\033[32m "+request.url , 
                  "\033[36m \033[1m REQUEST TIME: " + "\033[32m "+ new Date() + "\033[31m ");
    next();
});
app.use(express.static("./app"));

app.get('/lastStep', function(req, res){
    res.render('index', { user: req.user });
});

app.post('/api/authenticate', function(req, res){
    User.findOne({email: req.body.email, isActive : true},function(err, result){
        if(result){
            // return [200, { token: 'fake-jwt-token' }, {}];
            return res.status(200).json({ token: 'token'});
        } else {
            // return [200, {}, {}];
            return res.status(500).json({ token: 'token'});
        }
    })
});

app.get('/api/profile', function(req, res){
    User.findOne({email: req.query.email, isActive : true},function(err, result){
        if(result){
            // return [200, { token: 'fake-jwt-token' }, {}];
            return res.status(200).json({ result: result });
        } else {
            // return [200, {}, {}];
            return res.status(500).json({ result: result });
        }
    })
});

app.use('/api/account', routes);

app.post('/account', function(req, res){
    var data  = JSON.parse(req.user._raw);
    //Get user tags
    var requestOptions,
        requestCall,
        tagsData,
        buffer,
        gunzip;

    requestOptions = {
        url: 'https://api.stackexchange.com//2.2/users/'+req.user.id+'/tags?order=desc&sort=popular&site=stackoverflow'
    };
    requestCall = request(requestOptions);

    requestCall.on('response', function (wikiRequest) {
        if (wikiRequest.statusCode === 200) {
            buffer = [];
            gunzip = zlib.createGunzip();
            wikiRequest.pipe(gunzip);
            gunzip.on('data', function (data) {
                // decompression chunk ready, add it to the buffer
                buffer.push(data.toString());
            }).on("end", function () {
                // response and decompression complete, join the buffer and return
                tagsData = JSON.parse(buffer.join(''));
                User.findOne({email: req.body.email, isActive : 1},function(err, result){
                    if(result){
                        //return res.status(403).json({message: "User Already registered"})
                        var user = {
                            userId : req.user.id,
                            accountId : req.user.accountId,
                            displayName : req.user.displayName,
                            profileUrl : req.user.profileUrl,
                            createdAt : new Date(),
                            updatedAt : new Date(),
                            badges : data.items[0].badge_counts,
                            reputation : data.items[0].reputation,
                            tags: tagsData.items,
                            email : req.body.email
                        };
                        console.log("User Already registered");
                        // return res.render('account', { user: user });
                        res.redirect('/');
                    }
                    else{
                        var newUser = new User();
                        newUser.userId = req.user.id;
                        newUser.accountId = req.user.accountId;
                        newUser.displayName = req.user.displayName;
                        newUser.profileUrl = req.user.profileUrl;
                        newUser.createdAt = new Date();
                        newUser.updatedAt = new Date();
                        newUser.badges = data.items[0].badge_counts;
                        newUser.reputation = data.items[0].reputation;
                        newUser.email = req.body.email;
                        newUser.tags = tagsData.items;
                        newUser.isActive = true;
                        newUser.save(function(err) {
                            // return res.render('account', { user: newUser });
                            console.log("User registered");
                            res.redirect('/');
                        });
                    }
                })
            })
        }
    })

});

app.get('/auth/stack-exchange',
    passport.authenticate('stack-exchange'));

app.get('/auth/stack-exchange/callback',
    passport.authenticate('stack-exchange', { failureRedirect: '/login' }),
    function(req, res) {
        console.log("here", res.user);
        res.redirect('/lastStep');
    });

app.get('/users', function(req, res){
    User.find({},function(err, users){
        return res.status(200).json({ users: users });
    })
});

app.get('/users/:email', function(req, res){
    User.findOneAndDelete({email : req.params.email},function(err, user){
        return res.status(200).json({ user: user });
    })
});

// app.get('/logout', function(req, res){
//     req.logout();
//     res.redirect('/');
// });

app.get("/", function(req, res) {
    res.sendFile("./app/index.html");
});

app.listen(3000, function() {
    console.log('Node app is running on port', 3000);
});



function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}