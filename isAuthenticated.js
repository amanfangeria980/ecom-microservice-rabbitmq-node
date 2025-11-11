const jwt = require("jsonwebtoken");

export async function isAuthenticated(req, res, next) {
    const token = req.headers["Authorization"].split(" ")[1];
    jwt.verify(token, "secret123", (err, user) => {
        if (err) {
            return res.json({ message: err });
        } else {
            req.user = user;
            next();
        }
    });
}
