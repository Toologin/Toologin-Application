#!/bin/bash
git status
git add .
git commit -m 'update'
git push origin main
npm run electron
cd release/build/
cp -v "Toologin Setup 4.6.0.exe" C:/Users/DGiang/Desktop/Toologin/Toologin.exe
cd C:/Users/DGiang/Desktop/Toologin
./Toologin.exe