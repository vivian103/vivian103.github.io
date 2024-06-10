// Set up a middleware to check user authentication to specific pages.
// Customer authorized to access: /shopping-cart, /check-out
// Clerk authorized to access: mealkits/list, mealkits/add, mealkits/delete-confirmation, load-data/mealkits

const authenticateUser = (req, res, next) => {
    // Define pages that require authorization based on user type
    const authorizedPages = {
        "/shopping-cart": "customer",
        "/check-out": "customer",
        "/list": "clerk",
        "/add": "clerk",
        "/delete-confirmation": "clerk",
        "/mealkits": "clerk"
    };

    // Check if the requested page requires authorization
    const userTypeRequired = authorizedPages[req.path];

    // If the requested page requires authorization
    if (userTypeRequired && req.path !== "/" && req.path !== "/on-the-menu") {
        // Check if the user is logged in
        if (!req.session || !req.session.user) {
            res.status(403).render("general/error", {
                title: "Error",
                message: "403: You are not authorized to view this page."
            });
        } else {
            // Check if the user type is authorized for the requested page
            const { userType } = req.session.user;
            if (userType !== userTypeRequired) {
                res.status(403).render("general/error", {
                    title: "Error",
                    message: "403: You are not authorized to view this page."
                });
            } else {
                // User is authorized, proceed to the next middleware
                next();
            }
        }
    } else {
        // For pages that do not require authorization, proceed to the next middleware
        next();
    }
};

module.exports = authenticateUser;