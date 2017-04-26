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
  async.parallel({
    audio: (next) => magikc.download(req.body.audio, next),
    image: (next) => magikc.download(req.body.image, next),
  }, (err, results) => {
    if (err) {
      res.sendStatus(500, err);
      return;
    }
    console.log('MAGIKC: Intermediate files written to:');
    console.log(`  Audio: ${results.audio}`);
    console.log(`  Image: ${results.image}`);
    magikc.convert(results, (err, filepath) => {
      if (err) {
        res.sendStatus(500, err);
        return;
      }
      console.log(`MAGIKC: Encoded file written to: ${filepath}`);
      // Call next endpoint here;
      res.send('ok');
    });
  });
});

const port = process.env.MAGIKC_PORT || 3001;
app.listen(port, () => {
  console.log(`Magikc microservice running on port ${port}!`);
});
