const async = require('async');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const magikc = require('./magikc');

const app = express();
app.use(bodyParser.json());

app.post('/api/create', (req, res) => {
  console.log('MAGIKC: Received request for:');
  console.log(`  Audio: ${req.body.audio}`);
  console.log(`  Image: ${req.body.image}`);
  console.log(`  Username: ${req.body.username}`);
  const startTime = Date.now();
  res.send('ok');
  async.parallel({
    audio: (next) => magikc.download(req.body.audio, next),
    image: (next) => magikc.download(req.body.image, next),
  }, (err, results) => {
    if (err) {
      return;
    }
    magikc.convert(results, (err, filepath) => {
      if (err) {
        return;
      }
      console.log(`MAGIKC: Encoded file written to: ${filepath}`);
      request({
        method: 'POST',
        uri: 'http://localhost:3002/api/tweet',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          filepath,
          username: req.body.username
        })
      }, (err, rres, body) => {
        console.log(`MAGIKC: Request took ${Date.now() - startTime}ms`);
      });
    });
  });
});

const port = process.env.MAGIKC_PORT || 3001;
app.listen(port, () => {
  console.log(`Magikc microservice running on port ${port}!`);
});
