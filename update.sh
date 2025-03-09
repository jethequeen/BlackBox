#!/bin/bash

# Convert Windows path to a Docker-compatible path
DB_SOURCE=$(wslpath -a "K:\My Drive\DB.sqlite")

echo "Pulling latest code from repository..."
git pull origin master

echo "Stopping and removing the old Docker container..."
docker stop blackbox-container
docker rm blackbox-container

echo "Rebuilding Docker image..."
docker build -t blackbox .

# Ensure the database exists before copying
if [ -f "$DB_SOURCE" ]; then
    echo "Copying the latest database into Docker volume..."
    docker run --rm -v blackbox_db:/data -v "$DB_SOURCE:/mnt/k/DB.sqlite" alpine sh -c "cp -f '/mnt/k/DB.sqlite' '/data/DB.sqlite'"
else
    echo "❌ Error: Source database file ($DB_SOURCE) not found!"
    exit 1
fi

echo "Starting new container with updated database..."
docker run -d --restart unless-stopped -p 3000:3000 \
    --name blackbox-container -v blackbox_db:/app blackbox

echo "✅ Update completed successfully!"
