const express = require('express');
const router = express.Router();
const { check, validationResult } = require("express-validator");

const { isUserIn, isUserHome } = require("../middleware/protection");
const userHlper = require("../helper/userHelper");
const userHelper = require('../helper/userHelper');


// @desc        For getting home page
// @rout        GET /
router.get("/", isUserHome, (req, res) => {
    res.render("user/index", { title: "Home | User", handler: "User"});
});


// @desc        For login template.
// @rout        GET /login
router.get("/login", isUserIn, (req, res) => {
    res.render(
        'login',
        { layout: 'login', handler: "User", title: "Login", loginRoute: "/login" }
    );
});


// @desc        For loggin in.
// @rout        POST /login
router.post("/login", isUserIn, 
    [
        check("email").isEmail().withMessage("Invalid Email address"),
        check("password").isLength({ min: 3 }).withMessage("Invalid password")
    ],
    async (req, res) => {
        try {
            let errors = validationResult(req).array();

            if (errors.length === 2)
                throw { reason: "Invalid credentials" };
            
            if (errors.length === 1)
                throw { reason: errors[0].msg };
                
            let user = await userHlper.CHECK_USER(req.body);
            req.session.user = { _id: user._id };
            return res.redirect("/");
        } catch (err) {
            req.flash("errorMessage", err.reason);
            return res.redirect("/login");
        }
    }
);


// @desc        For signup template.
// @rout        GET /signup
router.get("/signup", isUserIn, (req, res) => {
    res.render(
        'signup',
        { layout: 'login', handler: "User", title: "Login", loginRoute: "/signup" }
    );
});


// @desc        For signup template.
// @rout        GET /signup
router.post("/signup", isUserIn,
    [
        check("name").not().isEmpty().isLength({ min: 6 }).withMessage("Invalid credential"),
        check("email").not().isEmpty().isEmail().withMessage("Invalid credential"),
        check("password").not().isEmpty().isLength({ min: 3 }).withMessage("Invalid credential"),
        check("confirmPassword").not().isEmpty().isLength({ min: 3 }).withMessage("Invalid credential")
    ],
    async (req, res) => {
        try {
            let errors = validationResult(req).array();

            if (errors.length >= 1)
                throw { reason: "Invalid credential" };
                
            let resolve = await userHelper.SIGNUP(req.body);
            
            req.flash("successMessage", resolve.message);
            return res.redirect("/login");
        } catch (err) {
            req.flash("errorMessage", err.reason ? err.reason : err.message);
            return res.redirect("/signup");
        }
    }
);


// @desc        For loging iOUT
// @rout        GET /logout
router.get("/logout", isUserHome, (req, res) => {
    delete req.session.user;
    res.redirect("/login");
});

module.exports = router;