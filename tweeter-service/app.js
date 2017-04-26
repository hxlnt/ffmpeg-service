
var Twit = require('twit');
var express = require('express');
var bodyParser = require('body-parser'); 


var app = express();
app.use(bodyParser.json()); // for parsing application/json 

//ENV variables
var options = {
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: process.env.access_token,
    access_token_secret: process.env.access_token_secret,
    timeout_ms: 60*1000  // optional HTTP request timeout to apply to all requests.
}

//Twitter
var T = new Twit(options);

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
  
    //Posts media to twitter in chunks
    T.postMediaChunked({ file_path: req.body.filepath }, function (err, data, response) {
         
         if(err){
             res.status(500).send({ error: 'Something failed with chunking the media. You probably messed up the filepath object.' });
             console.log(err);
         }
          var mediaIdStr = data.media_id_string;
          var altText = "Small flowers in a planter on a sunny balcony, blossoming.";
          var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

          T.post('media/metadata/create', meta_params, function (err, data, response) {
            if (!err) {

                // now we can reference the media and post a tweet (media will attach to the tweet)
                var params = { status: 'Hop in bith, we\'re going to the solar system', media_ids: [mediaIdStr] };

                 T.post('statuses/update', params, function (err, data, response) {
                    if(err){
                        res.sendStatus(500, err);
                        return;
                    }
                    res.send("cool");
               })
            }
            else{
                res.sendStatus(500, err);
            }
        })
    })

});

var port = process.env.TWEETER_PORT || 3002;
app.listen(port);

