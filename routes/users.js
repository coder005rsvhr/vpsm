var express = require('express');
var router = express.Router();

var fs = require("fs");
var file = "data.db";
var exists = fs.existsSync(file);

if(!exists) {
    console.log("Creating DB file.");
    fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
  if(!exists) {
      db.run("CREATE TABLE Stuff (name TEXT, pwd TEXT, state INTEGER, updatetime TimeStamp NOT NULL DEFAULT (datetime('now','localtime')))");
      db.run("CREATE TABLE vps (ip TEXT, name TEXT, pwd TEXT, state INTEGER, createtime INTEGER)");
  } 
  
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.get('/get', function(req, res, next) {
  db.all("SELECT rowid AS id, name, pwd FROM Stuff where state=0 limit 1", function(err, rows) {
    if(rows == null || rows.length==0){
      console.log("Empty users table.");
      res.json({ret:1, msg: "Empty users table."})
    }else{
      var row = rows[0];
      console.log(row.id + ": " + row.name);
      res.json({ret:0, id: row.id, name: row.name, pwd: row.pwd})
      var sql = "UPDATE Stuff set state=1 where name='"+row.name+"'";
      var stmt = db.prepare(sql);   
      stmt.run()
    }
  });  
});

/* GET users listing. */
router.get('/list', function(req, res, next) {
  db.all("SELECT rowid AS id, name, pwd, state, updatetime FROM Stuff", function(err, rows) {
    if(rows == null || rows.length==0){
      console.log("Empty vps table.");
      res.json({ret:1, msg: "Empty vps table."})
    }else{
      res.json({ret:0, rows: rows})      
    }
  });  
});

router.post('/add', function(req, res, next) {
  var name = req.body.name || '';
  var pwd = req.body.pwd || 'Xx1234569';
  if(name == ''){
    return res.json({ret:1, msg: "Account name is NULL!"})
  }
  var stmt = db.prepare("INSERT INTO Stuff VALUES (?,?,0, strftime('%s','now'))");

  //Insert random data
  stmt.run(name, function(err){
    if(null != err){
      console.log(err);
      res.json({ret:1, msg: err})
    }else{
      res.json({ret:0, msg: "Account added!"})
    }
  });  

  stmt.finalize();
  
});

router.post('/update', function(req, res, next) {
  var name = req.body.name || '';
  var state = req.body.state || '0';
  if(name == ''){
    return res.json({ret:1, msg: "Account name is NULL!"})
  }
  var sql = "UPDATE Stuff set state="+state+" where name='"+name+"'";
  var stmt = db.prepare(sql);

  //Insert random data
  stmt.run(function(err){
    if(null != err){
      console.log(sql);
      console.log(err);
      res.json({ret:1, msg: err})
    }else{
      res.json({ret:0, msg: "Account updated!"})
    }
  });  

  stmt.finalize();  
});

router.get('/add', function(req, res, next) {
  var name = req.query.name || '';
  var pwd = req.query.pwd || 'Xx1234569';
  if(name == ''){
    return res.json({ret:1, msg: "Account name is NULL!"})
  }
  var stmt = db.prepare("INSERT INTO Stuff VALUES (?,?,0, strftime('%s','now'))");

  //Insert random data
  stmt.run([name, pwd], function(err){
    if(null != err){
      console.log(err);
      res.json({ret:1, msg: err})
    }else{
      res.json({ret:0, msg: "Account added!"})
    }
  });  

  stmt.finalize();
  
});

router.get('/update', function(req, res, next) {
  var name = req.query.name || '';
  var state = req.query.state || '0';
  if(name == ''){
    return res.json({ret:1, msg: "Account name is NULL!"})
  }

  var sql = "UPDATE Stuff set state="+state+" where name='"+name+"'";
  var stmt = db.prepare(sql);

  //Insert random data
  stmt.run(function(err){
    if(null != err){
      console.log(sql);
      console.log(err);
      res.json({ret:1, msg: err})
    }else{
      res.json({ret:0, msg: "Account updated!"})
    }
  });  

  stmt.finalize();  
});

router.get('/del', function(req, res, next) {
  var name = req.query.name || '';
  if(name == ''){
    return res.json({ret:1, msg: "Account name is NULL!"})
  }

  var sql = "DELETE from Stuff where name='"+name+"'";
  var stmt = db.prepare(sql);

  //Insert random data
  stmt.run(function(err){
    if(null != err){
      console.log(sql);
      console.log(err);
      res.json({ret:1, msg: err})
    }else{
      res.json({ret:0, msg: "Account deleted!"})
    }
  });  

  stmt.finalize();  
});
//db.close();
module.exports = router;
