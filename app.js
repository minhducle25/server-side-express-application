require('dotenv').config(); // Load environment variables

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const options = require("./knexfile.js");
const knex = require("knex")(options);

var indexRouter = require('./routes/index');
var countriesRouter = require('./routes/countries');
var volcanoRouter = require('./routes/volcanoes');
var volcanoIdRouter = require('./routes/volcanoId');
var userRegisterRouter = require('./routes/userRegister');
var userLoginRouter = require('./routes/userLogin');
var meRouter = require('./routes/me');
var profileRouter = require('./routes/profile');
var commentsRouter = require('./routes/comments');

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use((req, res, next) => {
  req.db = knex;
  next();
});

app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerDocument));

app.use('/', indexRouter);
app.use('/countries', countriesRouter);
app.use('/volcanoes', volcanoRouter);
app.use('/volcano', volcanoIdRouter);
app.use('/user/register', userRegisterRouter);
app.use('/user/login', userLoginRouter);
app.use('/me', meRouter);
app.use(profileRouter);
app.use(commentsRouter);

app.get("/knex", function (req, res, next) {
  req.db.raw("SELECT VERSION()")
    .then((version) => console.log(version[0][0]))
    .catch((err) => {
      console.log(err);
      throw err;
    });

  res.send("Version Logged successfully");
});

app.use(function (req, res, next) {
  console.log(`404 Error: ${req.method} request to ${req.path} did not match any routes.`);
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error(err.stack);

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
