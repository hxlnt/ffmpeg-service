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
const MIN_OFFSET = 10;
const MAX_OFFSET = 240;

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
  const filename = `${hashFilePath(image)}-${hashFilePath(audio)}.mp4`;
  const intermediate = path.join(rootDir, filename);
  const final = path.join(rootDir, 'h' + filename);

  fs.exists(final, (exists) => {
    if (exists) {
      console.log('exit: exists');
      cb(null, final);
      return;
    }

    const offset = Math.round(Math.random() * (MAX_OFFSET - MIN_OFFSET) + MIN_OFFSET);
    const args = [ '-loop', '1', '-i', image, '-i', audio, '-t', MAX_LENGTH, '-strict', '-2', '-ss', '60', '-r', '30', '-c:v', 'libx264', '-c:a', 'aac', '-b:v', '1M', '-vf', `crop=${WIDTH}:${HEIGHT}`, '-shortest', intermediate ];
    console.log(args.join('  '));
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
      const handbrake = spawn('HandBrakeCLI', ['-i', intermediate, '-o', final, '-e', 'x264', '-q', '20', '-B', '160', '-r', '30'])
        .on('error', cb)
        .on('close', (code) => {
          if (code) {
            cb(code);
            return;
          }
          cb(null, final);
        });
    });
  });
}
