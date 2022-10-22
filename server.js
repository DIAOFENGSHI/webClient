const express = require("express");
const app = express();
const mqtt = require("mqtt");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(cors());

const port = 8000;
let i = 0;

app.get("/:topic", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  const topic = req.params.topic;
  // stop the connect of MQTT
  // make a connection
  var mqttClient = mqtt.connect("mqtt://13.55.32.170");
  // set subscribe topic
  mqttClient.subscribe(topic);
  mqttClient.on("connect", function () {
    console.log("Client connected to Mqtt broker");
    // Subscribe to the response topic
    mqttClient.subscribe(topic);
  });

  mqttClient.on("message", function (topic, message) {
    value = message.toString();
    // message is Buffer
    console.log("Received response from server:-", message.toString());
    res.write(`data: ${message.toString()}\n\n`);
  });

  //   const intervalId = setInterval(() => {
  //     const data = Math.random();
  //     res.write(`data: ${data}\n\n`);
  //   }, 1000);

  res.on("close", () => {
    console.log("Client closed connection");
    //clearInterval(intervalId);
    mqttClient.end();
    res.end();
  });
});

app.post("/operatingSystem", (req, res) => {
  try {
    console.log(req.body);
    let response = req.body.query;
    var mqttClient = mqtt.connect("mqtt://13.55.32.170");
    switch (response) {
      case "Open System":
        mqttClient.publish("project/admin/rain", "on");
        mqttClient.publish("project/admin/pump", "on");
        mqttClient.publish("project/admin/traffic", "on");
        res.status(200).send("good");
        break;
      case "Close System":
        mqttClient.publish("project/admin/rain", "off");
        mqttClient.publish("project/admin/pump", "off");
        mqttClient.publish("project/admin/traffic", "off");
        res.status(200).send("good");
        break;
      case "Stop Rain":
        mqttClient.publish("project/admin/rain", "off");
        res.status(200).send("good");
        break;
      case "Stop Pump":
        mqttClient.publish("project/admin/pump", "off");
        res.status(200).send("good");
        break;
      case "Stop Traffic":
        mqttClient.publish("project/admin/traffic", "off");
        res.status(200).send("good");
        break;
      case "Open Rain":
        mqttClient.publish("project/admin/rain", "on");
        res.status(200).send("good");
        break;
      case "Open Pump":
        mqttClient.publish("project/admin/pump", "on");
        res.status(200).send("good");
        break;
      case "Open Traffic":
        mqttClient.publish("project/admin/traffic", "on");
        res.status(200).send("good");
        break;
    }
  } catch (err) {
    console.log(err);
    res.status(404).send("null");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
