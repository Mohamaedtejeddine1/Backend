// backend/app.js
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session"); //session
const { connectToMongoDb } = require("./config/db");
const cors = require("cors");
require("dotenv").config();

const logMiddleware = require('./middlewares/logsMiddlewares.js'); //log

const http = require("http"); //1

var indexRouter = require("./routes/indexRouter");
var userRouter = require("./routes/userRouter");
var offreRouter = require("./routes/offreRouter");




var GeminiRouter = require("./routes/GeminiRouter");

var app = express();

// view engine setup (assuming you might have a views folder)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(logMiddleware)    //log

app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // This is crucial for cookies
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(session({   //cobfig session
    secret: "net secret pfe",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: {secure: false},
      maxAge: 24*60*60,
    
    },  
  }))

app.use("/", indexRouter);
app.use("/users", userRouter);

app.use("/offres", offreRouter);
app.use("/Gemini", GeminiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

const server = http.createServer(app); //2
server.listen(process.env.PORT || 5000, () => {
    connectToMongoDb()
    console.log("app is running on port " + (process.env.PORT || 5000));
});