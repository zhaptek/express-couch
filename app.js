const path = require('path');

require('dotenv').config({ path: path.join(__dirname + '/.env') });

const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const expressSanitized = require('express-sanitize-escape');

const winston = require('winston');
const expressWinston = require('express-winston');

// Log the whole request and response body
expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');

// Logger makes sense before the router
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.File({
        filename: path.join(
          __dirname,
          'logs/',
          new Date().getFullYear().toString() +
            new Date().getMonth().toString() +
            new Date().getDate().toString() +
            '-info.log'
        )
      })
    ]
  })
);

const routes = require('./routes/index');

// Config
const config = require('./config/config.js');

app.set('secret', config.secret); // secret variable

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(expressSanitized.middleware());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Credentials', true);
  if ('OPTIONS' == req.method) {
    return res.sendStatus(200);
  }
  next();
});

// Specify router
app.use('/api', routes);

// For all GET requests to /, send back index.html
// so that PathLocationStrategy can be used
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// For all GET requests to /*, send back index.html
// so that PathLocationStrategy can be used
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Error logger makes sense after the router
app.use(
  expressWinston.errorLogger({
    transports: [
      new winston.transports.File({
        filename: path.join(
          __dirname,
          'logs/',
          new Date().getFullYear().toString() +
            new Date().getMonth().toString() +
            new Date().getDate().toString() +
            '-error.log'
        )
      })
    ]
  })
);

module.exports = app;
