# STAGE 1: Build the React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# STAGE 2: Build the Node.js Backend ---
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 3: Final Production Image ---
FROM node:20-alpine
WORKDIR /app

# Install only production dependencies for the server
COPY package*.json ./
RUN npm install --omit=dev

# 1. Copy the compiled backend (from Stage 2)
COPY --from=backend-builder /app/dist ./dist

# 2. Copy the compiled frontend (from Stage 1) into the 'public' folder
# This matches the 'app.use(express.static(...))' in your index.ts
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]