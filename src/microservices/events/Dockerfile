# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm i --no-audit --no-fund
COPY src ./src
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 8082
CMD ["node", "dist/main.js"]