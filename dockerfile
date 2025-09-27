# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port (change if your .env uses a different port)
EXPOSE 5000

# Set environment variables (override in production as needed)
ENV NODE_ENV=production

# Start the application

CMD ["npm", "start"]