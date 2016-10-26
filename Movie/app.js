var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./models/movie')
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

mongoose.connect('mongodb://localhost/immoc',function(err,db){
  console.log("正确连接到数据库");
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json()); // 表单数据格式化
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.locals.moment = require('moment');

// routes
// 首页
app.get('/',function(req,res){
  Movie.fetch(function(err,movies){
    if(err){
      console.log(err);
    }
    res.render('index',{
      title:'电影网站',
      // 伪造数据
      movies:movies
    })
  })
})

// 后台录入页
app.get('/admin/movie',function(req,res){
  res.render('admin',{
    title:'后台电影信息录入页面',
    movie:{
      doctor:"",
      country:"",
      title:"",
      year:"",
      poster:"",
      language:"",
      flash:"",
      summary:""
    }
  })
})


// admin update movie
app.get('/admin/update/:id',function(req,res){
  var id=req.params.id
  if(id){
    Movie.findById(id,function(err,movie){
      res.render('admin',{
        title:"电影后台更新页面",
        movie:movie
      })
    })
  }
})


// admin post movie
app.post('/admin/movie/new',function(req,res){
  console.log(req.body);
    console.log("1111");
    console.log(req.body.title);
      console.log("222");
  var id = req.body._id
  var movieObj = req.body
  var _movie

  if(id!=="undefined"){
    Movie.findById(id,function(err,movie){
      if(err){
        console.log(err);
      }
      _movie = _.extend(movie,movieObj);
      _movie.save(function(err,movie){
        if(err){
          console.log(err)
        }
        res.redirect('/movie/'+movie._id)
      })
    })
  }else{
    console.log("333");
    _movie = new Movie({
      doctor:movieObj.doctor,
      title:movieObj.title,
      country:movieObj.country,
      language:movieObj.language,
      year:movieObj.year,
      poster:movieObj.poter,
      summary:movieObj.summary,
      flash:movieObj.flash
    })
    _movie.save(function(err,movie){
      if(err){
        console.log(err)
       }
      res.redirect('/movie/'+movie._id)
    })
  }
})



// 详情页
app.get('/movie/:id',function(req,res){
  var id=req.params.id
  Movie.findById(id,function(err,movie) {
    res.render('detail',{
      title:'电影《'+movie.title+"》",
      movie:movie
    })
  })

})


//后台列表页
app.get('/admin/list',function(req,res){
  Movie.fetch(function(err,movies){
    if(err){
      console.log(err);
    }

    res.render('list',{
      title:"电影列表页",
      movies:movies
    })
  })
})





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
