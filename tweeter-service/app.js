var tweeter = require('./lib/tweet');
var express = require('express');
var bodyParser = require('body-parser'); 

tweeter.init();

var app = express();
app.use(bodyParser.json()); // for parsing application/json 


/**
 * @api {get} / Root get method but only returns hello world.
 */
app.get('/', function (req, res) {
  res.send('Hello World');
});

 /**
  * @api {post} /api/tweet Tweets a video file 
  * @apiParam {Object} "filepath": "[PATH_TO_FILE]" Expects a JSON object that'll designate the file path of the video to be tweeted. 
  * @apiError Any errors here will return 500 caused by incrorrect JSON object filepath, or errors trying to post to twitter.
  */
app.post('/api/tweet', function (req, res) {
    console.log(req.body);
    var filepath = req.body.filepath;
    tweeter.tweet(filepath, function(error) {
        if (error) {
          res.status(500).send({error});
        } else {
          res.send('cool');
        }
    });
});

var port = process.env.TWEETER_PORT || 3002;
app.listen(port);
console.log('listening on: ' + port);

