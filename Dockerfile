# Version 0.0.1
FROM ubuntu:16.04
MAINTAINER Suz Hinton noopkat@gmail.com

# set up os tools
RUN rm -rf /var/lib/apt/lists/*
RUN apt-get clean && apt-get update
RUN apt-get install curl git libav-tools x264 x265 ffmpeg -y
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash - 
RUN apt-get install -y nodejs -y

# set up project
RUN mkdir /var/www
RUN git clone https://github.com/hxlnt/ffmpeg-service.git /var/www/ffmpeg-service
RUN cd /var/www/ffmpeg-service/magikc && npm install
RUN cd /var/www/ffmpeg-service/tweeter-service && npm install
RUN cd /var/www/ffmpeg-service/ingest && npm install
RUN chmod +x /var/www/ffmpeg-service/start.sh
# lol line endings
RUN sed -i -e 's/\r$//' /var/www/ffmpeg-service/start.sh

ENTRYPOINT '/var/www/ffmpeg-service/start.sh'
