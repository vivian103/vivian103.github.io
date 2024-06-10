const express = require("express");
const router = express.Router();
const mealKitsModel = require("../models/mealkitsModel");
const authenticateUser = require("../models/userAuth");

// Find a meal kit from the database. Return true if it's found
const findMealKit = function (id) {
    return mealKitsModel.findById(id)
      .then(mealKit => {
        if (!mealKit) {
            console.error(`Meal kit not found: ${err}`);
        }
        return mealKit;
      })
      .catch(err => {
        console.error(`Error: ${err}`);
      });
}

const prepareView = function (req, res, message) {
    let viewModel = {
        message, 
        hasMealKits: false,
        cartTotal: 0,
        mealKits: []
    };
    // Get the shopping cart from the session
    let cart = req.session.cart || [];
    
    // check if the cart has meal kits
    viewModel.hasMealKits = cart.length > 0;
    if (viewModel.hasMealKits) {
        // if there are meal kits in the cart, calculate the total
        let cartTotal = 0;
        cart.forEach(cartMealKit => {
            cartTotal += cartMealKit.mealKit.price * cartMealKit.qty;
        });
        viewModel.cartTotal = cartTotal;
        viewModel.mealKits = cart;
    }
    res.render("cart/shopping-cart", {
        title: "Cart",
        viewModel
    });  
};

// route for cart page
router.get("/shopping-cart", authenticateUser, (req, res) => {
    prepareView(req, res);
});

// route to add a meal kit in the cart
router.get("/add-mealkit/:id", (req, res) => {
    let message;
    const userType = req.session.user ? req.session.user.userType : undefined;

    // ensure user is customer
    if (userType === "customer") {
        let cart = req.session.cart = req.session.cart || [];

        // extract ID from the URL
        const mealKitId = req.params.id;
    
        // find meal kit in the database
        findMealKit(mealKitId)
          .then(mealKit => {
            // search the shopping cart to see if the meal kit is already added
            let found = false
            cart.forEach(cartMealKit => {
                if (cartMealKit.id == mealKitId) {
                    found = true;
                    cartMealKit.qty++; // increase quantity by 1
                }
            });
            // Meal kit already exists in the cart. Add 1 to the quantity
            if (found) {
                message = `Updated the quantity of "${mealKit.title}".`
            }
            else {
                // create a new cart object and add it to the cart
                cart.push({
                    id: mealKitId,
                    qty: 1,
                    mealKit: mealKit
                });
                message = `"${mealKit.title}" was added to the cart.`;
            }
            prepareView(req, res, message);
          })
          .catch(err => {
            console.error(err);
          });
    }
    else {
        // Unauthorized access if user is not customer
        res.status(403).render("general/error", {
            title: "Error",
            message: "403: You are not authorized to view this page."
        });
    }   
});

// route to remove a meal kit in the cart
router.get("/remove-mealkit/:id", (req, res) => {
    let message;
    const userType = req.session.user ? req.session.user.userType : undefined;

    // ensure the user is customer
    if (userType === "customer") {
        // Retrieve the shopping cart from the session
        let cart = req.session.cart || [];

        // extract ID from the URL
        const mealKitId = req.params.id;

        // find meal kit in the database
        findMealKit(mealKitId)
          .then(mealKit => {
            // Search for the meal kit in the cart
            const index = cart.findIndex(item => item.id == mealKitId);

            // If the meal kit is found in the cart, remove it
            if (index >= 0) {
                message = `"${mealKit.title}" was removed from the cart.`;
                cart.splice(index, 1);
            }
            prepareView(req, res, message);
          })
          .catch(err => {
            console.error(`Error: ${err}`)
          });
    }
    else {
        // Unauthorized access if user is not customer
        res.status(403).render("general/error", {
            title: "Error",
            message: "403: You are not authorized to view this page."
        });
    }
});

// route to check-out the user
router.get("/check-out", authenticateUser, (req, res) => {
    let message;
    let cart = req.session.cart || [];
    if (cart.length > 0) {       
        // Get the email from the logged-in user
        const email = req.session.user.email;
        const firstName = req.session.user.firstName;

        // Construct the order details for the email body
        let orderSummary = "";
        cart.forEach(item => {
            orderSummary += `Title: ${item.mealKit.title}<br>`;
            orderSummary += `Includes: ${item.mealKit.includes}<br>`;
            orderSummary += `Price: $${item.mealKit.price}<br>`;
            orderSummary += `Quantity: ${item.qty}<br><br>`;
        });

        // Send an email with the cart information
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
        const msg = {
            to: email,
            from: "micmicyan@gmail.com",
            subject: "Thank you for shopping with Little Foodie",
            html:
                `Hello ${firstName},<br><br>
                Thank you for your order on Little Foodie!<br><br>
                Order summary:<br>
                ${orderSummary}`
        };   
            sgMail.send(msg)
                .then(() => {
                    // clear out the cart without log-out the user
                    req.session.cart = [];
                    message = "Checked out is completed. You can continue to add items to the cart.";
                    prepareView(req, res, message);
                })
                .catch(err => {
                    console.error(err);
                });       
    }
    else {
        message = "Your cart is empty. Please add items to proceed.";
        prepareView(req, res, message);
    }
});

module.exports = router;
