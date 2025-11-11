const User = require("./User");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT_ONE || 7070;
const mongoose = require("mongoose");

mongoose
    .connect(
        "mongodb://admin:admin%40123@localhost:27017/auth-service?authSource=admin"
    )
    .then(() => console.log("✅ Auth Service DB Connected"))
    .catch((err) => console.error("❌ Some error occurred:", err));

app.use(express.json());

// Register Route
app.post("/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.json({ message: "User already exists" });
    } else {
        const newUser = new User({
            name,
            email,
            password,
        });
        newUser.save();
        return res.json(newUser);
    }
});

// Login

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "User doesn't exist" });
    } else {
        // Check is user entered the corret password or not
        if (password !== user.password) {
            return res.json({ message: "Wrong Password" });
        }
        const payload = {
            email,
            name: user.name,
        };
        jwt.sign(payload, "secret123", (err, token) => {
            if (err) {
                console.log(err);
                return res.json({ message: "Token generation failed" });
            } else {
                return res.json({ token: token });
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`AUTH_SERVICE is running on ${PORT}`);
});
