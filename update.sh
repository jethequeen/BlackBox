#!/bin/bash

# Define database paths
HOST_DB="K:/My Drive/DB.sqlite"
CONTAINER_DB="/tmp/Container_DB.sqlite"
MERGED_DB="C:/BlackBox/DB.sqlite"

echo "Extracting database from running container..."
docker cp blackbox-container:/app/Base_de_Donnees.sqlite "$CONTAINER_DB"

echo "Merging databases..."
sqlite3 "$HOST_DB" ".backup '$MERGED_DB'"

sqlite3 "$MERGED_DB" <<EOF
ATTACH '$CONTAINER_DB' AS container;
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
INSERT OR IGNORE INTO Accounts SELECT * FROM container.Accounts;
INSERT OR IGNORE INTO Films SELECT * FROM container.Films;
INSERT OR IGNORE INTO Genres SELECT * FROM container.Genres;
INSERT OR IGNORE INTO Crew SELECT * FROM container.Crew;
INSERT OR IGNORE INTO Cast SELECT * FROM container.Cast;
INSERT OR IGNORE INTO Sessions SELECT * FROM container.Sessions;
COMMIT;
PRAGMA foreign_keys = ON;
DETACH container;
EOF

echo "Stopping and removing old container..."
docker stop blackbox-container
docker rm blackbox-container

echo "Rebuilding Docker image..."
docker build --no-cache -t blackbox .

echo "Removing unused Docker images..."
docker image prune -f

echo "Starting new container with merged database..."
docker run -d -p 3000:3000 --name blackbox-container -e IN_DOCKER=true -v "C:/BlackBox/DB.sqlite:/app/Base_de_Donnees.sqlite" blackbox

echo "Update completed successfully!"
