const path = require("path");
const httpError = require("http-errors");
const express = require('express');
const dotenv = require("dotenv");
const hbs = require("express-handlebars");
const session = require("express-session");
const flash = require("connect-flash");
const morgan = require("morgan");
const MongoStore = require('connect-mongo');

const mongodb = require("./config/connectDB");

dotenv.config({ path: "./config/config.env" });
mongodb.connect();

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "development")
    app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));
app.engine(
    ".hbs",
    hbs.engine({
        defaultLayout: "user",
        extname: ".hbs",
        helpers: {
            checkHandler: (handler) => {
                return handler === "Admin";
            }
        }
    })
);
app.set("view engine", "hbs");
app.use(session({
    name: "simple-login-and-CRUD",
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production" ? true : false //TODO: change it into true after https is done.
    },
    store: MongoStore.create({
        mongoUrl: "mongodb://localhost:27017",
        dbName: process.env.DB,
        collectionName: "sessions"
    })
}));
app.use(flash());

if (process.env.NODE_ENV === "production")
    app.set('trust proxy', 1); //TODO: also set cookie true.

app.use((req, res, next) => {
    res.set("Cache-Content", "no-cache, no-store, must-revalidate");

    res.locals.errorMessage = req.flash("errorMessage");
    res.locals.successMessage = req.flash("successMessage");

    if (req.session.user) {
        res.locals.userName = req.session.user.name;
        res.locals.userEmail = req.session.user.email;
    }
    if (req.session.admin) {
        res.locals.adminName = req.session.admin.name;
        res.locals.adminEmail = req.session.admin.email;
    }

    next();
});


app.use("/", require("./router/user"));
app.use("/admin", require("./router/admin"));
app.use("/validate", require("./router/validate"));


app.use((req, res, next) => {
    next(httpError(404));
});
app.use((err, req, res, next) => {
    res.locals.message = "The page you are looking for was not found." || err.message;
    res.locals.error = req.app.get('env') === "development" ? err : err.status;

    res.status(err.status || 500);
    res.render('error', { layout: "error" });
});

app.listen(
    PORT,
    () => console.log(`Server is running in PORT ${PORT} \n[ http://localhost:${PORT} ]`)
);