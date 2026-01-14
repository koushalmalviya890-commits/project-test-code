FROM node:20.11.1
WORKDIR /app

COPY package*.json ./
COPY env.example ./.env

RUN npm install -f

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]