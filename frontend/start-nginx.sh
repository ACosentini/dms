#!/bin/sh

# Replace environment variables in nginx config
if [ -n "$BACKEND_URL" ]; then
  echo "Using backend URL: $BACKEND_URL"
  # Strip trailing slash if present
  BACKEND_URL=$(echo $BACKEND_URL | sed 's/\/$//')
  envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
else
  echo "WARNING: BACKEND_URL environment variable not set. Using default backend URL."
  BACKEND_URL="http://localhost:8080"
  envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Create certificate directory if it doesn't exist
mkdir -p /etc/nginx/certs

# Start nginx
echo "Starting nginx..."
nginx -g "daemon off;" 