const express = require("express");
const authenticateUser = require("../models/userAuth");
const mealKitsModel = require("../models/mealkitsModel");
const router = express.Router();
const path = require("path");
const fs = require('fs');

// route for mealkits page
router.get("/on-the-menu", authenticateUser, (req, res) => {
    // Load meal kits from the database
    mealKitsModel.find()
      .then(data => {
        let mealKits = data.map(value => value.toObject());

        // group the meal kits by category
        const categories = {};
        mealKits.forEach(mealKit => {
          // Initialize array if not exist
          if (!categories[mealKit.category]) {
            categories[mealKit.category] = []; 
          }
          categories[mealKit.category].push(mealKit);
        });

        // convert the categories object to an array
        const menuData = [];
        for (const category in categories) {
          menuData.push({
            categoryName: category,
            mealkits: categories[category]
          });
        }
        // Set the userType to customer, clerk or undefined (if user not log in)
        const userType = (req.session && req.session.user && req.session.user.userType) ? req.session.user.userType : undefined;

        res.render("mealkits/on-the-menu", { 
          title: "On the menu",
          menuData,
          userType: userType
        });
      })
      .catch(err => {
        console.error(`Failed to load meal kits: ${err}`);
        res.status(500).render("general/error", {
          title: "Error",
          message: "500 Internal Server Error: Failed to load meal kits"
        });
      });
});

// route for showing a list of mealkits
router.get("/list", authenticateUser, (req, res) => {
    mealKitsModel.find()
      .then(data => {
        // pulls the data from database, and convert data to javascript objects
        let mealKits = data.map(value => value.toObject());

        // Sort mealKits array by title
        mealKits.sort((a, b) => a.title.localeCompare(b.title));

        res.render("mealkits/list", { 
            title: "List of meal kits",
            mealKits });
      })
      .catch(() => {
        console.error("Couldn't get list of mealkits");
        res.redirect("/list");
      });
});

// GET route for adding mealkit 
router.get("/add", authenticateUser, (req, res) => {
  res.render("mealkits/add", {
    title: "Add a meal kit",
    values: { 
      title: "", 
      includes: "", 
      description: "",
      category: "",
      price: "",
      cookingTime: "",
      servings: "",
      imageUrl: "",
      featuredMealKit: ""
  },
    validationMsg: {}
  });
});

// POST route for adding meal kit 
/* I have updated the logic for validation, as I found my previous code in assignment 5 not working properly. */
router.post("/add", authenticateUser, (req, res) => {
  const { title, includes, description, category, price, cookingTime, servings } = req.body;
  const featuredMealKit = req.body.featuredMealKit === 'true'; // Convert string value to boolean
  
  // Call ValidateData function and pass req.body to it
  let { passedValidation, validationMsg } = ValidateData(req.body);

  let imageUrl;
  let fileExtension;
  // Check if image file is not empty
  if (!req.files) {
    passedValidation = false;
    validationMsg.imageUrl = "Please select a file to upload.";
  } 
  else {
    // Validate image file type
    imageUrl = req.files.imageUrl.name;
    fileExtension = imageUrl.substring(imageUrl.lastIndexOf('.')).toLowerCase();

    // Check if the file extension is allowed
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowedExtensions.includes(fileExtension)) {
      passedValidation = false;
      validationMsg.imageUrl = "Only JPG, JPEG, PNG, and GIF files are allowed.";
    }
  }
  
  // if validation is passed, save it to the database
  if (passedValidation) {
    // check if the same meal kit title already exists
    mealKitsModel.findOne({ 
      title: title })
      .then(duplicated => {
        // display warning message if the same meal kit already exists
        if (duplicated) {
          validationMsg.title = "Same title already exists. Try to use another one.";
          res.render("mealkits/add", {
            title: "Add a meal kit",
            values: req.body,
            validationMsg
          });
        }
        else {
          // Save to database if no duplicate meal kit exists
          const newMealKit = new mealKitsModel(
            { title, includes, description, category, price, cookingTime, servings, imageUrl, featuredMealKit });
          
          newMealKit.save()
            // successful saved the meal kit
            .then(mealKitSaved => {
                // create a unique name for the picture
                const picture = req.files.imageUrl;
                const uniqueName = `mealkit-${mealKitSaved._id}${fileExtension}`;  
                // copy the image data to a file on the system
                picture.mv(`assets/images/meal-kits-pics/${uniqueName}`)
                  // successful copy the image 
                  .then(() => { 
                    // update the unique file name on the database
                    mealKitsModel.updateOne({ _id: mealKitSaved._id }, { imageUrl: uniqueName })
                    .then(() => { 
                      // successful update the image URL on the database
                      console.log("Successful updated the image URL");
                      res.redirect("/mealkits/list");
                    })
                    .catch(err => {
                      console.error(`Error updating the image URL: ${err}`);
                      res.redirect("/list");
                    });
                  })
                  .catch(err => {
                    console.error(`Error copying the image to system: ${err}`);
                    res.redirect("/list");
                  });
            })
            // fail to save the meal kit
            .catch(err => {
              console.error(`Error saving the meal kit to database: ${err}`);
              res.status(500).render("general/error", {
                title: "Error",
                message: "Failed to save meal kit to the database"
              });              
            });
        }
      })
      // Unsuccessful to search duplicate meal kits
      .catch(err => {
        console.error(err);
        res.status(500).render("general/error", {
          title: "Error",
          message: "Failed to search duplicate meal kits in the database"
        });
      }); 
  }
  // fail to pass validation
  else {
      res.render("mealkits/add", { 
        title: "Add a meal kit",
        values: req.body,
        validationMsg
    });
  }
}); 

