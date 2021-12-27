const express = require('express');
const router = express.Router();
const { check, validationResult } = require("express-validator");

const { isAdminIn, isAdminHome } = require("../middleware/protection");
const adminHelper = require("../helper/adminhelper");


// @desc        For getting home page
// @rout        GET /admin
router.get("/", isAdminHome, (req, res) => {
    adminHelper.GET_ALL_USERS()
        .then(resolve =>
            res.render(
                "admin/index",
                { layout: "admin", handler: "Admin", title: "Home | Admin", clients: resolve }
            )
        )
        .catch(reject => {
            req.flash("errorMessage", reject.reason);
            res.render(
                "admin/index",
                { layout: "admin", handler: "Admin", title: "Home | Admin" }
            )
        });
});


// @desc        For getting admin login page
// @rout        GET /admin/login
router.get("/login", isAdminIn, (req, res) => {
    res.render(
        "login",
        { layout: 'login', title: "Login | Admin", handler: "Admin", loginRoute: "/admin/login" }
    );
});


// @desc        For getting home page
// @rout        GET /admin/login
router.post("/login", isAdminIn,
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
                
            let admin = await adminHelper.CHECK_ADMIN(req.body)
            req.session.admin = admin;
            return res.redirect("/admin");
        } catch (err) {
            req.flash("errorMessage", err.reason);
            return res.redirect("/admin/login");
        }
    }
);


// @desc        For loging OUT
// @rout        GET /admin/logout
router.get("/logout", isAdminHome, (req, res) => {
    delete req.session.admin;
    res.redirect("/admin/login");
});


// @desc        For admin add user template
// @rout        GET /admin/addUser  
router.get('/addUser', isAdminHome, (req, res) => {
    res.render(
        'admin/addUser',
        { layout: "admin", title: "Add user | Admin", handler: "Admin" }
    );
})


// @desc        For admin add user to the data base.
// @rout        POST /admin/addUser  
router.post('/addUser', isAdminHome, (req, res) => {
    adminHelper.ADD_USER(req.body)
        .then(resolve => {
            req.flash("successMessage", resolve.message);
            res.redirect("/admin");
        })
        .catch(reject => {
            req.flash("errorMessage", reject.reason);
            res.redirect("/admin/addUser");
        })
})


// @desc        For admin add user to the data base.
// @rout        DELETE /admin/deleteUser/:email  
router.delete('/deleteUser/:email', isAdminHome, (req, res) => {
    adminHelper.DELETE_USER(req.params.email)
        .then(resolve => {
            req.flash("successMessage", resolve.message);
            res.status(204).send();
        })
        .catch(reject => {
            req.flash("errorMessage", reject.reason);
            res.status(404).send();
        })
})


// @desc        For admin add user to the data base.
// @rout        GET /admin/viewUser/:email  
router.get('/viewUser/:email', isAdminHome, (req, res) => {
    adminHelper.GET_USER(req.params.email)
        .then(resolve => {
            req.flash("successMessage", resolve.message);
            res.render(
                "admin/viewAndEdit",
                {
                    layout: "admin",
                    handler: "Admin",
                    title: "View User | Admin",
                    client: resolve,
                    viewOnly: true,
                    action: "View"
                }
            )
        })
        .catch(reject => {
            req.flash("errorMessage", reject.reason);
            res.redirect("/admin");
        })
})


// @desc        For admin add user to the data base.
// @rout        GET /admin/editUser/:email  
router.get('/editUser/:email', isAdminHome, (req, res) => {
    adminHelper.GET_USER(req.params.email)
        .then(resolve => {
            res.render(
                "admin/viewAndEdit",
                {
                    layout: "admin",
                    handler: "Admin",
                    title: "Edit User | Admin",
                    client: resolve,
                    action: "Edit"
                }
            )
        })
        .catch(reject => {
            req.flash("errorMessage", reject.reason);
            res.redirect("/admin");
        })
})


// @desc        For admin add user to the data base.
// @rout        GET /admin/editUser/:id  
router.post('/updateUser/:id', isAdminHome, (req, res) => {
    console.log(req.params.id);
    adminHelper.UPDATE_USER(req.params.id, req.body)
        .then(resolve => {
            req.flash("successMessage", resolve.message);
            res.redirect(`/admin/viewUser/${resolve.email}`);
        })
        .catch(reject => {
            req.flash("errorMessage", reject.reason);
            res.redirect("/admin");
        })
})


// @desc        For admin text search.
// @rout        GET /admin/search
router.get('/search', isAdminHome, (req, res) => {
    if (req.query.search == false)
        res.redirect("/admin");

    adminHelper.SEARCH_USER(req.query.search)
        .then(resolve => {
            res.render(
                "admin/index",
                { layout: "admin", handler: "Admin", title: "Home | Admin", clients: resolve }
            )
        })
        .catch(reject => {
            req.flash("errorMessage", reject.reason);
            res.redirect("/admin");
        })
})


module.exports = router;