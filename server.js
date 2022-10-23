const express = require("express");
const app = express();
const mqtt = require("mqtt");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(cors());

const port = 8000;

app.get("/:system", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  const system = req.params.system;
  // make a connection
  const mqttClient = mqtt.connect("mqtt://13.238.218.46", {
    username: "rsp1",
    password: "123456",
  });
  // set subscribe topic
  mqttClient.on("connect", function () {
    console.log("Client_sub connected to Mqtt broker");
    mqttClient.subscribe("project/pump/" + system);
  });
  mqttClient.on("message", function (topic, message) {
    value = message.toString();
    console.log("Received response from pump client: ", message.toString());
    res.write(`data: ${message.toString()}\n\n`);
  });
  res.on("close", () => {
    console.log("Client_sub closed connection");
    mqttClient.end();
    res.end();
  });
});

app.post("/operatingSystem", (req, res) => {
  try {
    let response = req.body.query;
    const mqttClient1 = mqtt.connect("mqtt://13.238.218.46", {
      username: "rsp1",
      password: "123456",
    });
    mqttClient1.on("connect", function () {
      console.log("Client_pub connected to Mqtt broker");
    });
    switch (response) {
      case "Open System":
        mqttClient1.publish("project/admin/rain", "on");
        mqttClient1.publish("project/admin/pump", "on");
        mqttClient1.publish("project/admin/traffic", "on");
        break;
      case "Close System":
        mqttClient1.publish("project/admin/rain", "off");
        mqttClient1.publish("project/admin/pump", "off");
        mqttClient1.publish("project/admin/traffic", "off");
        break;
      case "Stop Rain":
        mqttClient1.publish("project/admin/rain", "off");
        break;
      case "Stop Pump":
        mqttClient1.publish("project/admin/pump", "off");
        break;
      case "Stop Traffic":
        mqttClient1.publish("project/admin/traffic", "off");
        break;
      case "Open Rain":
        mqttClient1.publish("project/admin/rain", "on");
        break;
      case "Open Pump":
        mqttClient1.publish("project/admin/pump", "on");
        break;
      case "Open Traffic":
        mqttClient1.publish("project/admin/traffic", "restart");
        break;
    }
    mqttClient1.end();
    console.log("Client_sub closed connection");
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(404).send("null");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
