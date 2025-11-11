const jwt = require("jsonwebtoken");

async function isAuthenticated(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.json({ message: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.json({ message: "Token missing" });
        }

        jwt.verify(token, "secret123", (err, user) => {
            if (err) {
                return res.json({ message: err });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("JWT verification error:", error);
        res.json({ message: "Internal server error" });
    }
}

module.exports = isAuthenticated;
