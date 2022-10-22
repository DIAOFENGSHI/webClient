const eventSource = new EventSource("http://localhost:8000");

function updateMessage(message) {
  const list = document.getElementById("messages");
  const item = document.createElement("p");
  item.textContent = message;
  list.appendChild(item);
}

var dom = document.getElementById("container");
var myChart = echarts.init(dom, null, {
  renderer: "canvas",
  useDirtyRect: false,
});
var app = {};

var option;

function randomData() {
  now = new Date(+now + oneDay);
  value = value + Math.random() * 21 - 10;
  return {
    name: now.toString(),
    value: [
      [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("/"),
      Math.round(value),
    ],
  };
}
let data = [
  { value: [4, 500] },
  { value: [5, 700] },
  { value: [6, 900] },
  { value: [7, 800] },
  { value: [8, 900] },
  { value: [9, 100] },
  { value: [11, 777] },
  { value: [23, 44] },
  { value: [34, 553] },
  { value: [56, 333] },
  { value: [67, 55] },
  { value: [45, 66] },
  { value: [345, 777] },
];
let data2 = [];
let now = new Date(1997, 9, 3);
let oneDay = 24 * 3600 * 1000;
let value = Math.random() * 1000;
option = {
  title: {
    text: "Dynamic Data & Time Axis",
  },
  xAxis: {
    type: "time",
  },
  yAxis: {
    type: "value",
    boundaryGap: [0, "100%"],
  },
  series: [
    {
      name: "Fake Data",
      type: "line",
      // showSymbol: false,
      data: data,
    },
  ],
};

eventSource.onmessage = function (event) {
  updateMessage(event.data);
  console.log(typeof event.data);
  const process = JSON.parse(event.data);
  data2.push(process);
  myChart.setOption({
    series: [
      {
        data: data2,
      },
    ],
  });
};

//setInterval(function () {}, 1000);

if (option && typeof option === "object") {
  myChart.setOption(option);
}

window.addEventListener("resize", myChart.resize);

eventSource.onerror = function () {
  //updateMessage("Server closed connection");
  eventSource.close();
};
