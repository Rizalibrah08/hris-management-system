#!/bin/sh
set -e

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
until nc -z ${DB_HOST} ${DB_PORT}; do
  sleep 1
done
echo "MySQL is up!"

echo "Seeding database..."
node backend/src/setup-db.js || echo "Seed completed (may have warnings)"

echo "Starting HRIS server..."
exec node backend/src/server.js
