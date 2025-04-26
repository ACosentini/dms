FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# Install envsubst utility
RUN apk add --no-cache bash gettext

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy startup script
COPY start-nginx.sh /start-nginx.sh
RUN chmod +x /start-nginx.sh

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:80 || exit 1
EXPOSE 80

# Use the startup script as entrypoint
CMD ["/start-nginx.sh"] 