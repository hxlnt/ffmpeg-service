const Twit = require('twit');
let T;

module.exports.init = () => {
  // ENV variables
  const options = {
    consumer_key:         process.env.mytwitterconsumerkey,
    consumer_secret:      process.env.mytwitterconsumersecret,
    access_token:         process.env.mytwitteraccesstokenkey,
    access_token_secret:  process.env.mytwitteraccesstokensecret,
    timeout_ms: 60*1000  // optional HTTP request timeout to apply to all requests.
  }
  // new Twitter connection
  T = new Twit(options);
};

module.exports.tweet = (username, filepath, callback) => {
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
          const params = { status: `@${username} escape your world with Sun Ra #hackchi`, media_ids: [mediaIdStr] };

          T.post('statuses/update', params, (err) => {
            return callback(err);
          });
      } else {
        return callback(err);
      }
    });
  })
};