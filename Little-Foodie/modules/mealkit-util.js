var mealkits = [
    {
        title: "Burrito Bowl",
        includes: "with Avocado, chickpea and brown rice",
        description: "Freshly grilled meat served in a delicious bowl with rice, beans, and topped with guac, salsa, queso blanco, and cheese.",
        category: "School Lunch",
        price: 16.75,
        cookingTime: 25,
        servings: 1,
        imageUrl: "burrito-bowl.jpg",
        featuredMealKit: true
    },
    {
        title: "Thai Soup Noodles",
        includes: "with shrimp and eggs",
        description: "A fragrant, homemade chicken broth filled with noodles, shrimp, eggs, vegetables, and topped with crispy fried red shallots.",
        category: "Family Favourite",
        price: 16.15,
        cookingTime: 15,
        servings: 1,
        imageUrl: "seafood-noodles.jpg",
        featuredMealKit: false
    },
    {
        title: "Cheeseburger",
        includes: "with french fries",
        description: "A Fresh Canadian beef patty topped with melted cheese slice and cheese sauce.",
        category: "School Lunch",
        price: 10.75,
        cookingTime: 15,
        servings: 1,
        imageUrl: "burger-fries.jpg",
        featuredMealKit: true
    },
    {
        title: "Sandwiches box",
        includes: "with a selection of grapes, tangerine and honey dates",
        description: "Featuring Canadian farm-raised turkey, topped with cheddar cheese, lettuce, tomatoes and red onions. Snacks include grapes, tangerine and honey dates.",
        category: "School Lunch",
        price: 17.75,
        cookingTime: 10,
        servings: 1,
        imageUrl: "sandwiches-box.jpg",
        featuredMealKit: true
    },
    {
        title: "Pomodoro Pasta",
        includes: "with basil",
        description: "Fresh tomato sauce and fresh basil.",
        category: "Family Favourite",
        price: 12.80.toFixed(2),
        cookingTime: 10,
        servings: 1,
        imageUrl: "tomato-speghetti.jpg",
        featuredMealKit: true
    },
    {
        title: "Butter Chicken Rice Bowl",
        includes: "with a side salad",
        description: "Chicken in a rich butter sauce served with basmati rice and a side salad.",
        category: "School Lunch",
        price: 14.80.toFixed(2),
        cookingTime: 15,
        servings: 1,
        imageUrl: "curry-rice.jpg",
        featuredMealKit: false
    },
    {
        title: "Veggie delight salad",
        includes: "with cold pressed juice",
        description: "Broccoli, carrot, zucchini, red pepper, couscous, dressing with cilantro lime vinaigrette",
        category: "School Lunch",
        price: 12.99,
        cookingTime: 5,
        servings: 1,
        imageUrl: "veggie-salad.jpg",
        featuredMealKit: true
    },
    {
        title: "Penne Alfredo",
        includes: "with garlic bread",
        description: "Penne in rich and creamy Alfredo sauce topped with fresh Parmesan cheese.",
        category: "Family Favourite",
        price: 14.99,
        cookingTime: 15,
        servings: 1,
        imageUrl: "penne-alfredo.jpg",
        featuredMealKit: true
    }
];

module.exports.initialData = mealkits;


// functions only used for previous assignments
/*
module.exports.getAllMealKits = function() {
    return mealkits;
}

module.exports.getFeaturedMealKits = function(mealkits) {
    let featured = [];
    mealkits.forEach(function(mealkit) {
        if (mealkit.featuredMealKit) {
            featured.push(mealkit);
        }
    });
    return featured;
}

module.exports.getMealKitsByCategory = function(mealkits) {
    const categories = {};
    mealkits.forEach(mealkit => {
        // check if the category already exists in the categories object
        if (!categories[mealkit.category]) {
            // create an empty array for the new category
            categories[mealkit.category] = [];
        }
        // group the mealkit of the same category in the array
        categories[mealkit.category].push(mealkit);
    });
    // create an array to hold the categories object and mealkits
    const result = [];
    for (const category in categories) {
        result.push({ categoryName: category, mealkits: categories[category] });
    }
    return result;
}
*/
