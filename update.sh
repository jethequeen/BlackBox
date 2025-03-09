#!/bin/bash

echo "Pulling latest code from repository..."
git pull origin master

echo "Stopping and removing the old Docker container..."
docker stop blackbox-container
docker rm blackbox-container

echo "Rebuilding Docker image..."
docker build -t blackbox .

echo "Ensuring Docker volume exists..."
docker volume create blackbox_db

echo "Copying the latest database into Docker volume..."
docker run --rm -v blackbox_db:/data -v "/k/My Drive:/mnt/k" alpine sh -c "cp -f '/mnt/k/DB.sqlite' '/data/DB.sqlite'"

echo "Starting new container with updated database..."
docker run -d --restart unless-stopped -p 3000:3000 \
    --name blackbox-container -v blackbox_db:/app/DB.sqlite blackbox

echo "Update completed successfully!"
