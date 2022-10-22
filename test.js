const express = require("express");
const mqtt = require("mqtt");
const mqttClient = mqtt.connect("mqtt://13.55.32.170", {
  username: "rsp1",
  password: "123456",
});

mqttClient.on("connect", function () {
  console.log("Client connected to Mqtt broker");
  mqttClient.subscribe("project/#");
});

mqttClient.on("message", function (topic, message) {
  value = message.toString();
  console.log(
    "Received response from server:-",
    message.toString(),
    topic.toString()
  );
});

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

var i = 0;

const test = async () => {
  while (true) {
    await sleep(3000);
    var today = new Date();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    i = i + 1;
    const num = Math.random().toString();
    const str = { value: [today, num] };
    console.log(str);
    mqttClient.publish("001", JSON.stringify(str));
  }
};

test();
i = 0;
