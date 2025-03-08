#!/bin/bash

echo "Pulling latest code from repository..."
git pull origin master

echo "Stopping and removing the old Docker container..."
docker stop blackbox-container
docker rm blackbox-container

echo "Rebuilding Docker image..."
docker build -t blackbox .

echo "Copying the latest database into Docker volume..."
docker run --rm -v blackbox_db:/data -v "/k/My Drive/DB.sqlite:/tmp/DB.sqlite" alpine sh -c "cp -f /tmp/DB.sqlite /data/Base_de_Donnees.sqlite"

echo "Starting new container with updated database..."
docker run -d --restart unless-stopped -p 3000:3000 \
    --name blackbox-container -v blackbox_db:/app/Base_de_Donnees.sqlite blackbox

echo "Update completed successfully!"
