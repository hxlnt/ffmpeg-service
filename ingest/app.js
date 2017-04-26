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

request(
    { method: 'GET',
    uri: 'https://api.cognitive.microsoft.com/bing/v5.0/search?q=exoplanet&mkt=en-us',
    headers: { "Content-Type": "application/json",'Ocp-Apim-Subscription-Key': process.env.bingsearchkey }
  }, function (error, response, body) {
    if(response.statusCode == 200){
      const images = JSON.parse(body).images;
      // let randimg = Math.floor(Math.random() * images.value.length);
      let randimg = 1;
      image = images.value[randimg].contentUrl;
      // API call
        request(
            { method: 'POST',
            uri: 'http://localhost:3001/api/create',
            port: 3001,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              image,
              audio: "https://archive.org/download/radioshow_080502_planetearth/radioshow_080502_planetearth.ogg"
            })
            }
          , function (error, response, body) {
              if (error) {
                console.log('error: ' + error);
              } else if(response.statusCode == 200){
                console.log('Success')
              } else {
                console.log('error: '+ response.statusCode)
                console.log(body)
              }
            }
          );
    }
    else {console.log(`ERROR: ${error}`)}
  }
);
});