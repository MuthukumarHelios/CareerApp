//includes controller.js
//body parser is used to pass the parms in the form-data
var bodyParser  =    require("body-parser");
var mysql       =    require("mysql");
//uniqid->access_token
var uniqid      =    require("uniqid");
var connection  =    mysql.createConnection({
          host     :     'localhost',
          user     :     'root',
          password :     'dazecorpdatabase420'
 });

var bcrypt = require('bcrypt');
connection.query('use CareerApp');
//controller actions for routes
//the database  existence check it is present in the db
exports.test = function(req, res){
 connection.query('select * from users', function(err, rows) {
  if(err) throw error;
     res.render("test",{
      //rows is a call back of the query
     users: rows
   });
 });
};

//meant for creating users==>signup
exports.register = function(req, res, next){
  //hash the pasword
  console.log("inside controller");
   var salt = bcrypt.genSaltSync(10);
    var password = req.body.password;
    //encrypt password
     var hash = bcrypt.hashSync(password, salt);
      //meant for call callback
       var create =
          'insert into users (fullname, email, mobile, password, access_token) VALUES ("'+req.body.fullname+'",  "'+req.body.email+'", "'+req.body.mobile+'", "'+hash+'","'+uniqid()+'")';
             console.log(create);
               connection.query(create, function (err, rows) {
                  //error handled
                  if(err)
                      {
                        res.status(500).json({
                                        error:        "true",
                                        err_message:  "email already exists"
                                      });
                         return next(err);
                       }
                   res.json({error: "false", error_message:"suuccess fully inserted"});
   });
};

exports.login = function(req, res, next){
    //sql query used for take from total data base
    var password  =     req.body.password;
    var email     =     req.body.email;
     console.log(email);
       var query = 'select fullname, email, mobile, password, access_token from users where email = "'+email+'"';
           connection.query(query, function(err, rows){
            console.log(rows);
            if(rows.length == 0)
                 {
                   res.json({      error: "true",
                                   err_message: "you cannot login"});
                   return next(err);
                  }
             else
                     bcrypt.compare(password, rows[0].password, function(err1, callback){
                              //check whether the call back is true or not
                              //if email is not present [].length===0
                            if(rows.length != 0){
                                 console.log(rows[0].email === email && callback);

                                 if(rows[0].email === email && callback){
                                   console.log("redirect to login page");
                                   var update = 'update users set access_token = "'+uniqid()+'" where fullname = "'+rows[0].fullname+'"';
                                 //update the access token every time it is loged in
                                 var query1 = 'select id, board_name from school_courses';
                                        connection.query(query1, function(err2, rows1){
                                         if(err2){return next(err2)}
                                           connection.query(update);
                                            res.json({"error":"false",
                                                      "token":rows[0].access_token,
                                                      "data":rows1});
                                  });
                                 }
                                   else
                                      {
                                                     res.json({error: "true",
                                                     error_message:"not valid credentials"});
                                      }
                            }
                  });
       });
};
exports.update = function(req, res, next){
      //update users to perform the access_token
      // req is access_token if it is equal to the item present in the db
    var token       =   req.headers.token;
    var password    =   req.body.password;
    var query = 'UPDATE users SET password="'+password+'" WHERE access_token = "'+token+'"';
            connection.query(query, function(err, rows){
                    console.log(query);
                    console.log(rows);
                        console.log("after query");
                if(err){
                      res.json("error occured");
                      return next(err);
                 }
              else{
          //rows.affectedRows is the json format return form sql command
                if(rows.affectedRows!== 0){
                        res.json("updated success");
                    }
                else{
                       res.json("cannot updated");
                    }
            }
    });
};
//while logout every time access_token token get changed to null
exports.logout = function(req, res){
     var params  =  req.params.fullname;
      console.log("inside controller");
        var query  =  'update users set access_token = NULL where fullname = "'+params+'"';
         console.log(query);
            connection.query(query, function(err, rows){
              if(err) {res.json({error:true})}
                 else{res.json("updated success fully")}
        });
};
//used to select board of the school whether it is state board or cbse
//TABLE ===>courses_group
exports.board = function(req, res, next){
  var course_id = req.body.course_id;
  var query = 'select id,course_name,subjects from courses_groups where course_id = "'+course_id+'"';
  connection.query(query, function(err, rows){
    if(rows.length === 0){
          res.json({error: "true",
          error_message:"not valid credentials"});
          return next(err);
    }
      res.json({"error":"false",
               "data":rows});
   });
};
//select a college name
//table ==>college type
exports.select_college = function(req, res, next){
      //var id = req.params.id;
      var query = 'select id,college_name from colleges';
    connection.query(query, function(err, rows){
     if(rows.length === 0){
            res.json({
                      error: "true",
                      error_message:"not valid credentials"
                    });

            return next(err);
     }
    res.json({"error":"false",
              "data":rows});
    });
};

//select a college name with degree that is courses offered
exports.select_departments = function(req, res, next){
     var id = req.body.id;
     var query   = 'select college_id,department from college_departments where college_id = "'+id+'"';
      connection.query(query, function(err, rows){
        if(rows.length === 0){
              res.json({error: "true",
                        error_message:"not valid credentials"});
              return next(err);
         }
    res.json({"error":"false",
              "data":rows});
    });
};
//college details with id
exports.select_college_details = function(req, res, next){
      var id     =    req.body.id;
      var query  = 'select * from colleges where id = "'+id+'"';
      console.log(query);
      connection.query(query, function(err, rows){
        console.log(rows);
         if(rows.length === 0){
            res.json(
                      {error: "true",
                      error_message:"not valid credentials"});
                      return next(err);
     }
    res.json({"error":"false",
              "data":rows});
    });
};

//validate from social login from the email_id and access_token
exports.social_login = function(req, res, next){
      var email = req.body.email;
      var token = req.body.token;
       //undefined shows that the value entered
      if(email !== undefined && token !== undefined)
       {
            var query = 'insert into users (email, access_token) values ("'+email+'", "'+token+'")';
            connection.query(query, function(err, rows){
                    if(err)
                       { res.json({"error":"true",
                                   "error_message":"provide a correct mail id and token"});
                         }
                    else
                          {
                            var query1 = 'select id, board_name from school_courses';
                                 connection.query(query1, function(err2, rows1){
                                    if(err2){return next(err2);}
                                      else{
                                         res.json({"error":"false",
                                                  "data":rows1});
                                      }
                              });
                        }
                   });
            }
      else if(token !== undefined){
            var query2 = 'select access_token from users where access_token = "'+token+'"';
              connection.query(query2, function(err3, rows2){
                  if(rows2.length === 0)
                     {
                         res.json({"error": "true",
                           "error_message":"not a valid token"});
                       }
                        else{
                              var query1 = 'select id, board_name from school_courses';
                                   connection.query(query1, function(err, rows4){
                                       res.json({"error":"false",
                                                 "data":rows4});
                                    });
                                 }
                              });
                           }

          else {
             res.json({"error": "true",
                      "error_message":"not a valid credentials"});
          }
 };
