//specifies routes
var express       =  require('express');
var path          =  require('path');
var favicon       =  require('serve-favicon');
var logger        =  require('morgan');
var cookieParser  =  require('cookie-parser');
var bodyParser    =  require('body-parser');
var index         =  require('./routes/index');
var users         =  require('./routes/users');
var ejs           =  require('ejs');
var app           =  express();
var multer        =  require('multer');
var upload        =  multer();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//reqire from multer for passing the post request form the form-data from the postman
app.use(upload.array());
//app.use(express.bodyParser());
//routes

app.use('/', index);
app.use('/users', users);
//routes with controller action
var controller    =  require('./routes/controller');
app.get  ('/test',                    controller.test);

app.post ('/register',                controller.register);
app.post('/login',                    controller.login);
app.post('/update',                   controller.update);
app.post('/board',                    controller.board);
app.post('/select_college',           controller.select_college);
app.post('/select_departments',       controller.select_departments);
app.post('/select_college_details',   controller.select_college_details);
app.post('/social_login', 			      controller.social_login);

app.get ('/logout/:firstname',        controller.logout);

//the below api is meant for only college details a
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
