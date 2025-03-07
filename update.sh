#!/bin/bash

# Define the database path (adjust as needed)
DB_PATH="K:\My Drive\Base de Donnees.sqlite"
BACKUP_PATH="C:\BlackBox\Base de Donnees.sqlite"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Ensure the backup directory exists
mkdir -p "$BACKUP_PATH"

rsync -ah --progress "$DB_PATH" "$BACKUP_PATH/database_$TIMESTAMP.sqlite"
sync

# Copy the database before pulling changes
cp -r "$DB_PATH" "$BACKUP_PATH"

git pull origin master

docker stop blackbox-container
docker rm blackbox-container

docker build -t blackbox .

docker run -d -p 3000:3000 --name blackbox-container blackbox
