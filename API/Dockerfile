
FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=optional

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
