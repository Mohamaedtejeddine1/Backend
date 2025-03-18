var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session=require("express-session")
const cors = require("cors");
const logMiddleware = require('./middlewares/logsMiddlewares.js'); //log



const { connectToMongoDb } = require("./config/db");

require("dotenv").config();

const http = require("http"); //1

var indexRouter = require("./routes/indexRouter");
var userRouter = require("./routes/userRouter");

var GeminiRouter = require("./routes/GeminiRouter");
var offreRouter = require("./routes/offreRouter");



var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(logMiddleware)
app.use(cors({
  origin:"http://localhost:3000",
  methods:"GET,POST,PUT,Delete",
}))

app.use("/", indexRouter);
app.use("/users",userRouter);
app.use("/Gemini", GeminiRouter);
app.use("/offre", offreRouter);

app.use(session({   //cobfig session
  secret: "net secret pfe",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: {secure: false},
    maxAge: 24*60*60,
  
  },  
}))

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
server.listen(process.env.port, () => {
  connectToMongoDb()
  console.log("app is running on port 5001");
});
