#!/bin/bash

# Define database paths (use quotes for spaces)
DB_PATH="/k/My Drive/DB.sqlite"
BACKUP_DIR="/c/BlackBox/"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/DB.sqlite"

echo "Backup complete: $BACKUP_FILE"

# Pull the latest code
echo "Pulling latest code from repository..."
git pull origin master

# Extract the latest database from the running container **before stopping it**
echo "Copying the database from the running container to $LOCAL_DB..."
docker cp blackbox-container:/app/Base_de_Donnees.sqlite "$EXTRACTED_DB"

sync
# Stop and remove the old container
echo "Stopping and removing the old Docker container..."
docker stop blackbox-container
docker rm blackbox-container

# Rebuild the Docker image
echo "Rebuilding Docker image..."
docker build --rm -t blackbox .

# Remove dangling images (old unused images labeled <none>)
echo "Removing unused Docker images..."
docker image prune -f

# Start the new container with the database inside
echo "Starting new container with database..."
docker run -d -p 3000:3000 --name blackbox-container -v "$DB_PATH:/app/Base_de_Donnees.sqlite" blackbox

echo "Update completed successfully!"
