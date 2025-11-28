const express = require("express");
const amqp = require("amqplib");
const Product = require("./Product");
const isAuthenticated = require("../isAuthenticated");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require("mongoose");
var order;
mongoose
    .connect(
        "mongodb://admin:admin%40123@localhost:27017/product-service?authSource=admin"
    )
    .then(() => console.log("✅Product Service DB Connected"))
    .catch((err) => console.error("❌ Some error occurred:", err));

app.use(express.json());

let channel, connection;

async function connectToQueue() {
    try {
        const amqpServer = "amqp://admin:admin%40123@localhost:5672";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue("PRODUCT");
        console.log("✅ Connected to RabbitMQ and 'PRODUCT' queue created");
    } catch (err) {
        console.error("❌ RabbitMQ connection error:", err);
    }
}
connectToQueue();

// Creat a new product
app.post("/product/create", isAuthenticated, async (req, res) => {
    const { name, description, price } = req.body;
    console.log(name, description, price);
    const newProduct = new Product({
        name,
        description,
        price,
    });
    newProduct.save();
    return res.send(newProduct);
});
// Buy a product (User sends a list of product ID's to buy)
// Creating an order with those products and a total value of sum of product's price
app.post("/product/buy", isAuthenticated, async (req, res) => {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });
    channel.sendToQueue(
        "ORDER",
        Buffer.from(
            JSON.stringify({
                products,
                userEmail: req.user.email,
            })
        )
    );
    channel.consume("PRODUCT", (data) => {
        console.log("Consuming PRODUCT queue");
        order = JSON.parse(data.content);
        channel.ack(data);
    });
    return res.json(order);
});

app.listen(PORT, () => {
    console.log(`PRODUCT_SERVICE is running on ${PORT}`);
});