// GET route to edit the meal kit
router.get("/edit/:id", (req, res) => {
  const userType = req.session.user ? req.session.user.userType : undefined;
  // ensure the user is a clerk
  if (userType === "clerk") {
    // extract ID from the URL
    const mealKitId = req.params.id;
    // retrieve the meal kit from the database using its ID
    mealKitsModel.findById(mealKitId)
      .then(mealKit => {
        if (!mealKit) {
          res.status(404).render("general/error", {
            title: "Error",
            message: "404 Not Found: Meal kit not found"
          });
        }
        else {
          // successful retrieve meal kit
          res.render("mealkits/edit", {
            title: "Edit Meal Kit",
            mealKit: mealKit,
            validationMsg: {}
          });
        }
      }) 
      .catch(err => {
        console.error(`Failed to retrieve meal kit: ${err}`);
      });
  }
  else {
    // Unauthorized access if user is not clerk
    res.status(403).render("general/error", {
      title: "Error",
      message: "403: You are not authorized to view this page."
    });
  }
});

// POST route to edit and update the meal kit
/* I have updated the logic for validation, as I found my previous code in assignment 5 not working properly. */
router.post("/edit/:id", (req, res) => {
  const mealKitId = req.params.id;
  const { title, includes, description, category, price, cookingTime, servings } = req.body;
  const featuredMealKit = req.body.featuredMealKit === 'true'; // Convert string value to boolean

  // Call ValidateData function and pass req.body to it
  const { passedValidation, validationMsg } = ValidateData(req.body);

  if (passedValidation) {
    let imageCheck = true;
    // check if a new image is provided or not
    let picture = req.files ? req.files.imageUrl : null;  
    if (picture) {
      // extract file extension
      let imageUrl = picture.name;
      let fileExtension = imageUrl.substring(imageUrl.lastIndexOf('.')).toLowerCase();
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      // validate image file type
      if (!allowedExtensions.includes(fileExtension)) {
        imageCheck = false;
        validationMsg.imageUrl = "Only JPG, JPEG, PNG, and GIF files are allowed.";
      }
      // proceed to validate image file type if it's provided
      if (imageCheck) {     
        // Create a unique file name and copy to local directory
        let uniqueName = `mealkit-${mealKitId}${fileExtension}`; 
        picture.mv(`assets/images/meal-kits-pics/${uniqueName}`, (err) => {
          if (err) {
            console.error(`Failed to move image: ${err}`);
            res.status(404).render("general/error", {
              title: "Error",
              message: "Failed to update meal kit."
            });
          }
          
          // update imageUrl with the new unique name
          imageUrl = uniqueName;

          // update meal kit details in the database
          mealKitsModel.findByIdAndUpdate(mealKitId, {
            title,
            includes,
            description,
            category,
            price,
            cookingTime,
            servings,
            imageUrl,
            featuredMealKit
          }, { new: true })
            .then(() => {
              console.log("Succesfully updated meal kit");
              res.redirect("/mealkits/list");
            })
            .catch(err => {
              console.error(`Failed to update the meal kit: ${err}`);
              res.status(404).render("general/error", {
                title: "Error",
                message: "Failed to update meal kit."
              });
            });
        });
      }
    }
    else {
      // if no new file is uploaded, update meal kit details without imageUrl
        mealKitsModel.findByIdAndUpdate(mealKitId, {
          title,
          includes,
          description,
          category,
          price,
          cookingTime,
          servings,
          featuredMealKit
        }, { new: true })
          .then(() => {
            console.log("Successfully updated meal kit");
            res.redirect("/mealkits/list");
          })
          .catch(err => {
            console.error(`Failed to update the meal kit: ${err}`);
            res.status(404).render("general/error", {
              title: "Error",
              message: "Failed to update meal kit."
            });
          });
    }
  }
  else {
    // validation not passed. Render edit route with validation message.
    mealKitsModel.findById(mealKitId)
    .then((mealKit) => {
        res.render("mealkits/edit", {
            title: "Edit Meal Kit",
            mealKit: mealKit,
            values: {...req.body, _id: mealKitId },
            validationMsg: validationMsg
        });
    })
    .catch((err) => {
        console.error(`Failed to retrieve meal kit: ${err}`);
        res.status(500).render("general/error", {
          title: "Error",
          message: "500 Internal Server Error: Failed to retrieve meal kit"
        });
    });
  }  
});

