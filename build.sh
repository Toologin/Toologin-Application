#!/bin/bash
npm run build:renderer
cd release/app/dist/renderer
bash push.sh