# Build stage
FROM node:18 AS build
WORKDIR /app

# Increase max old space size and set NODE_OPTIONS
ENV NODE_OPTIONS=--max_old_space_size=8192

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy entire project
COPY . .

# Build with increased memory and production flag
RUN npm run build --configuration=prod

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/* /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]