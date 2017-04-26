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
    "audio": "https://archive.org/download/philippe-2014/Edward%20Ka-Spel%20&%20Philippe%20Petit-Subterranean,%20Homesick%20www.mp3lio.net%20.mp3"
}

// API call
request(
    { method: 'PUT',
    uri: 'api/create',
    port: 3001,
    headers: { 'content-type': 'application/json' },
    body: object
    }
  , function (error, response, body) {
      if(response.statusCode == 201){
        console.log('Success')
      } else {
        console.log('error: '+ response.statusCode)
        console.log(body)
      }
    }
  );

});