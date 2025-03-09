#!/bin/bash

# Pull the latest code
echo "Pulling latest code from repository..."
git pull origin master

# Stop and remove the old container
echo "Stopping and removing the old Docker container..."
docker stop blackbox-container
docker rm blackbox-container

# Rebuild the Docker image
echo "Rebuilding Docker image..."
docker build --no-cache -t blackbox .

# Remove dangling images (old unused images labeled <none>)
echo "Removing unused Docker images..."
docker image prune -f

# Start the new container with the database inside
echo "Starting new container with database..."
docker run -d -p 3000:3000 --name blackbox-container -e IN_DOCKER=true -v "//k/My Drive/DB.sqlite:/app/Base_de_Donnees.sqlite" blackbox

echo "Update completed successfully!"
