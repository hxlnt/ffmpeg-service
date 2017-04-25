// Twitter ingester
// nobadmemories.com/

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

// Then...
stream.on('tweet', function(json) {
            let object = {
                "imgURL": "https://www.nasa.gov/sites/default/files/styles/full_width_feature/public/thumbnails/image/potw1710a.jpg",
                "audioURL": "https://archive.org/download/philippe-2014/Edward%20Ka-Spel%20&%20Philippe%20Petit-Subterranean,%20Homesick%20www.mp3lio.net%20.mp3",
                "text": "Kepler-852,b"
            }
});