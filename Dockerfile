# develop stage
FROM node:20.11-alpine as node-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

# production stage
FROM nginx:1.25.4-alpine
COPY --from=node-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]