FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x /app/update.sh

EXPOSE 3000

RUN apt update && apt install -y sqlite3

CMD ["node", "server.js"]
