const spawn = require('child_process').spawn;
const os = require('os');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');
const request = require('request');
const async = require('async');

const WIDTH = 640;
const HEIGHT = 480;

const MAX_LENGTH = 30;

const rootDir = path.join(os.tmpdir(), 'magikc');
if (!fs.existsSync(rootDir)) {
  fs.mkdirSync(rootDir);
}

module.exports = {
  convert,
  download
};

function download(uri, cb) {
  const outputPath = path.join(rootDir, path.basename(uri));
  fs.exists((outputPath), (exists) => {
    if (exists) {
      console.log(`MAGIKC: Reusing cached file ${outputPath}`);
      cb(null, outputPath);
      return;
    }
    console.log(`MAGIKC: Caching intermediate file to ${outputPath}`);
    request.get(uri).pipe(fs.createWriteStream(outputPath))
      .on('error', cb)
      .on('finish', () => cb(null, outputPath));
  });
}

function convert({ image, audio }, cb) {
  let errored = false;
  const outputPath = path.join(rootDir, `${uuid()}.mp4`);
  const args = [ '-loop', '1', '-i', image, '-i', audio, '-t', MAX_LENGTH, '-vf', `scale=${WIDTH}:ih*${WIDTH}/iw, crop=${WIDTH}:${HEIGHT}`, '-shortest', outputPath ];
  const ffmpeg = spawn('ffmpeg', args);

  ffmpeg.on('error', (err) => {
    if (!errored) {
      cb(err);
      ffmpeg.kill();
      errored = true;
    }
  });

  ffmpeg.on('close', (code) => {
    if (errored) {
      return;
    }
    if (code) {
      cb(`Exited with code ${code}`);
    }
    cb(null, outputPath);
  });
}
