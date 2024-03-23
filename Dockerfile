# develop stage
FROM node:20.11-alpine as node-stage
WORKDIR /app
COPY . .
RUN npm install

RUN npm run build

# production stage
FROM nginx:1.25.4-alpine
COPY --from=node-stage /app/dist /usr/share/nginx/html
COPY --from=node-stage /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]