const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    userType: {
        type: String,
        require: true
    },
    profilePic: String,
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

// encrypt the password before saving on MongoDB
userSchema.pre("save", function(next) {
    let user = this;

    // generate a unique SALT
    bcryptjs.genSalt()
    .then(salt => {
        bcryptjs.hash(user.password, salt)
        // if hashing is successful
        .then(hashedPwd => {
            // overwrite user passwords with hashed passwords
            user.password = hashedPwd;
            // tell Mongo to go ahead to next when it's done
            next();
        })
        // unsuccessful hashing
        .catch(err => {
            console.log(`Error occurred when hashing: ${err}`);
        });
    })
    .catch(err => {
        console.log(`Error occurred when salting: ${err}`);
    });
});

// create a model using the schema
const userModel = mongoose.model("users", userSchema);

module.exports = userModel;