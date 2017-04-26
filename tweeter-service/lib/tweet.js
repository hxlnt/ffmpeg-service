const Twit = require('twit');
let T;

module.exports.init = () => {
  //ENV variables
  const options = {
      consumer_key: process.env.consumer_key,
      consumer_secret: process.env.consumer_secret,
      access_token: process.env.access_token,
      access_token_secret: process.env.access_token_secret,
      timeout_ms: 60*1000  // optional HTTP request timeout to apply to all requests.
  }
  // new Twitter connection
  T = new Twit(options);
};

module.exports.tweet = (filepath, callback) => {
  //Posts media to twitter in chunks
  T.postMediaChunked({ file_path: filepath }, (err, data) => {
        
        if (err) {
          console.log(err);
          return callback(new Error('Something failed with chunking the media. You probably messed up the filepath object.'))  
        }

        const mediaIdStr = data.media_id_string;
        const altText = 'cool generative video with random text and imagery';
        const meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

        T.post('media/metadata/create', meta_params, (err) => {
          if (!err) {
              // now we can reference the media and post a tweet (media will attach to the tweet)
              const params = { status: 'Here\'s a nice video for you', media_ids: [mediaIdStr] };

              T.post('statuses/update', params, (err) => {
                return callback(err);
              });
          } else {
            return callback(err);
          }
      })
  })
};