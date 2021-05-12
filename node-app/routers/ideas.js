const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const router = express.Router();

const { ensureAuthenticated } = require("../helpers/auth");

//import the model
require("../models/Idea");
const Idea = mongoose.model('ideas');

//body-parser middleware
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//elements
router.get("/",ensureAuthenticated,(req, res) => {
    Idea.find({user:req.user.id})
        .sort({ date: "desc" })
        .then(ideas => {
            res.render("ideas/index", {
                ideas: ideas
            });
        })
    
}
)

//add
router.get("/add", ensureAuthenticated,(req, res) => {
    res.render("ideas/add");
}
)
//edit
router.get("/edit/:id", ensureAuthenticated,(req, res) => {
    Idea.findOne({
        _id:req.params.id
    })
    .then(idea => {
        if (idea.user != req.user.id) {
            req.flash("error_msg", "illegal operation");
            res.redirect("/ideas");
        } else {
            res.render("ideas/edit", {
                idea:idea
            });
        }           
    })
    
}
)

router.post("/",urlencodedParser, (req, res) => {
    //console.log(req.body);
    let errors = [];

    if (!req.body.title) {
        errors.push({ text: "please enter the title!" });
    }
    if (!req.body.details) {
        errors.push({ text: "please enter the details!" });
    }
    if (errors.length > 0) {
        res.render("ideas/add", {
            errors: errors,
            title: req.body.title,
            details:req.body.details
        })
    } else {
        //res.send("ok")
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user:req.user.id
        }
        new Idea(newUser)
            .save()
            .then(idea => {
                req.flash("success_msg","data added successfully!")
                res.redirect('/ideas')
            })
    }
    
}
)
//implement edit
router.put("/:id", urlencodedParser,(req, res) => {
    //res.send("PUT");
    Idea.findOne({
        _id:req.params.id
    })
        .then(idea => {
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save()
                .then(idea => {
                    req.flash("success_msg","data edited successfully!")
                    res.redirect("/ideas")
                })
    })
})
//implement delete
router.delete("/:id",ensureAuthenticated ,(req, res) => {
    Idea.remove({
        _id:req.params.id
    })
        .then(() => {
        req.flash("success_msg","data deletion complete!")
        res.redirect("/ideas")
    })
    
}
)
module.exports = router;