const spawn = require('child_process').spawn;
const os = require('os');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');

const rootDir = path.join(os.tmpdir(), 'magikc');
if (!fs.existsSync(rootDir)) {
  fs.mkdirSync(rootDir);
}

module.exports = {
  magikc
};

// 512mb max
// 2m 20 seconds max
// filename is guid

// {
//   image: url;
//   audio: url;
// } => gif

//ffmpeg -loop 1 -i /mnt/c/Users/brhugh/Downloads/Sailor_saturn.jpg -i /mnt/c/Users/brhugh/Downloads/output.mp3 -c:v libx264 -c:a aac -b:a 192k -shortest out.mp4
// /mnt/c/Users/brhugh/Downloads/output.mp3
// /mnt/c/Users/brhugh/Downloads/Sailor_saturn.jpg

function magikc({ image, audio }, cb) {

  let errored = false;
  const outputPath = path.join(rootDir, `${uuid()}.mp4`);
  const ffmpeg = spawn('ffmpeg', [ '-loop', '1', '-i', image, '-i', audio, '-shortest', outputPath ], { stdio: 'inherit' });

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
