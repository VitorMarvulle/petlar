# Use Node 18 (Alpine is fine, but slim is sometimes more compatible with Metro)
FROM node:18-alpine

WORKDIR /app

# 1. Install global utilities if needed (optional, but good for debugging)

# 2. Copy package definitions first (better caching)
COPY package.json package-lock.json ./

# 3. Install dependencies
RUN npm install

# 4. Copy the rest of the source code
COPY . .

# Expose the ports
EXPOSE 3000 19000 19001 8081

# Set environment variables
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# 3. UPDATE the command. Change "0.0.0.0" to "lan"
CMD ["npx", "expo", "start", "--web", "--host", "lan"]