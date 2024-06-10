const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(path.join(__dirname, "/assets")));

// route for home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/index.html")); 
});

// handle 404 requests to pages that are not found
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// handle all errors
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// listen on port 8080
const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.listen(HTTP_PORT, onHttpStart);