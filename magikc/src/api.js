const async = require('async');
const express = require('express');
const bodyParser = require('body-parser');
const magikc = require('./magikc');

const app = express();
app.use(bodyParser.json());

app.post('/api/create', (req, res) => {
  console.log('MAGIKC: Received request for:');
  console.log(`  Audio: ${req.body.audio}`);
  console.log(`  Image: ${req.body.image}`);
  const startTime = Date.now();
  async.parallel({
    audio: (next) => magikc.download(req.body.audio, next),
    image: (next) => magikc.download(req.body.image, next),
  }, (err, results) => {
    if (err) {
      res.sendStatus(500, err);
      return;
    }
    magikc.convert(results, (err, filepath) => {
      if (err) {
        res.sendStatus(500, err);
        return;
      }
      console.log(`MAGIKC: Encoded file written to: ${filepath}`);
      console.log(`MAGIKC: Request took ${Date.now() - startTime}ms`);
      // Call next endpoint here;
      res.send('ok');
    });
  });
});

const port = process.env.MAGIKC_PORT || 3001;
app.listen(port, () => {
  console.log(`Magikc microservice running on port ${port}!`);
});
