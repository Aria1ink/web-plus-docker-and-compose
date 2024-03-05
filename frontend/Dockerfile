FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . ./
RUN npm run build

FROM nginx:alpine as frontend
WORKDIR /app
COPY --from=builder /app/build /usr/share/nginx/html
COPY ./nginx/conf.d /etc/nginx/conf.d

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]