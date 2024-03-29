var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var bodyParser = require("body-parser");
// const multer = require("multer");
// const form_data = multer();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var postRouter = require("./routes/post");
var postAuthRouter = require("./routes/post-auth");
var adminRouter = require("./routes/admin");
var adminAuthRouter = require("./routes/admin-auth");
var tokenAuth = require("./util/tokenAuth");
var adminTokenAuth = require("./util/adminTokenAuth");
var userCheck = require("./util/userCheck");
var refresh = require("./util/refreshToken");

var app = express();

//cors
app.use(
  cors({
    // front 서버인 http://localhost:8080 의 요청을 허용하도록 cors 사용
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/uploads")));
// app.use(express.static("uploads"));
// app.use(form_data.array());

app.use("/refresh", refresh);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/post", postRouter);
// app.use("/post-auth", tokenAuth, userCheck, postAuthRouter);
app.use("/post-auth", tokenAuth, postAuthRouter);
app.use("/admin", adminRouter);
app.use("/admin-auth", adminTokenAuth, adminAuthRouter);

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

module.exports = app;
