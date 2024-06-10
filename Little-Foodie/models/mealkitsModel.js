const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const mealKitsSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    includes: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    cookingTime: {
        type: Number,
        require: true
    },
    servings: {
        type: Number,
        require: true
    },
    imageUrl: {
        type: String,
        require: true,
        dateCreated: {
            type: Date,
            default: Date.now()
        }
    },
    featuredMealKit: {
        type: Boolean,
        require: true
    }
});

const mealKitsModel = mongoose.model("mealkits", mealKitsSchema);
module.exports = mealKitsModel;

