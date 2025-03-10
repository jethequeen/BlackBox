#!/bin/bash

# Define database paths
EXTRACTED_DB="/tmp/Container_DB.sqlite"
LOCAL_DB="C:/BlackBox DB/DB.sqlite"

# Pull the latest code
echo "Pulling latest code from repository..."
git pull origin master

# Extract the latest database from the running container **before stopping it**
echo "Copying the database from the running container to $LOCAL_DB..."
docker cp blackbox-container:/app/Base_de_Donnees.sqlite "$EXTRACTED_DB"

# Ensure the database copy was successful
if [ ! -f "$EXTRACTED_DB" ]; then
    echo "ERROR: Failed to copy database from container!"
    exit 1
fi

# Copy the extracted database to the local Windows path
cp "$EXTRACTED_DB" "$LOCAL_DB"

echo "Database copied successfully!"

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

# Start the new container with the copied database
echo "Starting new container with the copied database..."
docker run -d -p 3000:3000 --name blackbox-container -e IN_DOCKER=true -v blackbox

echo "Update completed successfully!"
