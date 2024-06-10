const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const mealKitsModel = require("../models/mealkitsModel");
const bcryptjs = require("bcryptjs");
const authenticateUser = require("../models/userAuth");

// route for home page
router.get("/", authenticateUser, (req, res) => {
    // load featured meal kit from database
    mealKitsModel.find()
      .then(data => {
        let mealKits = data.map(value => value.toObject());
        // filter featured meal kits
        let featured = [];
        mealKits.forEach(mealKit => {
            if (mealKit.featuredMealKit) {
                featured.push(mealKit);
            }
        });

        // Set the userType to customer, clerk, or undefined (if user not log in)
        const userType = (req.session && req.session.user && req.session.user.userType) ? req.session.user.userType : undefined;

        res.render("general/home", {
            title: "Home",
            featured,
            userType: userType
        });
      })
      .catch(err => {
        console.error(`Failed to load featured meal kits: ${err}`);
        res.status(500).render("general/error", {
            title: "Error",
            message: "500 Internal Server Error: Failed to load featured meal kits"
        });
      });
});

// route for log in page
router.get("/log-in", (req, res) => {
    res.render("general/log-in", { 
        title: "Log in",
        values: { 
            email: "", 
            password: "", 
            userType: "clerk"
        },
        validationMsg: {}
    });
});

router.post("/log-in", (req, res) => {
    const { email, password, userType } = req.body;
    let passedValidation = true;
    let validationMsg = {};
    // set the error messages if email and password are nulls or empty values
    if (!email.trim()) {
        passedValidation = false;
        validationMsg.email = "Please enter a valid email";
    }
    if (!password.trim()) {
        passedValidation = false;
        validationMsg.password = "Please enter a password";
    }
    if (userType !== "customer" && userType !== "clerk") {
        passedValidation = false;
        validationMsg.userType = "Please select the appropriate type";
    }
    // Successful validation
    if (passedValidation) {
        userModel.findOne({ email })
            .then(user => {
                // authenticate user email in database
                if (user) {
                    // compared hashed password
                    bcryptjs.compare(password, user.password)
                        // password matched
                        .then(matched => {
                            if (matched) {
                                // properly set userType in the session
                                req.session.user = {
                                    firstName: user.firstName,
                                    email: user.email,
                                    userType: userType
                                };
                                // create a session for the user
                                if (userType === "customer") {
                                    res.redirect("/cart/shopping-cart");
                                }
                                if (userType === "clerk") {
                                    res.redirect("/mealkits/list");
                                }
                            }
                            else {
                                // passwords not matched
                                validationMsg.email = "Sorry, you entered an invalid email and/or password.";
                                res.render("general/log-in", { 
                                    title: "Log in",
                                    values: req.body,
                                    validationMsg
                                })
                            }
                        })
                }
                // cannot find the user email
                else {
                    validationMsg.email = "Email is not registered.";
                    res.render("general/log-in", { 
                        title: "Log in",
                        values: req.body,
                        validationMsg
                    })
                }
            })
            .catch(err => {
                validationMsg.email = "Error in searching the database."
                console.log(`Error occurred when searching the email in database: ${err}`);
                res.render("general/log-in", { 
                    title: "Log in",
                    values: req.body,
                    validationMsg
                })
            });
    }
    // fail to pass validation
    else {
        res.render("general/log-in", { 
            title: "Log in",
            values: req.body,
            validationMsg
        });
    } 
});

// GET route for sign up page
router.get("/sign-up", (req, res) => {
    res.render("general/sign-up", { 
        title: "Sign up",
        values: { 
            firstName: "",
            lastName: "",
            email: "", 
            password: "" 
        },
        validationMsg: {}
    });
});

// POST route for sign up page
router.post("/sign-up", (req, res) => {
    console.log(req.body);
    const { firstName, lastName, email, password } = req.body;
    let passedValidation = true;
    let validationMsg = {};
    let validPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,12}$/;
    let validEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // set the error message if first name is null or empty value
    if (!firstName.trim()) {
        passedValidation = false;
        validationMsg.firstName = "Please enter your first name";
    }
    // set the error message if last name is null or empty value
    if (!lastName.trim()) {
        passedValidation = false;
        validationMsg.lastName = "Please enter your last name";
    }
    // set the error message if email is null or empty value
    if (!email.trim()) {
        passedValidation = false;
        validationMsg.email = "Please enter a valid email";
    }
    // set the error message if email is malformed
    else if (!validEmail.test(email)) {
        passedValidation = false;
        validationMsg.email = "Please enter a valid email address";
    }
    // set the error message if password is null or empty value
    if (!password.trim()) {
        passedValidation = false;
        validationMsg.password = "Please enter a password";
    }
    // set the error message if password that is NOT between 8 to 12 characters and 
    // contains at least one lowercase letter, uppercase letter, number and a symbol
    else if (!validPwd.test(password)) {
        passedValidation = false;
        validationMsg.password =
        "Password must be between 8 to 12 characters and contain at least one lowercase letter, uppercase letter, number, and symbol.";
    }
    // Passed the validation
    if (passedValidation) {
        // check if email already exists in the database
        userModel.findOne({ email: email })
            .then(user => {
                // display warning message if the same email exists in database
                if (user) {
                    validationMsg.email = "Your email address has already been registered.";
                    res.render("general/sign-up", { 
                        title: "Sign up",
                        values: req.body,
                        validationMsg
                    });
                }
                // if email does not exist in database, send email message to user and add the record to the database
                else {
                    const sgMail = require("@sendgrid/mail");
                    sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
                    const msg = {
                        to: `${email}`,
                        from: "micmicyan@gmail.com",
                        subject: "Welcome to Little Foodie",
                        html:
                            `Hello ${firstName},<br><br>
                            Welcome to Little Foodie!<br>
                            I hope you will enjoy our healthy food and seamless delivery experience.<br><br>
                            Best wishes,<br>
                            Yi Man Leung<br>
                            Founder and CEO of LittleFoodie`
                    };
            
                    sgMail.send(msg)
                        // successful send email to user
                        .then(() => {
                            res.redirect("/welcome");
                            // add user to database
                            const newUser = new userModel({ firstName, lastName, email, password });
                            newUser.save()
                            // successful added user to database
                            .then(userSaved => {
                                console.log(`User ${userSaved.firstName} has been added to the database.`);
                            })
                            // fail to add user to database
                            .catch(err => {
                                console.log(`Error occurred when adding a user to database: ${err}`);
                            });
                        })
                        // fail to send email to user
                        .catch(err => {
                            console.log(`Error occurred when sending email to user: ${err}`);
                            res.render("general/sign-up", { 
                                title: "Sign up",
                                values: req.body,
                                validationMsg
                            });
                        });
                }
            })
            // Error found when checking email existence
            .catch(err => {
                console.log(`Error occurred when checking email existence: ${err}`);
                res.render("general/sign-up", { 
                    title: "Sign up",
                    values: req.body,
                    validationMsg
                });
            });    
    }
    // fail to pass form validation
    else {
        res.render("general/sign-up", { 
            title: "Sign up",
            values: req.body,
            validationMsg
        });
    } 
});

// route for welcome page
router.get("/welcome", (req, res) => {
    res.render("general/welcome", {
        title: "Welcome"
    });
});

// route for logout page
router.get("/logout", (req, res) => {
    // clear the session from memory
    req.session.destroy();
    res.redirect("/log-in");
});

// route for error page
router.get("/error", (req, res) => {
    res.render("general/error", {
        title: "Error",
        message: ""
    });
});

module.exports = router;