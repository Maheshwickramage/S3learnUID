FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

COPY . .

RUN mkdir -p uploads/zips uploads/previews uploads/videos

EXPOSE 5001

CMD ["npm", "start"]
