// Twitter ingester
// nobadmemories.com/
const request = require('request');

// Set up twitter and app credentials (See dev.twitter.com)
const Twit = require('twit');
const T = new Twit({
    consumer_key:         process.env.mytwitterconsumerkey,
    consumer_secret:      process.env.mytwitterconsumersecret,
    access_token:         process.env.mytwitteraccesstokenkey,
    access_token_secret:  process.env.mytwitteraccesstokensecret
})

// Check twitter streaming API for these words
var stream = T.stream('statuses/filter', { track: ['@thesolarra'] })

// Send data to API
stream.on('tweet', function() {

// Defining static data for now
let object = {
    "image": "https://www.nasa.gov/sites/default/files/styles/full_width_feature/public/thumbnails/image/potw1710a.jpg",
    "audio": "https://archive.org/download/radioshow_080502_planetearth/radioshow_080502_planetearth.ogg"
}

// API call
request(
    { method: 'POST',
    uri: 'http://localhost:3001/api/create',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(object)
    }
  , function (error, response, body) {
      if(response.statusCode == 200){
        console.log('Success')
      } else {
        console.log('error: '+ response.statusCode)
        console.log(body)
      }
    }
  );

});