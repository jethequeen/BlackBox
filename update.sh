#!/bin/bash

# Define database paths (use quotes for spaces)
DB_PATH="/k/My Drive/DB.sqlite"
BACKUP_DIR="/c/BlackBox/"
BACKUP_FILE="$BACKUP_DIR/DB.sqlite"

# Ensure the backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
fi

# Backup the database (use cp instead of rsync for Windows Git Bash)
echo "Backing up database..."
cp "$DB_PATH" "$BACKUP_FILE"

# Ensure the copy operation is complete
sync
sleep 2  # Optional delay to ensure file is written completely

echo "Backup complete: $BACKUP_FILE"

# Pull the latest code
echo "Pulling latest code from repository..."
git pull origin master

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
docker run -d -p 3000:3000 --name blackbox-container -e IN_DOCKER=true -v "K:/My Drive/DB.sqlite:/app/Base_de_Donnees.sqlite" blackbox

echo "Update completed successfully!"
