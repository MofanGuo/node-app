const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require("passport");

//body-parser middleware
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//load model
require('../models/User');
const User = mongoose.model("users");

//users login&register
router.get("/login", (req, res) => {
    res.render("users/login");
}
)
router.get("/register", (req, res) => {
    res.render("users/register");
}
)
router.post("/login", urlencodedParser,(req, res,next) => {
    //console.log(req.body);
   //res.send("login");
    passport.authenticate('local', {
        successRedirect:'/ideas',
        failureRedirect: '/users/login',
        failureFlash:true
    })(req,res,next)
  
    
}
)
router.post("/register", urlencodedParser,(req, res) => {
    //console.log(req.body);
    //res.send("register");
    let errors = [];
    if (req.body.password != req.body.password2) {
        errors.push({
            text:"The two passwords don't match"
        })
    }
    if (req.body.password.length<4 ) {
        errors.push({
            text:"The length of the password should be no less than 4"
        })
    }
    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2:req.body.password2,
        })
    } else {
        
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (user) {
                    req.flash("error_msg", "Email address already exists, please change your email address to register!");
                    res.redirect("/users/register");
                } else {
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password:req.body.password
                    })
                    bcrypt.genSalt(10, (err, salt) =>{
                        bcrypt.hash(newUser.password, salt, (err, hash)=> {
                            // Store hash in your password DB.
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                            .then((user) => {
                                req.flash("success_msg", "Account registration successful!!");
                                res.redirect("/users/login")
                            }).catch((err) => {
                                req.flash("error_msg", "Account registration failed!!");
                                res.redirect("/users/register")
                            });
                        });
                    });
                    
            }
        })
    }
}
)
//logout
router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success_msg", "log out successfully!")
    res.redirect("/users/login")
})


module.exports = router;