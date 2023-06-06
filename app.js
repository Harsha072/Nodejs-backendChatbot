const http = require('http');
const cookieParser = require('cookie-parser')
const config = require("./config")
const sls = require('serverless-http')


const db = require("./db")
var express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    errorhandler = require('errorhandler'),
    // dialogflowIndex = require("./controller");
    index = require('./routes/index');
    
    var app = express();

    // const sessionMiddleware = session({
    //   secret: 'some secret string',
    //   resave: false,
    //   saveUninitialized: true,
    //   cookie: {
    //     maxAge: 1200000 // 3 minutes in milliseconds
    //   }
    // });
    // app.use(sessionMiddleware);
    // sessionMiddleware.debug = true;

  


    //this code works for cors change okta change okt aconfig to https://master.d3k1bcu80lqkdq.amplifyapp.com/

    // const corsOptions = {
    //   credentials: true,
    //   origin: function(origin, callback) {
    //     console.log("the origin", origin);
    //     // allow requests from localhost or your production domain
    //     if (origin === 'https://master.d3k1bcu80lqkdq.amplifyapp.com') {
    //       callback(null, true);
    //     }
    //     // otherwise, reject the request
    //     else {
    //       callback(new Error('Not allowed by CORS'));
    //     }
    //   },
    //   exposedHeaders: ['Access-Control-Allow-Origin'],
    // };
    
    // app.use(cors(corsOptions));
    
   


app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));
var isProduction = process.env.NODE_ENV === 'production';
app.use("/api/", index);

    

if (!isProduction) {
  app.use(errorhandler());
}

 
app.get("/test", (req, res) => {
  console.log("test")
  res.send("<h1>It's working 🤗</h1>")
})
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found harsha');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});
// config.someFunction()
// db.connectDb()
// module.exports.server = sls(app);

var server = app.listen(process.env.PORT || 8080, function(){
  console.log('Listening on port harsha calling both fucntions new  ' + server.address().port);
   config.someFunction()
  db.connectDb()
 
});