function ValidateData(formData) {
  let validationMsg = {};
  let passedValidation = true;
  let message = "Required field. Please do not clear this field."

  // Check if any of the fields are empty or undefined
  if (!formData.title.trim()) {
      passedValidation = false;
      validationMsg.title = message;
  }
  if (!formData.includes.trim()) {
      passedValidation = false;
      validationMsg.includes = message;
  }
  if (!formData.description.trim()) {
      passedValidation = false;
      validationMsg.description = message;
  }
  if (!formData.category.trim()) {
      passedValidation = false;
      validationMsg.category = message;
  }
  if (formData.price <= 0.00) {
      passedValidation = false;
      validationMsg.price = "Required field. Value must be greater than 0.00";
  }
  if (formData.cookingTime <= 0) {
      passedValidation = false;
      validationMsg.cookingTime = "Required field. Value must be a non-decimal number greater than 0";
  }
  if (formData.servings <= 0) {
      passedValidation = false;
      validationMsg.servings = "Required field. Value must be a non-decimal number greater than 0";
  }
  return { passedValidation, validationMsg };
}

// GET route for confirmation when request to delete a meal kit
router.get("/remove/:id", (req, res) => {
  const userType = req.session.user ? req.session.user.userType : undefined;
  // ensure the user is a clerk
  if (userType === "clerk") {
    const mealKitId = req.params.id;
    // retrieve the meal kit from database to display its detail on the confirmation page
    mealKitsModel.findById(mealKitId)
      .then(mealKit => {
        if(!mealKit) {
          // meal kit with the provided ID is not found
          res.status(404).render("general/error", {
            title: "Error",
            message: "404 Not Found: Meal kit not found"
          });
        }
        // render the confirmation page with meal kits details
        res.render("mealkits/delete-confirmation", {
          title: "Confirm to delete meal kit",
          mealKit: mealKit
        });
      })
      .catch(err => {
        console.error(`Failed to retrieve meal kit: ${err}`);
      });

  }
  else {
    // Unauthorized access if user is not clerk
    res.status(403).render("general/error", {
      title: "Error",
      message: "403: You are not authorized to view this page."
    });
  }
});

// POST route for remove
router.post("/remove/:id", authenticateUser, (req, res) => {
  const mealKitId = req.params.id;
  // find the meal kit by ID for deletion
  mealKitsModel.findById(mealKitId)
    .then(mealKit => {
      const picture = mealKit.imageUrl;
      // delete the associated image from web server
      fs.unlink(`assets/images/meal-kits-pics/${picture}`, err => {
        if (err) {
          console.error(`Failed to delete file: ${err}`);
        }
        else {
          console.log(`File ${picture} deleted successfully.`);
        }
      });
      // delete meal kit from the database
      mealKitsModel.findByIdAndDelete(mealKitId)
        .then(deletedMealKit => {
          console.log("Meal kit successfully deleted");
          res.redirect("/mealkits/list");
        })
        .catch(err => {
          console.error(`Failed to delete meal kit in the database: ${err}`);
          res.status(500).render("general/error", {
            title: "Error",
            message: "500 Internal Server Error: Failed to delete meal kit"
          });
        });
    })
    .catch(err => {
      console.error(`Failed to find the meal kit: ${err}`);
      res.status(404).render("general/error", {
        title: "Error",
        message: "404 Not Found: Meal kit not found"
      });
    });
});

module.exports = router;
