# --- Base image ---
    FROM node:20-alpine as base

    # --- Dependencies stage ---
    FROM base AS deps
    WORKDIR /app
    COPY package*.json ./
    RUN npm install --production=false
    
    # --- Build stage ---
    FROM deps AS build
    WORKDIR /app
    COPY . .
    RUN npm run build
    
    # --- Runtime stage ---
    FROM node:20-alpine AS runtime
    WORKDIR /app
    
    # Copy only the required output for running
    COPY --from=build /app/build ./build
    COPY package*.json ./
    
    # Install only production deps
    RUN npm install --omit=dev
    
    EXPOSE 3000
    
    CMD ["node", "build"]
    