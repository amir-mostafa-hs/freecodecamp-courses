// index.js
// where your node app starts

// init project
const express = require("express");
const app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
const cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/:date?", (req, res) => {
  // get data from request params
  let date = req.params.date;

  // if no date is provided, use current date
  if (date === undefined) {
    date = new Date();
  }

  // if date is a number, convert to date
  if (isNaN(date) || typeof +date === 'number') {
    date = new Date(+date);
  }

  // if date is invalid, return error
  if (date == "Invalid Date") {
    res.json({ error: "Invalid Date" });
  }

  // return date in json format
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString(),
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
