//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/usersDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.route("/register")
.get(function(req, res){
  res.render("register");
})
.post(function(req, res){
  newUser = new User ({
    email:req.body.username,
    password: req.body.password
  });
  User.findOne({email: req.body.username}, function(err, results){
    if(results){
      console.log(req.body.username + " is already in use");
      res.send(req.body.username + " is already in use");
    }else{
      console.log(newUser);
      newUser.save(function(err){
        if(err){
          console.log(err);
          res.send("There was an error, please try again");
        }else{
          res.render("secrets");
        }
      });
    }
  });
})
;

app.route("/login")
.get(function (req, res){
  res.render("login");
})
.post(function(req, res){
  loginAttempt = new User ({
    email: req.body.username,
    password: req.body.password
  });
  // console.log("login attempted with: " + loginAttempt);
  User.findOne({email: req.body.username}, function(err, results){
    if(results){
      if(results.password === req.body.password){
        console.log("Login attempt succesfull, credentials used: " + loginAttempt);
        res.render("secrets");
      }else{
        console.log("found match for email: " + req.body.username + ", but password did not match");
        res.send("there was an error logging in, please try again or regester for an account")
      }
    }else{
      console.log("login attempt unsuccessful, no matching email. Credentials used: " + loginAttempt);
      res.send("there was an error logging in, please try again or regester for an account");
    }
  })
})
;

app.route("/logout")
.get(function(req, res){
  res.render("home")
})
;




app.listen(3000, function(){
  console.log("server started on port 3000");
});
