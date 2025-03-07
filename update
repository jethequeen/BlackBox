#!/bin/bash
git pull origin master

docker stop blackbox-container
docker rm blackbox-container

docker build -t blackbox .

docker run -d -p 3000:3000 --name blackbox-container blackbox
