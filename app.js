
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const session = require("express-session");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const { connectToMongoDb } = require("./config/db");
const logMiddleware = require("./middlewares/logsMiddlewares.js");

const indexRouter = require("./routes/indexRouter");
const userRouter = require("./routes/userRouter");
const offreRouter = require("./routes/offreRouter");
const GeminiRouter = require("./routes/GeminiRouter");
global.fetch = require("node-fetch");

const app = express();

// Middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(logMiddleware);

app.use(express.json({
  strict: true
}));
// app.post("/Gemini/test-gemini", (req, res) => {
//   try {
//     console.log("BODY:", req.body);
//     if (!req.body || Object.keys(req.body).length === 0) {
//       return res.status(400).json({ error: "Empty or invalid JSON body" });
//     }
//     res.json({ success: true, data: req.body });
//   } catch (error) {
//     console.error("ERROR:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const morgan = require('morgan');
app.use(morgan('dev'));


// Session Setup
app.use(
  session({
    secret: "net secret pfe",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Routes
app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/offres", offreRouter);
app.use("/Gemini", GeminiRouter);




// Catch 404 (Not Found)
app.use((req, res, next) => {
  next(createError(404, "Resource Not Found"));
});

// Error Handler (JSON only)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});


// Server
const server = http.createServer(app);
server.listen(process.env.PORT || 5000, () => {
  connectToMongoDb();
  console.log("App is running on port " + (process.env.PORT || 5000));
});