// Dependencies
const express = require("express");
const mongoose = require("mongoose");
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const hbs = require('handlebars');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const multer = require('multer');
const moment = require('moment');
const { envPort, dbURL, sessionKey } = require('./config/config');
const MongoStore = require('connect-mongo')(session);

const app = express();
require('./config/passport')(passport);

// Statics
app.use(express.static('assets'));
app.use(express.static(__dirname + '/public'));
app.enable('strict routing');
app.all('/admin', function(req, res) { res.redirect('/admin/'); });
app.use('/admin/',express.static(__dirname+'/public'));
app.use('/admin/',express.static('assets'));

const port = 3003;
const server = app.listen(port, () => console.log("Server listening on port " + port));

//Connect to the Database named as pharmacy
//Using the local database
mongoose.connect('mongodb://localhost:27017/pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB Connection : ' + err);
  }
});

//Database Connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', function () {
});

// Handlebars
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

app.engine('hbs', exphbs({
  extname: 'hbs',
  //defaultview: 'main',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/',
  handlebars: allowInsecurePrototypeAccess(hbs),
  helpers: 
  {
      formatDate: function(datetime) 
      {
          if (datetime !== null) {
              format = "MMMM DD YYYY";
              return moment(datetime).format(format);
          }
          else {
              return "";
          }
      },

      formatPrice: function(num)
      {
          return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      }
  }
}))

app.set('view engine', 'hbs');

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());
app.use( (req, res, next) => {
    res.locals.msg = req.flash("msg");
    res.locals.error = req.flash('error');
    next();
})


app.use((req, res, next) => {
    res.locals.loggedIn = req.isAuthenticated();
    next();
});

// Routes
app.use('/', require('./routes/login'));
app.use('/', require('./routes/register'));
app.use('/', require('./routes/catalogue'));
app.use('/', require('./routes/profile'));
app.use('/', require('./routes/checkout'));
app.use('/', require('./routes/myorders'));
app.use('/admin', require('./routes/manageOrder'));
app.use('/admin', require('./routes/catalogue'));
app.use('/admin', require('./routes/manageCatalogue'));
app.use('/admin', require('./routes/adminProf'));

