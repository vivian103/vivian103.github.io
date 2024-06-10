/*************************************************************************************
* WEB322 - 2241 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Yi Man Leung
* Student ID    : yleung20
* Course/Section: WEB322/NEE
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const fileUpload = require("express-fileupload");

// set up dotenv
const dotenv = require("dotenv");
dotenv.config({ path: "./config/keys.env" });

// make the assets folder public
const app = express();
app.use(express.static(path.join(__dirname, "/assets")));

// set up EJS
app.set("view engine", "ejs");
app.set("layout", "layouts/main");
app.use(expressLayouts);

// Set up body-parser
app.use(express.urlencoded({ extended: true }));

// Set up express-fileupload.
app.use(fileUpload());

// Set up express-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use((req, res, next) => {
    // Save the user to the global EJS variable "user".
    res.locals.user = req.session.user;
    next();
});

// Configure the controllers
const generalController = require("./controllers/generalController");
const mealKitsController = require("./controllers/mealKitsController");
const loadDataController = require("./controllers/loadDataController");
const cartController = require("./controllers/cartController.js");
app.use("/", generalController);
app.use("/mealkits", mealKitsController);
app.use("/load-data", loadDataController);
app.use("/cart", cartController);

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});


// *** DO NOT MODIFY THE LINES BELOW ***

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// Connect to Mongo DB. If the connection is successful, listen on port 8080.
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
.then(() => {
    console.log("Connected to the MongoDB database.");
    app.listen(HTTP_PORT, onHttpStart);
})
.catch(err => {
    console.log("Can't connect to the MongoDB: " + err);
});
