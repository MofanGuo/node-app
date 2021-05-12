const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//load model

const User = mongoose.model("users");

module.exports = (passport) => {
    passport.use(new LocalStrategy(
        { usernameField: "email" },
        (email, password, done ) => {
            //query the database
            User.findOne({ email: email })
            .then((user) => {
                if (!user) {
                    return done(null,false,{message:"user does not exist!"})
                }
                //password authentification 
                bcrypt.compare(password, user.password, (err, isMatch) =>{
                    // result == true
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null,false,{message:"Wrong password!"})
                    }
                });
            })
        }
    ));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
       
      passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
          done(err, user);
        });
      });
}