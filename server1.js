var http = require('http');

var fs = require('fs');

var Datastore = require('nedb');
var db = new Datastore({filename: "data.db", autoload: true});

var multer = require('multer');
var upload = multer({dest: 'public/uploads/'});

var express = require('express');
var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true }); // for parsing form data
app.use(urlencodedParser);

app.get('/', function (req, res) {
    res.redirect('/display');
  });

app.get('/search', function(req,res) {
    var searchters = req.query.seearch;
    var searchregex = new RegExp(searchters);

    db.find({description:searchregex}).sort({timestamp:1}).exec(function (err,docs){
      console.log(docs);

      var datatopass = {data:docs, category:"Search " + searchters};
      res.render("display.ejs", datatopass);
    });

});

app.post('/submit',upload.single('thefile'), function(req,res) {

    console.log(req.file);
    console.log("uploaded: " + req.file);

    if (req.file.mimetype != "image/jpeg") {
      fs.unlinkSync(req.file.path);
      console.log('deleting file');
    } else {
      fs.renameSync(req.file.path, req.file.path + ".jpg");
    }

    /* { fieldname: 'thefile',
        originalname: 'bikes.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads/',
        filename: 'dce214488dfd49fdf412ecda306dae2d',
        path: 'public/uploads/dce214488dfd49fdf412ecda306dae2d',
        size: 28055 }
    */

      var data = {
        name: req.body.name,
        description: req.body.description,
        timestamp: Date.now(),
        file: req.file.filename + ".jpg"
      };
      console.log(data);

      db.insert(data, function(err, newDocs){
         console.log("err:"+ err);
         console.log("newDocs: " + newDocs);
      });

      res.redirect('/display');

});

app.get('/display', function(req, res) {
	// req.query.


    db.find({}).sort({ timestamp: 1 }).exec(function (err, docs) {
    //db.find({}, function(err, docs) {
      console.log(docs);
      //res.send(docs);

      var datatopass = {data:docs, name: ""};
      res.render("display.ejs",datatopass);
    });
});

app.get("/individual", function(req, res) {
  var id = req.query.id;
  db.find({_id: id}, function(err, docs) {
    console.log(docs);
    
    var datatopass = {data: docs};
    res.render("individual.ejs",datatopass);
    

  });
});

app.get('/name', function(req, res) {
	// req.query.name

    db.find({name: req.query.name}).sort({ timestamp: 1 }).exec(function (err, docs) {
    //db.find({}, function(err, docs) {
      console.log(docs);
      //res.send(docs);

      var datatopass = {data:docs, name: req.query.name};
      res.render("display.ejs",datatopass);
    });
});

  

app.listen(80, function () {
    console.log('Example app listening on port 80!')
  });