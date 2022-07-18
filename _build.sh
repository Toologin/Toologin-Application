#!/bin/bash
export DOCKER_SCAN_SUGGEST=false
docker build -t dinhgiang/share-tools-frontend . && \
docker tag dinhgiang/share-tools-frontend:latest 025340181271.dkr.ecr.us-west-2.amazonaws.com/dinhgiang/share-tools-frontend:latest && \
docker push 025340181271.dkr.ecr.us-west-2.amazonaws.com/dinhgiang/share-tools-frontend:latest
