require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors(), express.json(), express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = {}

app.post("/api/shorturl", (req, res) => {
  const url = new URL(req.body.url)
  const options = {
    all: true,
  };
  dns.lookup(url.hostname, options, (err, addresses) => {
    if (err) {
      res.json({ error: "invalid URL" })
    } else {
      const shortUrl = addresses[0].address.split(".").join("")
      urlDatabase[shortUrl] = req.body.url
      res.json({ original_url: req.body.url, short_url: shortUrl })
    }
  })
})

app.get("/api/shorturl/:shortUrl", (req, res) => {
  if (urlDatabase[req.params.shortUrl]) {
    res.redirect(urlDatabase[req.params.shortUrl])
  } else {
    res.json({ error: 'invalid url' })
  }
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
