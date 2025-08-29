FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . . 
EXPOSE 10000
CMD ["npm", "run","start"]