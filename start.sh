#!/bin/bash

node ingest/app.js & 
./magikc/bin/magikc.js & 
node tweeter-service/app.js