const express = require("express");
const authenticateUser = require("../models/userAuth");
const mealKitsModel = require("../models/mealkitsModel");
const mealKitUtil = require("../modules/mealkit-util");
const router = express.Router();

// route for /load-data/mealkits
router.get("/mealkits", authenticateUser, (req, res) => {
    mealKitsModel.countDocuments()
      .then(count => {
        if (count === 0) {
            // No meal kits in the database, proceed with the data load
            mealKitsModel.insertMany(mealKitUtil.initialData)
              .then(() => {
                res.render("load-data/mealkits", {
                    title: "Load data",
                    message: "Added meal kits to the database."
                });
              })
              .catch(err => {
                console.error(`Failed to load data: ${err}`);
              });
        }
        else if (count > 0) {
            // data has already been loaded to the database
            res.render("load-data/mealkits", {
                title: "Load data",
                message: "Meal kits have already been added to the database."
            });
        }
      })
      .catch(err => {
        console.error(`Failed to count the number of documents: ${err}`);
      });
});

module.exports = router;
