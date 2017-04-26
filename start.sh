#!/bin/bash

node /var/www/ffmpeg-service/ingest/app.js & 
/var/www/ffmpeg-service/magikc/bin/magikc.js & 
node /var/www/ffmpeg-service/tweeter-service/app.js