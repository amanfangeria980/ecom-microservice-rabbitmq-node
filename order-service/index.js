const express = require("express");
const amqp = require("amqplib");
const Order = require("./Order");
const isAuthenticated = require("../isAuthenticated");
const app = express();
const PORT = process.env.PORT_ONE || 9090;
const mongoose = require("mongoose");

mongoose
    .connect(
        "mongodb://admin:admin%40123@localhost:27017/order-service?authSource=admin"
    )
    .then(() => console.log("Order Service DB Connected"))
    .catch((err) => console.error("❌ Some error occurred:", err));

app.use(express.json());

let channel, connection;

async function connectToQueue() {
    try {
        const amqpServer = "amqp://admin:admin%40123@localhost:5672";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        await channel.assertQueue("ORDER");
        console.log("✅ Connected to RabbitMQ and 'ORDER' queue created");
    } catch (err) {
        console.error("❌ RabbitMQ connection error:", err);
    }
}

function createOrder(products, userEmail) {
    let total = 0;
    for (let item = 0; item < products.length; item++) {
        total += products[item].price;
    }
    const newOrder = new Order({
        products,
        userEmail,
        total_price: total,
    });
    newOrder.save();
    return newOrder;
}

connectToQueue().then(() => {
    channel.consume("ORDER", (data) => {
        console.log("Consuming ORDER queue");
        const { products, userEmail } = JSON.parse(data.content);
        const newOrder = createOrder(products, userEmail);
        channel.ack(data);
        channel.sendToQueue(
            "PRODUCT",
            Buffer.from(
                JSON.stringify({
                    newOrder,
                })
            )
        );
    });
});

app.listen(PORT, () => {
    console.log(`ORDER_SERVICE is running on ${PORT}`);
});
