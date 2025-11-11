const express = require("express");
const amqp = require("amqplib");

const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require("mongoose");

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

app.listen(PORT, () => {
    console.log(`PRODUCT_SERVICE is running on ${PORT}`);
});
