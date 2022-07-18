#!/bin/bash
git status
git add .
git commit -m 'backup'
git push origin main
npm run electron