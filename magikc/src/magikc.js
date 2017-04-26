const spawn = require('child_process').spawn;
const os = require('os');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');
const request = require('request');
const async = require('async');
const crypto = require('crypto');

const WIDTH = 640;
const HEIGHT = 480;

const MAX_LENGTH = 5;
const MIN_OFFSET = 60;
const MAX_OFFSET = 60 * 60;

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

function hashFilePath(filepath) {
  const hash = crypto.createHash('md5');
  hash.update(filepath);
  return hash.digest('hex');
}

function convert({ image, audio }, cb) {
  let errored = false;
  const outputPath = path.join(rootDir, `${hashFilePath(image)}-${hashFilePath(audio)}.mp4`);

  fs.exists(outputPath, (exists) => {
    if (exists) {
      console.log('exit: exists');
      cb(null, outputPath);
      return;
    }

    const offset = Math.round(Math.random() * (MAX_OFFSET - MIN_OFFSET) + MIN_OFFSET);
    const args = [ '-loop', '1', '-i', image, '-i', audio, '-ss', offset , '-t', MAX_LENGTH, '-vf', `crop=${WIDTH}:${HEIGHT}`, '-strict', '-2', '-shortest', outputPath ];
    const ffmpeg = spawn('ffmpeg', args, { stdio: 'inherit' });

    ffmpeg.on('error', (err) => {
      if (!errored) {
        console.log('exit: on error');
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
        console.log('exit: exited with code');
        cb(`Exited with code ${code}`);
        return;
      }
      console.log('exit: normal');
      cb(null, outputPath);
    });
  });
}
