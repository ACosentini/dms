FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:80 || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 