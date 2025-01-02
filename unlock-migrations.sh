#!/bin/bash

# Script to unlock the SQLite database for Knex migrations

# Variables
DB_FILE="test/data/tmp/updatetest.sqlite"
KNEXFILE="knexfile.js"

# Check if the SQLite database file exists
if [ -f "$DB_FILE" ]; then
  echo "Database file found: $DB_FILE"
else
  echo "Error: Database file $DB_FILE not found."
  exit 1
fi

# Check if knexfile.js exists
if [ -f "$KNEXFILE" ]; then
  echo "Knex configuration file found: $KNEXFILE"
else
  echo "Error: Knex configuration file $KNEXFILE not found."
  exit 1
fi

# Unlock the migrations
echo "Attempting to unlock the database migrations..."
npx knex migrate:unlock --env development

# Check if the unlock was successful
if [ $? -eq 0 ]; then
  echo "Database migrations unlocked successfully."
else
  echo "Error: Failed to unlock the database migrations."
  exit 1
fi

# Optional: Verify the migration status
echo "Verifying migration status..."
npx knex migrate:status --env development

# End of script
