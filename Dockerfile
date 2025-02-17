FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm install -g typescript ts-node && npm install 
COPY . .
RUN npm run build 
RUN chmod +x dist/dokugen.js
ENTRYPOINT ["node", "dist/dokugen.js"]