const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require("mongoose");

mongoose
    .connect(
        "mongodb://admin:admin%40123@localhost:27017/product-service"
    )
    .then(() => console.log("✅Product Service DB Connected"))
    .catch((err) => console.error("❌ Some error occurred:", err));

app.use(express.json());


app.listen(PORT, () => {
    console.log(`PRODUCT_SERVICE is running on ${PORT}`);
});
