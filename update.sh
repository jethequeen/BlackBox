#!/bin/bash

DB_SOURCE="/k/My Drive/DB.sqlite"

echo "Pulling latest code from repository..."
git pull origin master

echo "Stopping and removing the old Docker container..."
docker stop blackbox-container
docker rm blackbox-container

echo "Rebuilding Docker image..."
docker build -t blackbox .

# Ensure the database exists before copying
if [ -f "$DB_SOURCE" ]; then
    echo "Copying the latest database into Docker container..."
    docker run -d --name temp-container blackbox sleep 5  # Start a temp container
    docker cp "$DB_SOURCE" temp-container:/app/DB.sqlite  # Copy the file
    docker commit temp-container blackbox  # Save the changes
    docker rm -f temp-container  # Remove temp container
else
    echo "❌ Error: Source database file ($DB_SOURCE) not found!"
    exit 1
fi

echo "Starting new container with updated database..."
docker run -d --restart unless-stopped -p 3000:3000 \
    --name blackbox-container -v blackbox_db:/app blackbox

echo "✅ Update completed successfully!"
