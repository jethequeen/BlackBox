#!/bin/bash

# Define database paths
HOST_DB="/K/My Drive/DB.sqlite"
CONTAINER_DB="/app/Base_de_Donnees.sqlite"
TEMP_MERGED_DB="/C/BlackBox DB/DB.sqlite"

# Pull the latest code
echo "Pulling latest code from repository..."
git pull origin master

# Merge changes from both databases **before stopping the container**
echo "Extracting the latest database from the running container..."
docker cp blackbox-container:/app/Base_de_Donnees.sqlite /tmp/Container_DB.sqlite

echo "Merging changes from container and host databases..."

# Create a temporary merged database from the host database
sqlite3 "$HOST_DB" ".backup '$TEMP_MERGED_DB'"

# Attach both databases and dynamically merge all tables
sqlite3 "$TEMP_MERGED_DB" <<EOF
ATTACH '/tmp/Container_DB.sqlite' AS container_db;
PRAGMA foreign_keys = OFF;  -- Temporarily disable foreign keys for safe merging
BEGIN TRANSACTION;

-- Generate and execute dynamic INSERT queries
SELECT 'INSERT INTO ' || name || ' SELECT * FROM container_db.' || name ||
' WHERE NOT EXISTS (SELECT 1 FROM ' || name || ' WHERE rowid = container_db.' || name || '.rowid);'
FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';

COMMIT;
PRAGMA foreign_keys = ON;  -- Re-enable foreign keys
DETACH container_db;
EOF

echo "Database merge completed. Copying merged DB back to host location..."
cp "$TEMP_MERGED_DB" "$HOST_DB"

# Now stop the container AFTER merging is complete
echo "Stopping and removing the old Docker container..."
docker stop blackbox-container
docker rm blackbox-container

# Rebuild the Docker image
echo "Rebuilding Docker image..."
docker build --no-cache -t blackbox .

# Remove dangling images (old unused images labeled <none>)
echo "Removing unused Docker images..."
docker image prune -f

# Start the new container with the merged database
echo "Starting new container with merged database..."
docker run -d -p 3000:3000 --name blackbox-container -e IN_DOCKER=true -v "//c/BlackBox DB/DB.sqlite:/app/Base_de_Donnees.sqlite" blackbox

echo "Update completed successfully!"
