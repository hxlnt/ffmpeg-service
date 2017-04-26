const tweeter = require('./lib/tweet');
const express = require('express');
const bodyParser = require('body-parser'); 

tweeter.init();

const app = express();
app.use(bodyParser.json()); // for parsing application/json 


/**
 * @api {get} / Root get method but only returns hello world.
 */
app.get('/', ([...res]) => {
  res.send('Hello World');
});

 /**
  * @api {post} /api/tweet Tweets a video file 
  * @apiParam {Object} "filepath": "[PATH_TO_FILE]" Expects a JSON object that'll designate the file path of the video to be tweeted. 
  * @apiError Any errors here will return 500 caused by incrorrect JSON object filepath, or errors trying to post to twitter.
  */
app.post('/api/tweet', (req, res) => {
    const filepath = req.body.filepath;
    tweeter.tweet(filepath, (error) => {
        if (error) {
          res.status(500).send({error});
        } else {
          res.send('cool');
        }
    });
});

const port = process.env.TWEETER_PORT || 3002;
app.listen(port);
console.log('listening on: ' + port);

