var markers = [
  {
    name: "001",
    lat: -27.4785,
    lng: 153.0284,
  },
  {
    name: "002",
    lat: -27.4785,
    lng: 153.0274,
  },
  {
    name: "003",
    lat: -27.4793,
    lng: 153.0284,
  },
];

var eventSource = undefined;
var map = undefined;
var myChart = undefined;
var current_marker = undefined;
var data_current = [];
var data_x_current = [];
var options_opening = ["Open System"];
var options_closing = [
  "Stop Rain",
  "Stop Pump",
  "Stop Traffic",
  "Refresh Graph",
];
var systemlocation = document.getElementById("location");
var pumpstatus = document.getElementById("pumpstatus");
var systemname = document.getElementById("name");
var graph = document.getElementById("graph");
var buttons = document.getElementById("buttons");

function createEventSource(myChart, topic) {
  eventSource = new EventSource(`http://13.238.218.46:8000/${topic}`);
  eventSource.onmessage = function (event) {
    const process = JSON.parse(event.data);
    console.log(event.data);
    data_current.push(process);
    myChart.setOption({
      series: [
        {
          data: data_current,
        },
      ],
    });
  };
  eventSource.onerror = function () {
    //updateMessage("Server closed connection");
    eventSource.close();
  };
}

function createGraph() {
  var data_defualt = [
    { value: ["2018-08-15T10:04:01.339Z", 100] },
    { value: ["2018-08-15T10:14:13.914Z", 200] },
    { value: ["2018-08-15T10:40:03.147Z", 300] },
    { value: ["2018-08-15T11:50:14.335Z", 400] },
  ];
  var option = {
    title: {
      text: "Water Level",
    },
    xAxis: {
      type: "time",
      formatter: function (value) {
        console.log(value);
      },
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
        data: data_defualt,
      },
    ],
  };
  const line = document.createElement("div");
  line.setAttribute("id", "line");
  graph.appendChild(line);
  myChart = echarts.init(line, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  if (option && typeof option === "object") {
    myChart.setOption(option);
  }
  window.addEventListener("resize", myChart.resize);
}

function initMap() {
  const brisbane = { lat: -27.4705, lng: 153.026 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: brisbane,
  });
  markers.map((marker) => {
    const mk = new google.maps.Marker({
      position: { lat: marker.lat, lng: marker.lng },
      map: map,
      name: marker.name,
      lat: marker.lat,
      lng: marker.lng,
    });
    mk.addListener("click", () => {
      handleClickMarker(map, mk);
    });
  });
}

function setOptions(query) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      query: query,
    }),
    redirect: "follow",
  };
  return requestOptions;
}

function renderButton(element, name) {
  element.textContent = name;
  element.id = name;
  element.removeEventListener("click", clickButton, true);
  element.addEventListener("click", clickButton);
}

function handleClickButton(element, query, topic) {
  switch (query) {
    case "Open System":
      createEventSource(myChart, topic);
      renderButton(element, "Close System");
      createButtons(options_closing, topic);
      break;
    case "Close System":
      eventSource.close();
      while (buttons.firstElementChild) {
        buttons.removeChild(buttons.firstElementChild);
      }
      createButtons(options_opening, topic);
      data_current = [];
      myChart.setOption({
        series: [
          {
            data: [],
          },
        ],
      });
      break;
    case "Stop Rain":
      renderButton(element, "Open Rain");
      break;
    case "Open Rain":
      renderButton(element, "Stop Rain");
      break;
    case "Stop Pump":
      renderButton(element, "Open Pump");
      break;
    case "Open Pump":
      renderButton(element, "Stop Pump");
      break;
    case "Stop Traffic":
      renderButton(element, "Open Traffic");
      break;
    case "Open Traffic":
      renderButton(element, "Stop Traffic");
      break;
    case "Refresh Graph":
      data_current = [];
      break;
  }
  try {
    fetch("http://13.238.218.46:8000/operatingSystem", setOptions(query))
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  } catch (err) {
    console.log(err);
  } finally {
    console.log("Done");
  }
}

function createButtons(options, topic) {
  options.map((option) => {
    const button = document.createElement("button");
    button.className = "btn btn-primary";
    button.id = option;
    button.topic = topic;
    button.textContent = option;
    button.addEventListener("click", clickButton);
    buttons.appendChild(button);
  });
}

const clickButton = (e) => {
  handleClickButton(e.target, e.target.id, e.target.topic);
};

function handleClickMarker(map, marker) {
  while (systemlocation.firstElementChild) {
    systemlocation.removeChild(systemlocation.firstElementChild);
    pumpstatus.removeChild(pumpstatus.firstElementChild);
    systemname.removeChild(systemname.firstElementChild);
    graph.removeChild(graph.firstElementChild);
  }
  while (buttons.firstElementChild) {
    buttons.removeChild(buttons.firstElementChild);
  }

  const name = document.createElement("h2");
  name.textContent = "System Name: " + marker.name;
  systemname.appendChild(name);

  const location = document.createElement("h2");
  location.textContent = "System Location: " + marker.lat + " " + marker.lng;
  systemlocation.appendChild(location);

  const status = document.createElement("h2");
  status.textContent = "Pump Status: " + "Working";
  pumpstatus.appendChild(status);

  createGraph();

  createButtons(options_opening, marker.name);

  map.setZoom(18);
  map.setCenter(marker.getPosition());
}
